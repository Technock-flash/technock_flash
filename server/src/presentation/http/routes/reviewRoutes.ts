import type { RequestHandler } from "express";
import { Router } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { prisma } from "../../../infrastructure/database/prismaClient";

export function createReviewRoutes(auth: RequestHandler): Router {
  const router = Router();

  // List reviews for a product (public)
  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const productId = req.query.productId as string;
      if (!productId) {
        res.status(400).json({ error: "productId required" });
        return;
      }
      const reviews = await prisma.review.findMany({
        where: { productId, isApproved: true },
        take: 50,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          createdAt: true,
          user: { select: { id: true } }
        }
      });
      res.json(reviews);
    })
  );

  // Create review (authenticated)
  router.post(
    "/",
    auth,
    asyncHandler(async (_req, res) => {
      res.status(501).json({ error: "Not implemented" });
    })
  );

  return router;
}
