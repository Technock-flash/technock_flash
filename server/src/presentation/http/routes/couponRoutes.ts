import type { RequestHandler } from "express";
import { Router } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { z } from "zod";

const createCouponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discountPercent: z.number().min(1).max(100),
  expiresAt: z.string().datetime(),
});

export function createCouponRoutes(auth: RequestHandler, requireAdmin: RequestHandler): Router {
  const router = Router();
  const guard = [auth, requireAdmin];

  router.get(
    "/",
    ...guard,
    asyncHandler(async (_req, res) => {
      res.json([]);
    })
  );

  router.post(
    "/",
    ...guard,
    validate(createCouponSchema),
    asyncHandler(async (req, res) => {
      // At this point, req.body is guaranteed to match createCouponSchema
      const { code, discountPercent } = req.body;
      res.status(201).json({ message: `Coupon ${code} created with ${discountPercent}% discount.` });
    })
  );

  router.get(
    "/validate/:code",
    asyncHandler(async (_req, res) => {
      res.status(501).json({ error: "Not implemented" });
    })
  );

  return router;
}
