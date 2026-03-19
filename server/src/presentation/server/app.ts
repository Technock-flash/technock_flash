import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "../../config/env";
import { errorHandler } from "../http/middlewares/errorHandler";
import {
  authRoutes,
  productRoutes,
  categoryRoutes,
  orderRoutes,
  vendorRoutes,
  reviewRoutes,
  couponRoutes,
  adminRoutes
} from "../../composition/container";

const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (env.corsAllowedOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());
app.use(cookieParser());
// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "zimmarket-backend" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);

// Global error handler (must be after routes)
app.use(errorHandler);

export { app };

