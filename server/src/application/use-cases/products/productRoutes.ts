import { Router } from "express";
import type { RequestHandler } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { prisma } from "../../../infrastructure/database/prismaClient";
import { createProductSchema } from "../../../application/use-cases/products/product.schema";

export function createProductRoutes(auth: RequestHandler, requireVendor: RequestHandler): Router {
  const router = Router();

  // Create Product
  // POST /api/products
  router.post(
    "/",
    auth,
    requireVendor,
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
      const { name, description, price, instock, categoryId, images } = req.body;

      // 4. Create in Database
      const product = await prisma.product.create({
        data: {
          name,
          description,
          priceCents: price,
          inStock: instock,
          categoryId: categoryId || null, // Handle optional string as null for Prisma
          images: images || [],
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

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: req.body,
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