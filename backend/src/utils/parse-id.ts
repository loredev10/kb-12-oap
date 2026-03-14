import { ApiError } from "../errors/api-error.js";

export function parseId(rawId: string): number {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "INVALID_ID", "Некоректний id.");
  }

  return id;
}