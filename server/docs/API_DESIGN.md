# ZimMarket REST API Design

## Overview

- **Base URL:** `/api`
- **Auth:** JWT access token in `Authorization: Bearer <token>`
- **Refresh:** httpOnly cookie `refreshToken` (set on login/register/refresh)
- **Roles:** `ADMIN` | `VENDOR` | `CUSTOMER`

---

## Authentication

| Method | Endpoint       | Auth | Description                    |
|--------|----------------|------|--------------------------------|
| POST   | /api/auth/login    | No   | Login; sets refresh cookie     |
| POST   | /api/auth/register | No   | Register as vendor; sets cookie|
| POST   | /api/auth/refresh  | No*  | New access token from cookie   |
| POST   | /api/auth/logout   | No   | Clear refresh cookie           |

\* Refresh uses httpOnly cookie; body `refreshToken` optional fallback.

**Request (login/register):**
```json
{ "email": "...", "password": "..." }
```
Register adds: `vendorName`, `vendorDescription?`.

**Response:** `{ "accessToken": "...", "user": { "id", "email", "role" } }`

---

## Products

| Method | Endpoint          | Auth        | Description              |
|--------|-------------------|-------------|--------------------------|
| GET    | /api/products     | No          | List (cached by Redis)    |
| GET    | /api/products/:id | No          | Get by id                 |
| POST   | /api/products     | VENDOR/ADMIN| Create product            |

**Query (list):** `vendorId`, `categoryId`, `limit`, `offset`

---

## Categories

| Method | Endpoint            | Auth | Description        |
|--------|---------------------|------|--------------------|
| GET    | /api/categories     | No   | List root categories |
| GET    | /api/categories/:id | No   | Get one + children  |

---

## Vendors

| Method | Endpoint         | Auth | Description   |
|--------|------------------|------|---------------|
| GET    | /api/vendors     | No   | List vendors  |
| GET    | /api/vendors/:id | No   | Get vendor    |

**Query (list):** `limit`, `offset`

---

## Orders

| Method | Endpoint       | Auth   | Description        |
|--------|----------------|--------|--------------------|
| GET    | /api/orders    | Customer| List my orders     |
| GET    | /api/orders/:id| Owner/Admin | Get order   |
| POST   | /api/orders    | Customer| Create order       |

---

## Reviews

| Method | Endpoint       | Auth | Description      |
|--------|----------------|------|------------------|
| GET    | /api/reviews   | No   | By productId     |
| POST   | /api/reviews   | Yes  | Create review    |

**Query (list):** `productId` (required)

---

## Coupons

| Method | Endpoint               | Auth  | Description   |
|--------|------------------------|-------|---------------|
| GET    | /api/coupons           | Admin | List coupons  |
| POST   | /api/coupons           | Admin | Create coupon |
| GET    | /api/coupons/validate/:code | No | Validate code |

---

## Admin

| Method | Endpoint        | Auth | Description   |
|--------|-----------------|------|---------------|
| GET    | /api/admin/stats| Admin| Dashboard stats|
| GET    | /api/admin/users| Admin| List users    |

---

## Payments & Refunds

Reserved for future implementation; schema supports:

- **Payments:** orderId, amountCents, status, provider, providerRef
- **Refunds:** orderId, paymentId, amountCents, reason, status

---

## Error Responses

- `400` — Validation failed (body: `{ error, details? }`)
- `401` — Unauthorized (missing or invalid token)
- `403` — Forbidden (insufficient role)
- `404` — Record not found
- `409` — Conflict (e.g. duplicate unique field)
- `500` — Internal server error

---

## Middleware Order

1. CORS, JSON, cookie-parser
2. Route-specific: `validate(schema)`, `auth`, `requireRoles([...])`
3. Global `errorHandler` last
