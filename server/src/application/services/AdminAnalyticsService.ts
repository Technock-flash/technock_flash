import { prisma } from "../../infrastructure/database/prismaClient";

export type RevenuePeriod = "day" | "week" | "month";

export interface RevenuePoint {
  date: string;
  revenueCents: number;
  orderCount: number;
}

export interface AdminAnalytics {
  revenueByPeriod: RevenuePoint[];
  totalRevenueCents: number;
  totalOrders: number;
  conversionRate: number;
  avgOrderValueCents: number;
}

const COMPLETED_PAYMENT = "COMPLETED";

export class AdminAnalyticsService {
  async getSalesAnalytics(period: RevenuePeriod = "month"): Promise<AdminAnalytics> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "day":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: "CANCELLED" },
        payments: { some: { status: COMPLETED_PAYMENT } },
      },
      select: {
        totalCents: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const revenueByPeriod = this.aggregateByPeriod(orders, period);
    const totalRevenueCents = orders.reduce((sum, o) => sum + o.totalCents, 0);
    const totalOrders = orders.length;
    const avgOrderValueCents = totalOrders > 0 ? Math.round(totalRevenueCents / totalOrders) : 0;

    const totalSessionsOrCarts = await prisma.order.count({
      where: { createdAt: { gte: startDate } },
    });
    const conversionRate =
      totalSessionsOrCarts > 0
        ? Math.round((totalOrders / totalSessionsOrCarts) * 10000) / 100
        : 0;

    return {
      revenueByPeriod,
      totalRevenueCents,
      totalOrders,
      conversionRate,
      avgOrderValueCents,
    };
  }

  private aggregateByPeriod(
    orders: { totalCents: number; createdAt: Date }[],
    period: RevenuePeriod
  ): RevenuePoint[] {
    const buckets = new Map<string, { revenueCents: number; orderCount: number }>();

    const fmt =
      period === "day"
        ? (d: Date) => d.toISOString().slice(0, 13)
        : period === "week"
          ? (d: Date) => {
              const weekStart = new Date(d);
              weekStart.setDate(d.getDate() - d.getDay());
              return weekStart.toISOString().slice(0, 10);
            }
          : (d: Date) => d.toISOString().slice(0, 7);

    for (const o of orders) {
      const key = fmt(o.createdAt);
      const cur = buckets.get(key) ?? { revenueCents: 0, orderCount: 0 };
      cur.revenueCents += o.totalCents;
      cur.orderCount += 1;
      buckets.set(key, cur);
    }

    return Array.from(buckets.entries())
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
