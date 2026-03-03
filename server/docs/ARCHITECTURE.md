# ZimMarket Backend Architecture

## Clean Architecture Folder Structure

```
server/
├── prisma/
│   └── schema.prisma          # DB schema (Users, Vendors, Products, Categories, Orders, etc.)
├── src/
│   ├── config/
│   │   └── env.ts             # Environment and secrets
│   ├── domain/
│   │   ├── entities/         # Core entities (User, Product, Order, …)
│   │   ├── ports/             # Interfaces for external services (IJwtService, IProductListCache, …)
│   │   └── repositories/     # Repository interfaces (IUserRepository, IProductRepository, …)
│   ├── application/
│   │   └── use-cases/         # Business logic (auth, products, …)
│   ├── infrastructure/
│   │   ├── database/         # Prisma client, repositories
│   │   ├── cache/             # Redis (tokens, product list cache)
│   │   └── security/          # JWT, password hashing
│   ├── presentation/
│   │   ├── http/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── middlewares/   # auth, roleGuard, validate, errorHandler
│   │   │   └── cookieUtils.ts
│   │   └── server/
│   │       ├── app.ts
│   │       └── server.ts
│   ├── composition/
│   │   └── container.ts       # DI / wiring
│   └── shared/
│       ├── errors/
│       └── utils/
└── docs/
    ├── API_DESIGN.md
    └── ARCHITECTURE.md
```

## Auth & RBAC

- **JWT access token:** Short-lived; sent in `Authorization: Bearer <token>`.
- **Refresh token:** Stored in **httpOnly** cookie; used only by `/api/auth/refresh`.
- **Roles:** `ADMIN`, `VENDOR`, `CUSTOMER`. Middleware: `authMiddleware` → `requireRoles([...])`.

## Data & Caching

- **PostgreSQL:** Primary store via Prisma (Users, Vendors, Products, Categories, Orders, OrderItems, Reviews, Coupons, Payments, Refunds).
- **Redis:**
  - Refresh token store (per-user, TTL).
  - Product listing cache (keyed by query params; invalidated on product create).

## Validation & Errors

- **Validation:** Zod schemas in controllers or shared; optional `validate(schema)` middleware.
- **Global error handler:** Maps `AppError`, `ZodError`, Prisma errors (P2002, P2025) to HTTP status and JSON body.

## Middleware Order

1. CORS, `express.json()`, `cookieParser()`
2. Route-level: validation → auth → role guard → controller
3. Global `errorHandler` (last)
