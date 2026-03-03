/**
 * Token utilities for auth flow.
 * Access token: short-lived, stored in client memory (e.g. React state / memory), never localStorage.
 * Refresh token: long-lived, httpOnly secure cookie only; never exposed to JS.
 */

export const TOKEN_STRATEGY = {
  access: {
    storage: "memory",
    header: "Authorization",
    scheme: "Bearer",
    maxAge: "15m"
  },
  refresh: {
    storage: "httpOnly cookie",
    cookieName: "refreshToken",
    maxAge: "7d"
  }
} as const;

export function getAccessTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}
