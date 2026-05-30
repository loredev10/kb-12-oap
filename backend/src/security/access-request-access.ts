import type { Request } from "express";
import { findAccessRequestById } from "../data/access-requests.store.js";
import { ApiError } from "../errors/api-error.js";
import type { AccessRequest } from "../types/access-request.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getCurrentUserId(req: Request): number {
  const userId = req.currentUser?.id;

  if (!userId) {
    throw new ApiError(401, "UNAUTHORIZED", "Користувача не визначено.");
  }

  return userId;
}

export function rejectClientProvidedAccessRequestOwner(body: unknown): void {
  if (!isRecord(body)) {
    return;
  }

  if ("userId" in body || "isDeleted" in body) {
    throw new ApiError(
      400,
      "PROTECTED_FIELDS",
      "Поля userId та isDeleted визначаються сервером і не приймаються від клієнта.",
    );
  }
}

export async function requireOwnedAccessRequest(
  accessRequestId: number,
  currentUserId: number,
): Promise<AccessRequest> {
  const accessRequest = await findAccessRequestById(accessRequestId);

  if (!accessRequest || accessRequest.isDeleted) {
    throw new ApiError(404, "NOT_FOUND", "Заявку не знайдено.");
  }

  if (accessRequest.userId !== currentUserId) {
    throw new ApiError(403, "FORBIDDEN", "Немає доступу до чужої заявки.");
  }

  return accessRequest;
}
