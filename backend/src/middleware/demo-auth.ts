import type { NextFunction, Request, Response } from "express";
import { findUserById } from "../data/users.store.js";
import { ApiError } from "../errors/api-error.js";

const DEMO_USER_ID_HEADER = "X-Demo-UserId";

function parseDemoUserId(value: string | undefined): number {
  if (!value) {
    throw new ApiError(
      401,
      "UNAUTHORIZED",
      `Відсутній заголовок ${DEMO_USER_ID_HEADER}.`,
    );
  }

  const userId = Number(value);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ApiError(
      401,
      "UNAUTHORIZED",
      `Некоректний заголовок ${DEMO_USER_ID_HEADER}.`,
    );
  }

  return userId;
}

export async function demoAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = parseDemoUserId(req.header(DEMO_USER_ID_HEADER));
    const user = await findUserById(userId);

    if (!user || user.isDeleted) {
      throw new ApiError(401, "UNAUTHORIZED", "Користувача не знайдено.");
    }

    req.currentUser = {
      id: user.id,
    };

    next();
  } catch (error) {
    next(error);
  }
}
