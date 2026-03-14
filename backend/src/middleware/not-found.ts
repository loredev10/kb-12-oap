import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/api-error.js";
import { frontendDir } from "../utils/paths.js";

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.path.startsWith("/api/")) {
    const indexFilePath = path.join(frontendDir, "index.html");
    res.status(404).sendFile(indexFilePath);
    return;
  }

  next(new ApiError(404, "NOT_FOUND", "Маршрут не знайдено."));
}