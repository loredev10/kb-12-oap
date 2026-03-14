import type {
  AccessRequestDto,
  AccessRequestValidationIssue,
} from "../types/access-request.js";

export function normalizeAccessRequestDto(body: unknown): AccessRequestDto {
  const dto = (body ?? {}) as Partial<AccessRequestDto>;

  const normalizedUserId =
    typeof dto.userId === "number"
      ? dto.userId
      : typeof dto.userId === "string"
        ? Number(dto.userId)
        : Number.NaN;

  return {
    userId: normalizedUserId,
    date: typeof dto.date === "string" ? dto.date.trim() : "",
    comments: typeof dto.comments === "string" ? dto.comments.trim() : "",
  };
}

function isValidDateString(value: string): boolean {
  if (value === "") return false;

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}

export function validateAccessRequestDto(
  dto: AccessRequestDto,
): AccessRequestValidationIssue[] {
  const errors: AccessRequestValidationIssue[] = [];

  if (!Number.isInteger(dto.userId) || dto.userId <= 0) {
    errors.push({
      field: "userId",
      message: "Некоректний userId.",
    });
  }

  if (dto.date === "") {
    errors.push({
      field: "date",
      message: "Дата є обов’язковою.",
    });
  } else if (!isValidDateString(dto.date)) {
    errors.push({
      field: "date",
      message: "Введіть коректну дату.",
    });
  }

  if (dto.comments === "") {
    errors.push({
      field: "comments",
      message: "Коментар є обов’язковим.",
    });
  } else if (dto.comments.length < 3 || dto.comments.length > 300) {
    errors.push({
      field: "comments",
      message: "Коментар має бути від 3 до 300 символів.",
    });
  }

  return errors;
}