import type { RequestHandler } from "express";
import { Router } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { prisma } from "../../../infrastructure/database/prismaClient";

export function createOrderRoutes(auth: RequestHandler, _requireAuth: RequestHandler): Router {
  const router = Router();

  // List current user's orders (authenticated)
  router.get(
    "/",
    auth,
    asyncHandler(async (req, res) => {
      const userId = (req as { user?: { sub: string } }).user?.sub;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const orders = await prisma.order.findMany({
        where: { customerId: userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { items: true }
      });
      res.json(orders);
    })
  );

  // Get order by id (authenticated, owner or admin)
  router.get(
    "/:id",
    auth,
    asyncHandler(async (_req, res) => {
      res.status(501).json({ error: "Not implemented" });
    })
  );

  // Create order (authenticated customer)
  router.post(
    "/",
    auth,
    asyncHandler(async (_req, res) => {
      res.status(501).json({ error: "Not implemented" });
    })
  );

  return router;
}
