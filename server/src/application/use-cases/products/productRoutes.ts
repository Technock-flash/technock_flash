import { Router } from "express";
import type { RequestHandler } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { validate } from "../../../presentation/http/middlewares/validate";
import { prisma } from "../../../infrastructure/database/prismaClient";
import { createProductSchema } from "../../../application/use-cases/products/product.schema";
import { upload } from "../../../presentation/http/middlewares/multer";

export function createProductRoutes(auth: RequestHandler, requireVendor: RequestHandler): Router {
  const router = Router();

  // Create Product
  // POST /api/products
  router.post(
    "/",
    auth,
    requireVendor,
    upload.array("images"),
    validate(createProductSchema),
    asyncHandler(async (req, res) => {
      // 1. Get current user ID from the auth token
      const userId = (req as any).user.sub;

      // 2. Find the vendor profile associated with this user
      // We assume a user can own a vendor profile (1-to-1 or similar)
      const vendor = await prisma.vendor.findFirst({
        where: { userId },
        select: { id: true }
      });

      if (!vendor) {
        // 403 Forbidden is appropriate if the user is authenticated but not a vendor
        res.status(403).json({ error: "You must have a vendor profile to create products." });
        return;
      }

      // 3. Prepare payload
      // validate() middleware has already coerced strings to numbers for price/stock
      const { name, description, priceCents, stock, categoryId } = req.body;

      // Handle Image Uploads
      const files = req.files as Express.Multer.File[] | undefined;
      const newImageUrls = files?.map((file) => `/uploads/${file.filename}`) || [];

      // 4. Create in Database
      const product = await prisma.product.create({
        data: {
          name,
          description,
          priceCents: Number(priceCents),
          inStock: Number(stock),
       // Handle optional string as null for Prisma
          images: newImageUrls,
          vendorId: vendor.id,
          moderationStatus: "PENDING", // Enforce moderation workflow
        },
      });

      res.status(201).json(product);
    })
  );

  // Update Product (Patch)
  router.patch(
    "/:id",
    auth,
    requireVendor,
    upload.array("images"),
    // Use partial schema for updates so not all fields are required
    validate(createProductSchema.partial()),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const userId = (req as any).user.sub;

      // Verify ownership: Product must belong to a vendor owned by this user
      const existingProduct = await prisma.product.findFirst({
        where: { 
          id,
          vendor: { userId } 
        }
      });

      if (!existingProduct) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      // Handle Image Uploads
      const files = req.files as Express.Multer.File[] | undefined;
      const newImageUrls = files?.map((file) => `/uploads/${file.filename}`) || [];

      // Handle Image Removals
      let imagesToRemove = req.body.imagesToRemove;
      if (imagesToRemove && !Array.isArray(imagesToRemove)) {
        imagesToRemove = [imagesToRemove];
      }
      const removeSet = new Set(imagesToRemove || []);

      const existingImages = existingProduct.images || [];
      const finalImages = [...existingImages.filter((url) => !removeSet.has(url)), ...newImageUrls];

      // Extract fields
      const { name, description, priceCents, stock, categoryId } = req.body;

      const dataToUpdate: any = {};
      if (name) dataToUpdate.name = name;
      if (description) dataToUpdate.description = description;
      if (priceCents !== undefined) dataToUpdate.priceCents = Number(priceCents);
      if (stock !== undefined) dataToUpdate.inStock = Number(stock);
      if (categoryId) dataToUpdate.categoryId = categoryId || null;
      
      dataToUpdate.images = finalImages;

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: dataToUpdate,
      });

      res.json(updatedProduct);
    })
  );

  // Delete Product
  router.delete(
    "/:id",
    auth,
    requireVendor,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const userId = (req as any).user.sub;

      const count = await prisma.product.count({
        where: { 
          id,
          vendor: { userId } 
        }
      });

      if (count === 0) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      // The Prisma middleware for soft-deletes will intercept this call,
      // converting it to an update that sets the `deletedAt` field.
      await prisma.product.delete({ where: { id } });
      res.status(204).send();
    })
  );

  return router;
}