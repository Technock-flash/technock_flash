import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../../shared/errors/AppError";

function isPrismaError(err: unknown): err is { code: string; meta?: { target?: string[] } } {
  return typeof err === "object" && err !== null && "code" in err;
}

// Global error handler: AppError, Zod, Prisma, unknown
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.flatten().fieldErrors
    });
    return;
  }

  if (isPrismaError(err)) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.[0] ?? "field";
      res.status(409).json({ error: `Duplicate value for ${target}` });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: "Record not found" });
      return;
    }
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};

