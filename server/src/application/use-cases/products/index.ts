import { Router } from "express";
import { container } from "../../composition/container";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireRoles } from "../middlewares/requireRoles";
import { createProductRoutes } from "../../../application/use-cases/products/productRoutes";

const router = Router();

// Resolve dependencies
const jwtService = container.resolve("jwtService");

// Initialize middlewares
const auth = authMiddleware(jwtService);
const requireVendor = requireRoles(["VENDOR"]);

// Mount Product Routes
// This uses the schema-validated functional router created to fix 400 errors
router.use("/products", createProductRoutes(auth, requireVendor));

export { router };