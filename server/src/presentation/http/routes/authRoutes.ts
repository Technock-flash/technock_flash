import type { RequestHandler } from "express";
import { Router } from "express";
import type { AuthController } from "../controllers/AuthController";
import { asyncHandler } from "../../../shared/utils/asyncHandler";

export const createAuthRoutes = (
  controller: AuthController,
  authRateLimit: RequestHandler
): Router => {
  const router = Router();

  router.use(authRateLimit);

  router.get("/secret-questions", asyncHandler(controller.secretQuestions));
  router.post("/login", asyncHandler(controller.login));
  router.post("/register", asyncHandler(controller.register));
  router.post("/refresh", asyncHandler(controller.refresh));
  router.post("/logout", asyncHandler(controller.logout));
  router.get("/verify-email", asyncHandler(controller.verifyEmail));
  router.post("/verify-email", asyncHandler(controller.verifyEmail));
  router.post("/resend-verification", asyncHandler(controller.resendVerification));
  router.post("/forgot-password", asyncHandler(controller.forgotPassword));
  router.post("/reset-password", asyncHandler(controller.resetPassword));

  return router;
};
