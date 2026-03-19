import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { prisma } from "../../../infrastructure/database/prismaClient";
import {
  AdminAnalyticsService,
  type RevenuePeriod
} from "../../../application/services/AdminAnalyticsService";

const analyticsService = new AdminAnalyticsService();

export class AdminController {
  async getStats(_req: Request, res: Response): Promise<void> {
    const [users, vendors, orders] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.order.count(),
    ]);
    res.json({ users, vendors, orders });
  }

  async getAnalytics(req: Request, res: Response): Promise<void> {
    const period = (req.query.period as RevenuePeriod) ?? "month";
    const data = await analyticsService.getSalesAnalytics(period);
    res.json(data);
  }

  async listVendors(req: Request, res: Response): Promise<void> {
    const status = req.query.status as string | undefined;
    const page = Math.max(1, Number(req.query.page) ?? 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) ?? 20));
    const skip = (page - 1) * limit;

    const where =
      status && ["PENDING", "APPROVED", "REJECTED"].includes(status)
        ? { status: status as "PENDING" | "APPROVED" | "REJECTED" }
        : {};

    const [items, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: { owner: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.vendor.count({ where }),
    ]);

    res.json({ items, total, page, limit });
  }

  async approveVendor(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.sub;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        status: "APPROVED",
        isActive: true,
        reviewedAt: new Date(),
        reviewedBy: userId ?? undefined,
      },
    });
    res.json(vendor);
  }

  async rejectVendor(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.sub;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        status: "REJECTED",
        isActive: false,
        reviewedAt: new Date(),
        reviewedBy: userId ?? undefined,
      },
    });
    res.json(vendor);
  }

  async listProductsForModeration(req: Request, res: Response): Promise<void> {
    const status = (req.query.status as string) ?? "PENDING";
    const page = Math.max(1, Number(req.query.page) ?? 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) ?? 20));
    const skip = (page - 1) * limit;

    const where =
      status && ["PENDING", "APPROVED", "REJECTED"].includes(status)
        ? { moderationStatus: status as "PENDING" | "APPROVED" | "REJECTED" }
        : {};

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { vendor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ items, total, page, limit });
  }

  async approveProduct(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.sub;

    const product = await prisma.product.update({
      where: { id },
      data: {
        moderationStatus: "APPROVED",
        isActive: true,
        moderatedAt: new Date(),
        moderatedBy: userId ?? undefined,
      },
    });
    res.json(product);
  }

  async rejectProduct(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.sub;

    const product = await prisma.product.update({
      where: { id },
      data: {
        moderationStatus: "REJECTED",
        isActive: false,
        moderatedAt: new Date(),
        moderatedBy: userId ?? undefined,
      },
    });
    res.json(product);
  }

  async listUsers(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, Number(req.query.page) ?? 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) ?? 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          emailVerifiedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    res.json({ items, total, page, limit });
  }

  async updateUserRole(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { role } = req.body as { role?: string };
    if (!role || !["CUSTOMER", "VENDOR", "ADMIN"].includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: role as "CUSTOMER" | "VENDOR" | "ADMIN" },
    });
    res.json(user);
  }

  async listRefunds(req: Request, res: Response): Promise<void> {
    const status = (req.query.status as string) ?? "PENDING";
    const page = Math.max(1, Number(req.query.page) ?? 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) ?? 20));
    const skip = (page - 1) * limit;

    const where =
      status && ["PENDING", "APPROVED", "REJECTED", "COMPLETED"].includes(status)
        ? { status: status as "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" }
        : {};

    const [items, total] = await Promise.all([
      prisma.refund.findMany({
        where,
        include: {
          order: { select: { orderNumber: true } },
          payment: { select: { amountCents: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.refund.count({ where }),
    ]);

    res.json({ items, total, page, limit });
  }

  async approveRefund(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.sub;

    const refund = await prisma.refund.update({
      where: { id },
      data: {
        status: "APPROVED",
        processedAt: new Date(),
        processedBy: userId ?? undefined,
      },
    });
    res.json(refund);
  }

  async rejectRefund(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.sub;

    const refund = await prisma.refund.update({
      where: { id },
      data: {
        status: "REJECTED",
        processedAt: new Date(),
        processedBy: userId ?? undefined,
      },
    });
    res.json(refund);
  }

  async listCmsPages(_req: Request, res: Response): Promise<void> {
    const pages = await prisma.cmsPage.findMany({
      orderBy: { updatedAt: "desc" },
    });
    res.json(pages);
  }

  async getCmsPage(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const page = await prisma.cmsPage.findUnique({
      where: { slug },
    });
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    res.json(page);
  }

  async createCmsPage(req: Request, res: Response): Promise<void> {
    const { slug, title, content } = req.body;
    const page = await prisma.cmsPage.create({
      data: { slug, title, content: content ?? "" },
    });
    res.status(201).json(page);
  }

  async updateCmsPage(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const { title, content, isPublished } = req.body;

    const page = await prisma.cmsPage.update({
      where: { slug },
      data: {
        ...(title != null && { title }),
        ...(content != null && { content }),
        ...(typeof isPublished === "boolean" && { isPublished }),
      },
    });
    res.json(page);
  }

  async deleteCmsPage(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    await prisma.cmsPage.delete({ where: { slug } });
    res.status(204).send();
  }

  async listActivityLogs(req: Request, res: Response): Promise<void> {
    const entity = req.query.entity as string | undefined;
    const page = Math.max(1, Number(req.query.page) ?? 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) ?? 50));
    const skip = (page - 1) * limit;

    const where = entity ? { entity } : {};

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({ items, total, page, limit });
  }

  async createActivityLog(
    action: string,
    entity: string,
    entityId: string | undefined,
    userId: string | undefined,
    metadata?: Prisma.InputJsonValue
  ): Promise<void> {
    await prisma.activityLog.create({
      data: { action, entity, entityId, userId, metadata: metadata ?? undefined },
    });
  }
}
