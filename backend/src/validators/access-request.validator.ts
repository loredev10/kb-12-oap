import type {
  AccessRequestStatus,
  AccessRequestValidationIssue,
  CreateAccessRequestRequestDto,
  PatchAccessRequestRequestDto,
  UpdateAccessRequestRequestDto,
} from "../types/access-request.js";

const MAX_ACCESS_DURATION_MS = 5 * 60 * 60 * 1000;
const ACCESS_REQUEST_STATUSES: AccessRequestStatus[] = [
  "pending",
  "approved",
  "rejected",
];

function normalizeStatus(value: unknown): AccessRequestStatus {
  if (typeof value !== "string") {
    return "" as AccessRequestStatus;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "pending" ||
    normalized === "approved" ||
    normalized === "rejected"
  ) {
    return normalized;
  }

  return "" as AccessRequestStatus;
}

function isValidStatus(value: unknown): value is AccessRequestStatus {
  return (
    typeof value === "string" &&
    ACCESS_REQUEST_STATUSES.includes(value as AccessRequestStatus)
  );
}

function isValidDateTimeString(value: string): boolean {
  if (value === "") {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}

function validateAccessRequestFields(
  dto: CreateAccessRequestRequestDto | UpdateAccessRequestRequestDto,
): AccessRequestValidationIssue[] {
  const errors: AccessRequestValidationIssue[] = [];

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

  if (!isValidStatus(dto.status)) {
    errors.push({
      field: "status",
      message: "Оберіть коректний статус заявки.",
    });
  }

  return errors;
}

export function normalizeCreateAccessRequestRequestDto(
  body: unknown,
): CreateAccessRequestRequestDto {
  const dto = (body ?? {}) as Partial<CreateAccessRequestRequestDto>;

  return {
    startDateTime:
      typeof dto.startDateTime === "string" ? dto.startDateTime.trim() : "",
    endDateTime:
      typeof dto.endDateTime === "string" ? dto.endDateTime.trim() : "",
    comments: typeof dto.comments === "string" ? dto.comments.trim() : "",
    status: normalizeStatus(dto.status),
  };
}

export function normalizeUpdateAccessRequestRequestDto(
  body: unknown,
): UpdateAccessRequestRequestDto {
  const dto = (body ?? {}) as Partial<UpdateAccessRequestRequestDto>;

  return {
    startDateTime:
      typeof dto.startDateTime === "string" ? dto.startDateTime.trim() : "",
    endDateTime:
      typeof dto.endDateTime === "string" ? dto.endDateTime.trim() : "",
    comments: typeof dto.comments === "string" ? dto.comments.trim() : "",
    status: normalizeStatus(dto.status),
  };
}

export function normalizePatchAccessRequestRequestDto(
  body: unknown,
): PatchAccessRequestRequestDto {
  const dto = (body ?? {}) as Partial<PatchAccessRequestRequestDto>;
  const result: PatchAccessRequestRequestDto = {};

  if ("startDateTime" in dto) {
    result.startDateTime =
      typeof dto.startDateTime === "string" ? dto.startDateTime.trim() : "";
  }

  if ("endDateTime" in dto) {
    result.endDateTime =
      typeof dto.endDateTime === "string" ? dto.endDateTime.trim() : "";
  }

  if ("comments" in dto) {
    result.comments =
      typeof dto.comments === "string" ? dto.comments.trim() : "";
  }

  if ("status" in dto) {
    result.status =
      typeof dto.status === "string"
        ? (dto.status.trim().toLowerCase() as AccessRequestStatus)
        : ("" as AccessRequestStatus);
  }

  return result;
}

export function validateCreateAccessRequestRequestDto(
  dto: CreateAccessRequestRequestDto,
): AccessRequestValidationIssue[] {
  return validateAccessRequestFields(dto);
}

export function validateUpdateAccessRequestRequestDto(
  dto: UpdateAccessRequestRequestDto,
): AccessRequestValidationIssue[] {
  return validateAccessRequestFields(dto);
}

export function validatePatchAccessRequestRequestDto(
  dto: PatchAccessRequestRequestDto,
): AccessRequestValidationIssue[] {
  const errors: AccessRequestValidationIssue[] = [];

  if ("startDateTime" in dto) {
    if (dto.startDateTime === "") {
      errors.push({
        field: "startDateTime",
        message: "Дата і час початку є обов’язковими.",
      });
    } else if (!isValidDateTimeString(dto.startDateTime ?? "")) {
      errors.push({
        field: "startDateTime",
        message: "Введіть коректну дату і час початку.",
      });
    }
  }

  if ("endDateTime" in dto) {
    if (dto.endDateTime === "") {
      errors.push({
        field: "endDateTime",
        message: "Дата і час завершення є обов’язковими.",
      });
    } else if (!isValidDateTimeString(dto.endDateTime ?? "")) {
      errors.push({
        field: "endDateTime",
        message: "Введіть коректну дату і час завершення.",
      });
    }
  }

  if ("comments" in dto) {
    if (dto.comments === "") {
      errors.push({
        field: "comments",
        message: "Коментар є обов’язковим.",
      });
    } else if (
      (dto.comments?.length ?? 0) < 3 ||
      (dto.comments?.length ?? 0) > 300
    ) {
      errors.push({
        field: "comments",
        message: "Коментар має бути від 3 до 300 символів.",
      });
    }
  }

  if ("status" in dto && !isValidStatus(dto.status)) {
    errors.push({
      field: "status",
      message: "Оберіть коректний статус заявки.",
    });
  }

  return errors;
}
