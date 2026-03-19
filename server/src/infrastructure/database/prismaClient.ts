import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.nodeEnv === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (env.nodeEnv !== "production") globalForPrisma.prisma = prisma;

// Prisma Middleware for Soft Deletes on the Product model
prisma.$use(async (params, next) => {
  if (params.model !== 'Product') {
    return next(params);
  }

  // --- Hard Delete Interception ---
  // Check for a custom 'hard' argument to bypass soft-delete.
  if (params.action.startsWith('delete')) {
    // @ts-ignore
    if (params.args.hard === true) {
      // @ts-ignore
      delete params.args.hard; // Clean up the custom arg
      return next(params); // Proceed with the actual database deletion
    }
  }

  // --- Soft Delete Implementation ---
  if (params.action === 'delete') {
    params.action = 'update';
    params.args.data = { deletedAt: new Date() };
  }
  if (params.action === 'deleteMany') {
    params.action = 'updateMany';
    if (params.args.data) {
      params.args.data.deletedAt = new Date();
    } else {
      params.args.data = { deletedAt: new Date() };
    }
  }

  // --- Automatic Filtering of Deleted Items ---
  const findActions = ['findUnique', 'findFirst', 'findMany', 'count', 'update', 'updateMany', 'upsert'];
  if (findActions.includes(params.action)) {
    if (params.args.where) {
      // If 'deletedAt' is not already part of the where clause,
      // we add the condition to only include non-deleted items.
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    } else {
      // If there's no where clause, create one to filter out deleted items.
      params.args.where = { deletedAt: null };
    }
  }

  return next(params);
});
