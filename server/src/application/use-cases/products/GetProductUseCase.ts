import type { IProductRepository } from "../../../domain/repositories/IProductRepository";
import type { Product } from "../../../domain/entities/Product";
import { AppError } from "../../../shared/errors/AppError";

export class GetProductUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(id: string): Promise<Product> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }
}
