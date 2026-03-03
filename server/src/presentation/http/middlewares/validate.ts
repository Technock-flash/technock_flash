import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

type SchemaSource = "body" | "query" | "params";

/**
 * Validates request data with Zod and attaches parsed result to req.
 * On failure returns 400 with flattened field errors.
 */
export const validate = <T extends z.ZodType>(
  schema: T,
  source: SchemaSource = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const raw = req[source];
    const result = schema.safeParse(raw);
    if (result.success) {
      (req as Request & { [K: string]: z.infer<T> })[source] = result.data;
      next();
      return;
    }
    res.status(400).json({
      error: "Validation failed",
      details: result.error.flatten().fieldErrors
    });
  };
};
