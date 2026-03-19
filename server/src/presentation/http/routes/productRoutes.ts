import type { RequestHandler } from "express";
import { Router } from "express";
import type { ProductController } from "../controllers/ProductController";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { upload } from "../middlewares/multer";

export const createProductRoutes = (
  controller: ProductController,
  auth: RequestHandler,
  requireVendor: RequestHandler
): Router => {
  const router = Router();

  router.get("/", asyncHandler(controller.list));
  router.get("/:id", asyncHandler(controller.getById));
  router.post("/", auth, requireVendor, upload.array("images", 5), asyncHandler(controller.create));
  router.put(
    "/:id",
    auth,
    requireVendor,
    upload.array("images", 5),
    asyncHandler(controller.update)
  );
  router.delete(
    "/:id/images",
    auth,
    requireVendor,
    asyncHandler(controller.deleteImages)
  );

  return router;
};
