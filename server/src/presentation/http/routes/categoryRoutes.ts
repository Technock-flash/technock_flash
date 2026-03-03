import { Router } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { prisma } from "../../../infrastructure/database/prismaClient";

export function createCategoryRoutes(): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const categories = await prisma.category.findMany({
        where: { parentId: null },
        include: { children: true }
      });
      res.json(categories);
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const category = await prisma.category.findUnique({
        where: { id: req.params.id },
        include: { parent: true, children: true }
      });
      if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
      res.json(category);
    })
  );

  return router;
}
