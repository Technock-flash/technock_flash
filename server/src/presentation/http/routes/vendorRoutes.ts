import { Router } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { prisma } from "../../../infrastructure/database/prismaClient";

export function createVendorRoutes(): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const offset = Number(req.query.offset) || 0;
      const vendors = await prisma.vendor.findMany({
        where: { isActive: true, status: "APPROVED" },
        take: limit,
        skip: offset,
        select: { id: true, name: true, slug: true, description: true, createdAt: true }
      });
      res.json(vendors);
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const vendor = await prisma.vendor.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          isActive: true,
          createdAt: true,
          _count: { select: { products: true } }
        }
      });
      if (!vendor) {
        res.status(404).json({ error: "Vendor not found" });
        return;
      }
      res.json(vendor);
    })
  );

  return router;
}
