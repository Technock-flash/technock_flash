import type { RequestHandler } from "express";
import { Router } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { AdminController } from "../controllers/AdminController";

const controller = new AdminController();

export function createAdminRoutes(
  auth: RequestHandler,
  requireAdmin: RequestHandler
): Router {
  const router = Router();
  const guard = [auth, requireAdmin];

  router.get("/stats", ...guard, asyncHandler(controller.getStats.bind(controller)));
  router.get("/analytics", ...guard, asyncHandler(controller.getAnalytics.bind(controller)));

  router.get("/vendors", ...guard, asyncHandler(controller.listVendors.bind(controller)));
  router.post("/vendors/:id/approve", ...guard, asyncHandler(controller.approveVendor.bind(controller)));
  router.post("/vendors/:id/reject", ...guard, asyncHandler(controller.rejectVendor.bind(controller)));

  router.get("/products/moderation", ...guard, asyncHandler(controller.listProductsForModeration.bind(controller)));
  router.post("/products/:id/approve", ...guard, asyncHandler(controller.approveProduct.bind(controller)));
  router.post("/products/:id/reject", ...guard, asyncHandler(controller.rejectProduct.bind(controller)));

  router.get("/users", ...guard, asyncHandler(controller.listUsers.bind(controller)));
  router.patch("/users/:id/role", ...guard, asyncHandler(controller.updateUserRole.bind(controller)));

  router.get("/refunds", ...guard, asyncHandler(controller.listRefunds.bind(controller)));
  router.post("/refunds/:id/approve", ...guard, asyncHandler(controller.approveRefund.bind(controller)));
  router.post("/refunds/:id/reject", ...guard, asyncHandler(controller.rejectRefund.bind(controller)));

  router.get("/cms", ...guard, asyncHandler(controller.listCmsPages.bind(controller)));
  router.get("/cms/:slug", ...guard, asyncHandler(controller.getCmsPage.bind(controller)));
  router.post("/cms", ...guard, asyncHandler(controller.createCmsPage.bind(controller)));
  router.patch("/cms/:slug", ...guard, asyncHandler(controller.updateCmsPage.bind(controller)));
  router.delete("/cms/:slug", ...guard, asyncHandler(controller.deleteCmsPage.bind(controller)));

  router.get("/activity-logs", ...guard, asyncHandler(controller.listActivityLogs.bind(controller)));

  // Categories (admin CRUD)
  router.get("/categories", ...guard, asyncHandler(controller.listAllCategories.bind(controller)));
  router.post("/categories", ...guard, asyncHandler(controller.createCategory.bind(controller)));
  router.patch("/categories/:id", ...guard, asyncHandler(controller.updateCategory.bind(controller)));
  router.delete("/categories/:id", ...guard, asyncHandler(controller.deleteCategory.bind(controller)));

  // Create user (admin)
  router.post("/users", ...guard, asyncHandler(controller.createUser.bind(controller)));

  // Admin orders
  router.get("/orders", ...guard, asyncHandler(controller.listAllOrders.bind(controller)));
  router.patch("/orders/:id/status", ...guard, asyncHandler(controller.updateOrderStatus.bind(controller)));

  return router;
}
