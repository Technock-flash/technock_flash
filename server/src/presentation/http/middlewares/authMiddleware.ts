import type { NextFunction, Request, Response } from "express";
import type { IJwtService } from "../../../domain/ports/IJwtService";
import { getAccessTokenFromHeader } from "../tokenUtils";
import { AppError } from "../../../shared/errors/AppError";

export interface AuthPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export const authMiddleware = (jwtService: IJwtService) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const token = getAccessTokenFromHeader(req.headers.authorization);

    if (!token) {
      next(new AppError("Unauthorized", 401));
      return;
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
