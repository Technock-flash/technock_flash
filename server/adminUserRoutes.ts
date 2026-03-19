import { Router } from "express";
import type { RequestHandler } from "express";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { prisma } from "../../../infrastructure/database/prismaClient";

export function createAdminUserRoutes(auth: RequestHandler, requireAdmin: RequestHandler): Router {
  const router = Router();
  router.use(auth, requireAdmin);

  /**
   * GET /api/admin/users
   * Lists all users for management.
   */
  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [items, total] = await prisma.$transaction([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            firstName: true,
            surname: true,
            role: true,
            createdAt: true,
            emailVerifiedAt: true,
          },
        }),
        prisma.user.count(),
      ]);

      res.json({ items, total, page, limit });
    })
  );

  /**
   * PATCH /api/admin/users/:id/role
   * Updates a user's role and creates an audit log.
   */
  router.patch(
    "/:id/role",
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { role } = req.body;
      const currentAdminId = (req as any).user?.sub || "UNKNOWN";

      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json({ error: "Invalid role specified." });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        res.status(404).json({ error: "User not found." });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: role as UserRole },
      });

      await prisma.activityLog.create({
        data: {
          action: "UPDATE_USER_ROLE",
          entity: "User",
          entityId: id,
          userId: currentAdminId,
          metadata: {
            previousRole: user.role,
            newRole: role,
            targetEmail: user.email,
          },
          ipAddress: req.ip,
        },
      });

      res.json({
        id: updatedUser.id,
        role: updatedUser.role,
        message: "User role updated successfully.",
      });
    })
  );

  return router;
}