import type {
  AccessRequestValidationIssue,
  CreateAccessRequestRequestDto,
  UpdateAccessRequestRequestDto,
} from "../types/access-request.js";

const MAX_ACCESS_DURATION_MS = 5 * 60 * 60 * 1000;

function normalizeUserId(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return Number.NaN;
}

export function normalizeCreateAccessRequestRequestDto(
  body: unknown,
): CreateAccessRequestRequestDto {
  const dto = (body ?? {}) as Partial<CreateAccessRequestRequestDto>;

  return {
    userId: normalizeUserId(dto.userId),
    startDateTime:
      typeof dto.startDateTime === "string" ? dto.startDateTime.trim() : "",
    endDateTime:
      typeof dto.endDateTime === "string" ? dto.endDateTime.trim() : "",
    comments: typeof dto.comments === "string" ? dto.comments.trim() : "",
  };
}

export function normalizeUpdateAccessRequestRequestDto(
  body: unknown,
): UpdateAccessRequestRequestDto {
  const dto = (body ?? {}) as Partial<UpdateAccessRequestRequestDto>;

  return {
    userId: normalizeUserId(dto.userId),
    startDateTime:
      typeof dto.startDateTime === "string" ? dto.startDateTime.trim() : "",
    endDateTime:
      typeof dto.endDateTime === "string" ? dto.endDateTime.trim() : "",
    comments: typeof dto.comments === "string" ? dto.comments.trim() : "",
  };
}

function isValidDateTimeString(value: string): boolean {
  if (value === "") return false;

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}

export function validateCreateAccessRequestRequestDto(
  dto: CreateAccessRequestRequestDto,
): AccessRequestValidationIssue[] {
  const errors: AccessRequestValidationIssue[] = [];

  if (!Number.isInteger(dto.userId) || dto.userId <= 0) {
    errors.push({
      field: "userId",
      message: "Некоректний userId.",
    });
  }

  if (dto.startDateTime === "") {
    errors.push({
      field: "startDateTime",
      message: "Дата і час початку є обов’язковими.",
    });
  } else if (!isValidDateTimeString(dto.startDateTime)) {
    errors.push({
      field: "startDateTime",
      message: "Введіть коректну дату і час початку.",
    });
  }

  if (dto.endDateTime === "") {
    errors.push({
      field: "endDateTime",
      message: "Дата і час завершення є обов’язковими.",
    });
  } else if (!isValidDateTimeString(dto.endDateTime)) {
    errors.push({
      field: "endDateTime",
      message: "Введіть коректну дату і час завершення.",
    });
  }

  if (
    dto.startDateTime !== "" &&
    dto.endDateTime !== "" &&
    isValidDateTimeString(dto.startDateTime) &&
    isValidDateTimeString(dto.endDateTime)
  ) {
    const start = Date.parse(dto.startDateTime);
    const end = Date.parse(dto.endDateTime);
    const durationMs = end - start;

    if (end <= start) {
      errors.push({
        field: "endDateTime",
        message: "Час завершення має бути пізніше за час початку.",
      });
    } else if (durationMs > MAX_ACCESS_DURATION_MS) {
      errors.push({
        field: "endDateTime",
        message: "Тривалість доступу не може перевищувати 5 годин.",
      });
    }
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

export function validateUpdateAccessRequestRequestDto(
  dto: UpdateAccessRequestRequestDto,
): AccessRequestValidationIssue[] {
  return validateCreateAccessRequestRequestDto(dto);
}