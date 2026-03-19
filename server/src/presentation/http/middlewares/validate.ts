import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export type ValidationSource = "body" | "query" | "params";

/**
 * Middleware to validate request data against a Zod schema.
 * @param schema The Zod schema to validate against.
 * @param source The segment of the request to validate ('body', 'query', or 'params'). Defaults to 'body'.
 */
export const validate = (schema: AnyZodObject, source: ValidationSource = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      // Overwrite the request property with the parsed/coerced result.
      // This ensures that any Zod transformations (like string to number) are reflected in the controller.
      (req as any)[source] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
};