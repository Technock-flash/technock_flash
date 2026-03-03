import type { RequestHandler } from "express";
import { Router } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler";

export function createCouponRoutes(auth: RequestHandler, requireAdmin: RequestHandler): Router {
  const router = Router();
  const guard = [auth, requireAdmin];

  router.get("/", ...guard, asyncHandler(async (_req, res) => res.json([])));

  router.post("/", ...guard, asyncHandler(async (_req, res) => res.status(501).json({ error: "Not implemented" })));

  router.get("/validate/:code", asyncHandler(async (_req, res) => res.status(501).json({ error: "Not implemented" })));

  return router;
}
