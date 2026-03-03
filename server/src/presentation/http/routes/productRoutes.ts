import type { RequestHandler } from "express";
import { Router } from "express";
import type { ProductController } from "../controllers/ProductController";
import { asyncHandler } from "../../../shared/utils/asyncHandler";

export const createProductRoutes = (
  controller: ProductController,
  auth: RequestHandler,
  requireVendor: RequestHandler
): Router => {
  const router = Router();

  router.get("/", asyncHandler(controller.list));
  router.get("/:id", asyncHandler(controller.getById));
  router.post("/", auth, requireVendor, asyncHandler(controller.create));

  return router;
};
