import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware";
import type { IEmailSender } from "../../../domain/ports/IEmailSender";
import { prisma } from "../../../infrastructure/database/prismaClient";
import { PasswordHasher } from "../../../infrastructure/security/PasswordHasher";
import {
  AdminAnalyticsService,
  type RevenuePeriod
} from "../../../application/services/AdminAnalyticsService";

const passwordHasher = new PasswordHasher();

const analyticsService = new AdminAnalyticsService();

export class AdminController {
  constructor(private readonly emailSender: IEmailSender) {}

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

  // ─── Category CRUD ────────────────────────────────────────────────────────

  async listAllCategories(_req: Request, res: Response): Promise<void> {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.json(categories);
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    const { name, slug, description, parentId } = req.body as {
      name?: string;
      slug?: string;
      description?: string | null;
      parentId?: string | null;
    };
    if (!name || !slug) {
      res.status(400).json({ error: "name and slug are required" });
      return;
    }
    const category = await prisma.category.create({
      data: { name, slug, description: description ?? null, parentId: parentId ?? null },
    });
    res.status(201).json(category);
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, slug, description, parentId } = req.body as {
      name?: string;
      slug?: string;
      description?: string | null;
      parentId?: string | null;
    };
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name != null && { name }),
        ...(slug != null && { slug }),
        ...(description !== undefined && { description }),
        ...(parentId !== undefined && { parentId: parentId ?? null }),
      },
    });
    res.json(category);
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  }

  // ─── Admin Orders ─────────────────────────────────────────────────────────

  async listAllOrders(req: Request, res: Response): Promise<void> {
    const statusParam = req.query.status as string | undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    const where =
      statusParam && validStatuses.includes(statusParam)
        ? { status: statusParam as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" }
        : {};

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { customer: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ items, total, page, limit });
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body as { status?: string };

    const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" },
      include: { customer: { select: { email: true } }, items: { include: { product: true } } },
    });

    try {
      await this.emailSender.sendOrderConfirmationEmail(order.customer.email, {
        orderNumber: order.orderNumber,
        status: order.status,
        totalCents: order.totalCents,
        items: order.items.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          unitPriceCents: item.priceCents,
          lineTotalCents: item.totalCents,
        })),
      });
    } catch (emailError) {
      // Do not fail order status update for email send errors.
      // eslint-disable-next-line no-console
      console.warn("Order status updated but failed to send confirmation email:", emailError);
    }

    res.json(order);
  }

  // ─── Create User ──────────────────────────────────────────────────────────

  async createUser(req: Request, res: Response): Promise<void> {
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const validRoles = ["CUSTOMER", "VENDOR", "ADMIN"];
    const userRole = role ?? "CUSTOMER";
    if (!validRoles.includes(userRole)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "A user with this email already exists" });
      return;
    }

    const passwordHash = await passwordHasher.hash(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: userRole as "CUSTOMER" | "VENDOR" | "ADMIN",
      },
      select: { id: true, email: true, role: true, emailVerifiedAt: true, createdAt: true },
    });
    res.status(201).json(user);
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
