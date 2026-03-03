import type { Request, Response } from "express";
import type { ListProductsUseCase } from "../../../application/use-cases/products/ListProductsUseCase";
import type { GetProductUseCase } from "../../../application/use-cases/products/GetProductUseCase";
import type { CreateProductUseCase } from "../../../application/use-cases/products/CreateProductUseCase";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().min(0),
  compareAtCents: z.number().int().min(0).optional(),
  inStock: z.number().int().min(0).optional(),
  sku: z.string().optional()
});

export class ProductController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly createProductUseCase: CreateProductUseCase
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.query.vendorId as string | undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : undefined;

    const categoryId = req.query.categoryId as string | undefined;
    const products = await this.listProductsUseCase.execute({
      vendorId,
      categoryId,
      limit,
      offset
    });
    res.json(products);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const product = await this.getProductUseCase.execute(req.params.id);
    res.json(product);
  };

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten().fieldErrors });
      return;
    }

    const user = req.user!;

    const product = await this.createProductUseCase.execute({
      name: parsed.data.name,
      description: parsed.data.description,
      priceCents: parsed.data.priceCents,
      compareAtCents: parsed.data.compareAtCents,
      inStock: parsed.data.inStock,
      sku: parsed.data.sku,
      vendorOwnerId: user.sub
    });
    res.status(201).json(product);
  };
}
