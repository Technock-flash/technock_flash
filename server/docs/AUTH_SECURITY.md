# Authentication & Security

## Token Strategy

### Access token
- **Short-lived** (e.g. 15m); stored **in memory only** on the client (e.g. React state).
- Never store in `localStorage` or `sessionStorage` (XSS risk).
- Sent in `Authorization: Bearer <token>`.

### Refresh token
- **Long-lived** (e.g. 7d); stored in **httpOnly, secure, SameSite** cookie.
- Not readable by JavaScript; reduces XSS theft risk.
- Used only by `/api/auth/refresh` to issue a new access token.

### Token rotation
- On every refresh, the **previous** refresh token is **invalidated** in Redis.
- A **new** refresh token is issued and set in the cookie.
- If an old (rotated) token is reused → 401; consider invalidating all sessions for that user (optional).

---

## Logout & invalidation

- **Logout**: Client calls `POST /api/auth/logout` (cookie sent automatically).
- Server reads refresh token from cookie → verifies JWT → deletes token from Redis → clears cookie.
- After logout, the refresh token cannot be used again.

---

## Password hashing

- **bcrypt** with **12 rounds** (configurable in `PasswordHasher`).
- Never log or expose plain passwords; compare with `bcrypt.compare()` only.

---

## Email verification

- On **register**, a verification token (32-byte hex) is stored in **Redis** with TTL 24h.
- A link is sent (e.g. `BASE_URL/verify-email?token=...`) via `IEmailSender` (stub logs in dev).
- **GET or POST /api/auth/verify-email?token=...** marks the user as verified and deletes the token.
- **POST /api/auth/resend-verification** with `{ "email": "..." }` sends a new link (idempotent; no leak of existence).
- If `REQUIRE_EMAIL_VERIFICATION=true`, **login** is blocked until the email is verified.

---

## Redis refresh token storage

- Key: `refresh:<userId>`.
- Value: current refresh token (string).
- TTL: same as refresh token expiry (e.g. 7 days).
- **Rotation**: on refresh, delete `refresh:<userId>`, then set new token with same key and TTL.
- **Logout**: delete `refresh:<userId>` so the token is invalidated server-side.

---

## Rate limiting

- **Auth routes** (`/api/auth/*`): **10 requests per minute per IP** (configurable).
- Uses Redis when `RedisRateLimitStore` is wired so limits are shared across instances.
- Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

---

## CORS

- **Allowed origins**: from `CORS_ORIGINS` (comma-separated) or `CLIENT_URL`.
- **Credentials**: `true` (cookies sent).
- **Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS.
- **Headers**: Content-Type, Authorization.

---

## CSRF

- **SameSite cookie**: refresh token cookie uses `SameSite=Lax` (or `Strict`).
- For same-origin or same-site frontends, this mitigates CSRF for cookie-based refresh.
- For cross-site top-level navigations, use **SameSite=Strict** if the client is always on the same site.
- Optional: add a **double-submit cookie** or **CSRF token** for state-changing requests if you need cross-site form POSTs from other domains.

---

## Security checklist

- [x] Access token in memory; refresh in httpOnly cookie
- [x] Token rotation on refresh
- [x] Logout invalidates refresh token in Redis
- [x] bcrypt for passwords (12 rounds)
- [x] Email verification flow with Redis-backed token
- [x] Rate limiting on auth endpoints
- [x] CORS restricted to allowed origins
- [x] SameSite cookie for refresh token
- [ ] Optional: Helmet for security headers
- [ ] Optional: CSRF token for non-SPA flows
