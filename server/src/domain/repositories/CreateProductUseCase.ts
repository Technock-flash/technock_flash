import type { IProductRepository, CreateProductInput } from "../../../domain/repositories/IProductRepository";
import type { ICategoryRepository } from "../../../domain/repositories/ICategoryRepository"; // Assuming this exists
import type { IProductListCache } from "../../../domain/ports/IProductListCache"; // As mentioned in ARCHITECTURE.md
import { AppError } from "../../../shared/errors/AppError";
import { Product } from "../../../domain/entities/Product";

export interface CreateProductRequest extends Omit<CreateProductInput, "vendorId"> {
  // vendorId will be supplied from the authenticated user context
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository,
    private readonly productListCache: IProductListCache
  ) {}

  async execute(data: CreateProductRequest, vendorId: string): Promise<Product> {
    // 1. Validate business rules
    const categoryExists = await this.categoryRepository.findById(data.categoryId);
    if (!categoryExists) {
      throw new AppError("Category not found", 400);
    }

    // 2. Prepare data for persistence
    const productInput: CreateProductInput = {
      ...data,
      vendorId,
    };

    // 3. Execute persistence via repository
    const product = await this.productRepository.create(productInput);

    // 4. Invalidate cache to reflect the new product
    await this.productListCache.invalidate();

    // 5. Return the result
    return product;
  }
}