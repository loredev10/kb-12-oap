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
        details: error.details ?? null,
      },
    });
    return;
  }

  const message =
    error instanceof Error ? error.message : "Internal Server Error";

  if (message.includes("UNIQUE constraint failed")) {
    if (message.includes("users.email")) {
      res.status(409).json({
        error: {
          code: "CONFLICT",
          message: "Користувач з таким email вже існує.",
          details: null,
        },
      });
      return;
    }

    res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "Порушено унікальність даних.",
        details: null,
      },
    });
    return;
  }

  if (
    message.includes("NOT NULL constraint failed") ||
    message.includes("CHECK constraint failed") ||
    message.includes("FOREIGN KEY constraint failed")
  ) {
    res.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: "Некоректні дані запиту.",
        details: null,
      },
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Внутрішня помилка сервера.",
      details: null,
    },
  });
}