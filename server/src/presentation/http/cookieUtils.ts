import type { Request, Response } from "express";
import { env } from "../../config/env";

const COOKIE_OPTS = {
  httpOnly: env.cookie.httpOnly,
  secure: env.cookie.secure,
  sameSite: env.cookie.sameSite as "strict" | "lax" | "none",
  maxAge: env.cookie.maxAgeDays * 24 * 60 * 60 * 1000
};

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie(env.cookie.refreshTokenName, refreshToken, COOKIE_OPTS);
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(env.cookie.refreshTokenName, {
    httpOnly: env.cookie.httpOnly,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite as "strict" | "lax" | "none"
  });
}

export function getRefreshTokenFromCookie(req: Request): string | undefined {
  return req.cookies?.[env.cookie.refreshTokenName];
}
