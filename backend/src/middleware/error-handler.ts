import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/api-error.js";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  console.error("Unhandled error:", error);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Внутрішня помилка сервера.",
      details: null,
    },
  });
}