import { env } from "../config/env";
import { PrismaUserRepository } from "../infrastructure/database/PrismaUserRepository";
import { PrismaVendorRepository } from "../infrastructure/database/PrismaVendorRepository";
import { PrismaProductRepository } from "../infrastructure/database/PrismaProductRepository";
import { MemoryTokenStore } from "../infrastructure/cache/MemoryTokenStore";
import { MemoryProductListCache } from "../infrastructure/cache/MemoryProductListCache";
import { MemoryVerificationTokenStore } from "../infrastructure/cache/MemoryVerificationTokenStore";
import { MemoryRateLimitStore } from "../infrastructure/cache/MemoryRateLimitStore";
import { JwtService } from "../infrastructure/security/JwtService";
import { LocalFileUploader } from "../presentation/http/middlewares/LocalFileUploader";
import { PasswordHasher } from "../infrastructure/security/PasswordHasher";
import { StubEmailSender } from "../infrastructure/email/StubEmailSender";
import { LoginUseCase } from "../application/use-cases/auth/LoginUseCase";
import { RegisterUseCase } from "../application/use-cases/auth/RegisterUseCase";
import { RefreshTokenUseCase } from "../application/use-cases/auth/RefreshTokenUseCase";
import { LogoutUseCase } from "../application/use-cases/auth/LogoutUseCase";
import { VerifyEmailUseCase } from "../application/use-cases/auth/VerifyEmailUseCase";
import { ResendVerificationUseCase } from "../application/use-cases/auth/ResendVerificationUseCase";
import { ForgotPasswordUseCase } from "../application/use-cases/auth/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../application/use-cases/auth/ResetPasswordUseCase";
import { ListProductsUseCase } from "../application/use-cases/products/ListProductsUseCase";
import { GetProductUseCase } from "../application/use-cases/products/GetProductUseCase";
import { CreateProductUseCase } from "../application/use-cases/products/CreateProductUseCase";
import { AuthController } from "../presentation/http/controllers/AuthController";
import { ProductController } from "../presentation/http/controllers/ProductController";
import { authMiddleware } from "../presentation/http/middlewares/authMiddleware";
import { requireRoles } from "../presentation/http/middlewares/roleGuard";
import { rateLimit } from "../presentation/http/middlewares/rateLimit";
import { createAuthRoutes } from "../presentation/http/routes/authRoutes";
import { createProductRoutes } from "../presentation/http/routes/productRoutes";
import { createCategoryRoutes } from "../presentation/http/routes/categoryRoutes";
import { createOrderRoutes } from "../presentation/http/routes/orderRoutes";
import { createVendorRoutes } from "../presentation/http/routes/vendorRoutes";
import { createReviewRoutes } from "../presentation/http/routes/reviewRoutes";
import { createCouponRoutes } from "../presentation/http/routes/couponRoutes";
import { createAdminRoutes } from "../presentation/http/routes/adminRoutes";

// Infrastructure
const userRepo = new PrismaUserRepository();
const vendorRepo = new PrismaVendorRepository();
const productRepo = new PrismaProductRepository();

const useMemory = env.useInMemoryCache;
const tokenStore = useMemory
  ? new MemoryTokenStore()
  : new (require("../infrastructure/cache/RedisTokenStore").RedisTokenStore)();
const productListCache = useMemory
  ? new MemoryProductListCache()
  : new (require("../infrastructure/cache/RedisProductListCache").RedisProductListCache)();
const verificationStore = useMemory
  ? new MemoryVerificationTokenStore()
  : new (require("../infrastructure/cache/RedisVerificationTokenStore").RedisVerificationTokenStore)();
const rateLimitStore = useMemory
  ? new MemoryRateLimitStore()
  : new (require("../infrastructure/cache/RedisRateLimitStore").RedisRateLimitStore)();
const jwtService = new JwtService();
const passwordHasher = new PasswordHasher();
const emailSender = new StubEmailSender();
const fileUploader = new LocalFileUploader();

// Application
const loginUseCase = new LoginUseCase(userRepo, tokenStore, passwordHasher, jwtService);
const registerUseCase = new RegisterUseCase(
  userRepo,
  vendorRepo,
  tokenStore,
  verificationStore,
  passwordHasher,
  jwtService,
  emailSender
);
const refreshTokenUseCase = new RefreshTokenUseCase(userRepo, tokenStore, jwtService);
const logoutUseCase = new LogoutUseCase(tokenStore, jwtService);
const verifyEmailUseCase = new VerifyEmailUseCase(userRepo, verificationStore);
const resendVerificationUseCase = new ResendVerificationUseCase(
  userRepo,
  verificationStore,
  emailSender
);
const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepo);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepo, passwordHasher);
const listProductsUseCase = new ListProductsUseCase(productRepo, productListCache);
const getProductUseCase = new GetProductUseCase(productRepo);
const createProductUseCase = new CreateProductUseCase(
  productRepo,
  vendorRepo,
  productListCache
);

// Auth rate limit: 10 requests per minute per IP for login/register/refresh etc.
const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  store: rateLimitStore
});

// Presentation
const auth = authMiddleware(jwtService);
const authController = new AuthController(
  loginUseCase,
  registerUseCase,
  refreshTokenUseCase,
  logoutUseCase,
  verifyEmailUseCase,
  resendVerificationUseCase,
  forgotPasswordUseCase,
  resetPasswordUseCase
);
// ProductController is used by the /api/products routes.
// It should receive the CreateProductUseCase as its first dependency.
const productController = new ProductController(
  createProductUseCase,
  listProductsUseCase as any,
  fileUploader
);

export const authRoutes = createAuthRoutes(authController, authRateLimit);
export const productRoutes = createProductRoutes(
  productController,
  auth,
  requireRoles(["VENDOR", "ADMIN"])
);
export const categoryRoutes = createCategoryRoutes();
export const orderRoutes = createOrderRoutes(auth, requireRoles(["CUSTOMER", "VENDOR", "ADMIN"]));
export const vendorRoutes = createVendorRoutes();
export const reviewRoutes = createReviewRoutes(auth);
export const couponRoutes = createCouponRoutes(auth, requireRoles(["ADMIN"]));
export const adminRoutes = createAdminRoutes(auth, requireRoles(["ADMIN"]));
