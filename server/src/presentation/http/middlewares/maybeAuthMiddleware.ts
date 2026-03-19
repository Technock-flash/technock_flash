import type { NextFunction, Response } from "express";
import type { IJwtService } from "../../../domain/ports/IJwtService";
import { getAccessTokenFromHeader } from "../tokenUtils";
import type { AuthenticatedRequest } from "./authMiddleware";
import { AppError } from "../../../shared/errors/AppError";

/**
 * Middleware that decorates the request with a user object if a valid
 * access token is provided. It does not fail if the token is missing,
 * but will fail if the token is present and invalid (e.g., expired),
 * allowing the client's token refresh logic to trigger.
 */
export const maybeAuthMiddleware = (jwtService: IJwtService) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const token = getAccessTokenFromHeader(req.headers.authorization);

    if (!token) {
      return next();
    }

    try {
      const payload = jwtService.verifyAccessToken(token);
      req.user = payload;
      next();
    } catch {
      next(new AppError("Invalid or expired token", 401));
    }
  };
};