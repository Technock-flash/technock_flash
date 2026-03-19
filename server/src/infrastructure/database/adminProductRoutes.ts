import { Router } from "express";
import type { RequestHandler } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { prisma } from "../../../infrastructure/database/prismaClient";

export function createAdminProductRoutes(auth: RequestHandler, requireAdmin: RequestHandler): Router {
  const router = Router();
  // Secure all routes in this file with authentication and admin role checks
  router.use(auth, requireAdmin);

  /**
   * GET /api/admin/products/deleted
   * Lists all products that have been soft-deleted.
   */
  router.get(
    "/deleted",
    asyncHandler(async (req, res) => {
      const deletedProducts = await prisma.product.findMany({
        where: {
          deletedAt: { not: null }, // This explicitly asks for deleted items, bypassing the middleware filter
        },
        include: {
          vendor: { select: { name: true } }, // Include vendor name for context
        },
        orderBy: {
          deletedAt: 'desc'
        }
      });
      res.json(deletedProducts);
    })
  );

  /**
   * PATCH /api/admin/products/:id/restore
   * Restores a soft-deleted product by setting its `deletedAt` field to null.
   */
  router.patch(
    "/:id/restore",
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      // To update a soft-deleted item, we must include a `deletedAt` condition in the `where` clause
      // to bypass the middleware's default `deletedAt: null` filter.
      const restoredProduct = await prisma.product.update({
        where: {
          id,
          deletedAt: { not: null },
        },
        data: {
          deletedAt: null,
        },
      });
      res.json(restoredProduct);
    })
  );

  /**
   * DELETE /api/admin/products/:id/permanent
   * Permanently deletes a product from the database.
   */
  router.delete(
    "/:id/permanent",
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      // We pass `hard: true` to our custom middleware to trigger a hard delete.
      await prisma.product.delete({
        where: { id },
        // @ts-ignore - 'hard' is our custom flag for the middleware
        hard: true,
      });
      res.status(204).send();
    })
  );

  return router;
}