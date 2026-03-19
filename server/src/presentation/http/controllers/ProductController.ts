import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../../infrastructure/database/prismaClient";
import type { CreateProductUseCase } from "../../../application/use-cases/products/CreateProductUseCase";
import type { ListProductsUseCase } from "../../../application/use-cases/products/ListProductsUseCase";
import type { IFileUploader } from "../../../domain/ports/IFileUploader";
import type { ProductDto } from "@zimmarket/shared";
import { AppError } from "../../../shared/errors/AppError";

export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly fileUploader: IFileUploader
  ) {}

  private toDto(product: any): ProductDto {
    // The product object is a raw Prisma model, potentially with includes.
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceCents: product.priceCents,
      stock: product.inStock ?? 0,
      images: product.images ?? [], // `images` is a string array on the Product model
      // Take the first categoryId if categories were included in the query
      categoryId: product.categories?.[0]?.categoryId,
      vendorId: product.vendorId,
      moderationStatus: product.moderationStatus,
      isPublished: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  private async getVendorIdFromRequest(req: Request): Promise<string> {
    const user = (req as any).user;
    if (!user?.sub) {
      throw new AppError("Authentication required", 401);
    }

    let vendorId = user.vendorId;

    if (!vendorId) {
      const vendor = await prisma.vendor.findUnique({
        where: { ownerId: user.sub },
        select: { id: true },
      });
      vendorId = vendor?.id;
    }

    if (!vendorId) {
      throw new AppError("User is not a vendor or vendor profile not found", 403);
    }

    return vendorId;
  }

  private processProductPayload(body: any): Record<string, any> {
    const { isPublished, images, ...restOfBody } = body;

    const parseIntSafe = (value: any): number | undefined => {
      if (value === undefined || value === null || String(value).trim() === "") {
        return undefined;
      }
      const parsed = parseInt(String(value), 10);
      return isNaN(parsed) ? undefined : parsed;
    };

    const data: Record<string, any> = {
      ...restOfBody,
      priceCents: parseIntSafe(body.priceCents),
      compareAtCents: parseIntSafe(body.compareAtCents),
      stock: parseIntSafe(body.stock),
    };

    if (isPublished !== undefined) {
      data.isActive = String(isPublished) === "true";
    }

    // Remove properties that are undefined so they don't overwrite existing values during an update
    Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

    return data;
  }

  private async handleImageUploads(
    files: Express.Multer.File[] | undefined,
    existingImagesBody: string | string[] | undefined
  ): Promise<string[] | undefined> {
    const newImageUrls = files && files.length > 0 ? await this.fileUploader.uploadMany(files) : [];

    let parsedExistingImages: string[] = [];
    if (typeof existingImagesBody === "string") {
      try {
        const parsed = JSON.parse(existingImagesBody);
        if (Array.isArray(parsed)) parsedExistingImages = parsed;
      } catch {
        /* ignore invalid JSON */
      }
    } else if (Array.isArray(existingImagesBody)) {
      parsedExistingImages = existingImagesBody;
    }

    const finalImages = [...parsedExistingImages, ...newImageUrls];

    return finalImages.length > 0 ? finalImages : undefined;
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // /api/products accepts multipart form-data (images + fields).
      // multer populates req.files and req.body (as strings).
      const createProductSchema = z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        priceCents: z.coerce.number().int().min(0),
        compareAtCents: z.coerce.number().int().min(0).optional(),
        inStock: z.coerce.number().int().min(0).optional(),
        sku: z.string().optional(),
      });

      const parsed = createProductSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const user = (req as any).user as { sub?: string } | undefined;
      if (!user?.sub) {
        throw new AppError("Authentication required", 401);
      }

      const files = req.files as Express.Multer.File[] | undefined;
      const imageUrls = files && files.length > 0 ? await this.fileUploader.uploadMany(files) : [];

      const product = await this.createProductUseCase.execute({
        ...parsed.data,
        vendorOwnerId: user.sub,
        images: imageUrls,
      } as any);

      res.status(201).json(this.toDto(product));
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: productId } = req.params;
      const user = (req as any).user as { sub?: string } | undefined;
      if (!user?.sub) throw new AppError("Authentication required", 401);

      const vendorId = await this.getVendorIdFromRequest(req);

      const existing = await prisma.product.findFirst({
        where: { id: productId, vendorId },
      });

      if (!existing) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      const updateSchema = z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        priceCents: z.coerce.number().int().min(0).optional(),
        compareAtCents: z.coerce.number().int().min(0).optional(),
        inStock: z.coerce.number().int().min(0).optional(),
        sku: z.string().optional(),
      });

      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const files = req.files as Express.Multer.File[] | undefined;
      const newImageUrls =
        files && files.length > 0 ? await this.fileUploader.uploadMany(files) : [];

      const imagesToRemoveRaw = (req.body as any).imagesToRemove ?? (req.body as any)["imagesToRemove[]"];
      const imagesToRemove = Array.isArray(imagesToRemoveRaw)
        ? imagesToRemoveRaw
        : typeof imagesToRemoveRaw === "string"
          ? [imagesToRemoveRaw]
          : [];

      const removeSet = new Set(imagesToRemove.filter(Boolean));
      const existingImages = existing.images ?? [];
      const finalImages = [...existingImages.filter((u) => !removeSet.has(u)), ...newImageUrls];

      const dataToUpdate: any = {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
        ...(parsed.data.priceCents !== undefined ? { priceCents: parsed.data.priceCents } : {}),
        ...(parsed.data.compareAtCents !== undefined ? { compareAtCents: parsed.data.compareAtCents } : {}),
        ...(parsed.data.inStock !== undefined ? { inStock: parsed.data.inStock } : {}),
        ...(parsed.data.sku !== undefined ? { sku: parsed.data.sku } : {}),
        images: finalImages,
      };

      const updated = await prisma.product.update({
        where: { id: productId },
        data: dataToUpdate,
        include: {
          categories: { select: { categoryId: true } }
        },
      });

      res.json(this.toDto(updated));
    } catch (error) {
      next(error);
    }
  };

  deleteImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: productId } = req.params;
      const user = (req as any).user as { sub?: string } | undefined;
      if (!user?.sub) throw new AppError("Authentication required", 401);

      const vendorId = await this.getVendorIdFromRequest(req);

      const existing = await prisma.product.findFirst({
        where: { id: productId, vendorId },
      });

      if (!existing) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      const imagesToRemoveRaw = (req.body as any).imagesToRemove ?? (req.body as any)["imagesToRemove[]"];
      const imagesToRemove = Array.isArray(imagesToRemoveRaw)
        ? imagesToRemoveRaw
        : typeof imagesToRemoveRaw === "string"
          ? [imagesToRemoveRaw]
          : [];

      const removeSet = new Set(imagesToRemove.filter(Boolean));
      const finalImages = (existing.images ?? []).filter((u) => !removeSet.has(u));

      const updated = await prisma.product.update({
        where: { id: productId },
        data: { images: finalImages },
        include: {
          categories: { select: { categoryId: true } }
        },
      });

      res.json(this.toDto(updated));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          categories: {
            select: { categoryId: true },
          },
        },
      });

      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      res.status(200).json(this.toDto(product));
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit, offset, isPublished, vendorId, categoryId } = req.query;
      const user = (req as any).user;

      const queryOptions: { limit?: number; offset?: number; isActive?: boolean; vendorId?: string; categoryId?: string } = {
        ...(limit ? { limit: parseInt(String(limit), 10) } : {}),
        ...(offset ? { offset: parseInt(String(offset), 10) } : {}),
        ...(isPublished !== undefined ? { isActive: String(isPublished) === 'true' } : {}),
        ...(categoryId ? { categoryId: String(categoryId) } : {}),
      };

      // If an authenticated vendor is making the request, scope results to their products.
      if (user?.role === 'VENDOR' && user.sub) {
        const vendor = await prisma.vendor.findUnique({
          where: { ownerId: user.sub },
          select: { id: true },
        });

        // If for some reason the vendor record doesn't exist for a vendor user,
        // return an empty list to prevent leaking other products.
        if (!vendor) {
          res.status(200).json({ items: [], total: 0 });
          return;
        }

        // Force the vendorId filter, ignoring any from query params for security.
        queryOptions.vendorId = vendor.id;
      } else if (vendorId) {
        // For public requests, use the vendorId from query if provided.
        queryOptions.vendorId = String(vendorId);
      }

      const where: any = {};
      if (queryOptions.vendorId) where.vendorId = queryOptions.vendorId;
      if (queryOptions.isActive !== undefined) where.isActive = queryOptions.isActive;
      if (queryOptions.categoryId) {
        where.categories = { some: { categoryId: queryOptions.categoryId } };
      }

      const [products, total] = await prisma.$transaction([
        prisma.product.findMany({
          where,
          include: {
            categories: { select: { categoryId: true } },
          },
          take: queryOptions.limit ?? 20,
          skip: queryOptions.offset ?? 0,
          orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where }),
      ]);

      const productDtos = products.map((p) => this.toDto(p));
      res.status(200).json({ items: productDtos, total });
    } catch (error) {
      next(error);
    }
  };
}