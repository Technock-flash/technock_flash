import { Router } from "express";
import { container } from "../../../composition/container";
import { authMiddleware } from "../middlewares/authMiddleware"; // Assuming these exist
import { requireRoles } from "../middlewares/requireRoles";
import { maybeAuthMiddleware } from "../middlewares/maybeAuthMiddleware";
import { upload } from "../middlewares/multer"; // Assuming a configured multer instance
import { asyncHandler } from "../../../shared/utils/asyncHandler";

const router = Router();

// Resolve controller from the DI container
const productController = container.resolve("productController");
const jwtService = container.resolve("jwtService");

const auth = authMiddleware(jwtService);
const maybeAuth = maybeAuthMiddleware(jwtService);

/**
 * @route   GET /api/products
 * @desc    List products with optional filters
 * @access  Public (scoped to vendor if authenticated as one)
 */
router.get("/", maybeAuth, asyncHandler(productController.list));

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get("/:id", asyncHandler(productController.getById));

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Vendor)
 */
router.post(
  "/",
  auth,
  requireRoles(["VENDOR"]),
  upload.array("images", 5), // Handle up to 5 images on the 'images' field
  asyncHandler(productController.create)
);

export { router as productRouter };