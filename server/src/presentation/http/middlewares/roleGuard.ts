import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./authMiddleware";
import { AppError } from "../../../shared/errors/AppError";

export type UserRole = "ADMIN" | "VENDOR" | "CUSTOMER";

/**
 * Restricts access to routes by role. Must be used after authMiddleware.
 * @param allowedRoles - Roles that are permitted (e.g. ['ADMIN'], ['ADMIN', 'VENDOR'])
 */
export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }
    const role = req.user.role as UserRole;
    if (!allowedRoles.includes(role)) {
      next(new AppError("Forbidden", 403));
      return;
    }
    next();
  };
};
