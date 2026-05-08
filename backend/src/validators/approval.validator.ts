import type {
  ApprovalDecision,
  ApprovalValidationIssue,
  CreateApprovalRequestDto,
  PatchApprovalRequestDto,
  UpdateApprovalRequestDto,
} from "../types/approval.js";

const APPROVAL_DECISIONS: ApprovalDecision[] = ["approved", "rejected"];

function normalizeNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return Number.NaN;
}

function normalizeDecision(value: unknown): ApprovalDecision | "" {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "approved" || normalized === "rejected") {
    return normalized;
  }

  return "";
}

function isValidDecision(value: unknown): value is ApprovalDecision {
  return (
    typeof value === "string" &&
    APPROVAL_DECISIONS.includes(value as ApprovalDecision)
  );
}

function isValidDateTimeString(value: string): boolean {
  if (value === "") {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}

export function normalizeCreateApprovalRequestDto(
  body: unknown,
): CreateApprovalRequestDto {
  const dto = (body ?? {}) as Partial<CreateApprovalRequestDto>;

  return {
    accessRequestId: normalizeNumber(dto.accessRequestId),
    approvedByUserId: normalizeNumber(dto.approvedByUserId),
    decision: normalizeDecision(dto.decision) as ApprovalDecision,
    comment: typeof dto.comment === "string" ? dto.comment.trim() : "",
    approvedAt: typeof dto.approvedAt === "string" ? dto.approvedAt.trim() : "",
  };
}

export function normalizeUpdateApprovalRequestDto(
  body: unknown,
): UpdateApprovalRequestDto {
  const dto = (body ?? {}) as Partial<UpdateApprovalRequestDto>;

  return {
    accessRequestId: normalizeNumber(dto.accessRequestId),
    approvedByUserId: normalizeNumber(dto.approvedByUserId),
    decision: normalizeDecision(dto.decision) as ApprovalDecision,
    comment: typeof dto.comment === "string" ? dto.comment.trim() : "",
    approvedAt: typeof dto.approvedAt === "string" ? dto.approvedAt.trim() : "",
  };
}

export function normalizePatchApprovalRequestDto(
  body: unknown,
): PatchApprovalRequestDto {
  const dto = (body ?? {}) as Partial<PatchApprovalRequestDto>;
  const result: PatchApprovalRequestDto = {};

  if ("accessRequestId" in dto) {
    result.accessRequestId = normalizeNumber(dto.accessRequestId);
  }

  if ("approvedByUserId" in dto) {
    result.approvedByUserId = normalizeNumber(dto.approvedByUserId);
  }

  if ("decision" in dto) {
    const normalizedDecision = normalizeDecision(dto.decision);
    result.decision =
      normalizedDecision === ""
        ? undefined
        : (normalizedDecision as ApprovalDecision);
  }

  if ("comment" in dto) {
    result.comment = typeof dto.comment === "string" ? dto.comment.trim() : "";
  }

  if ("approvedAt" in dto) {
    result.approvedAt =
      typeof dto.approvedAt === "string" ? dto.approvedAt.trim() : "";
  }

  if ("isDeleted" in dto) {
    result.isDeleted =
      typeof dto.isDeleted === "boolean" ? dto.isDeleted : undefined;
  }

  return result;
}

export function validateCreateApprovalRequestDto(
  dto: CreateApprovalRequestDto,
): ApprovalValidationIssue[] {
  const errors: ApprovalValidationIssue[] = [];

  if (!Number.isInteger(dto.accessRequestId) || dto.accessRequestId <= 0) {
    errors.push({
      field: "accessRequestId",
      message: "Некоректний accessRequestId.",
    });
  }

  if (!Number.isInteger(dto.approvedByUserId) || dto.approvedByUserId <= 0) {
    errors.push({
      field: "approvedByUserId",
      message: "Некоректний approvedByUserId.",
    });
  }

  if (!isValidDecision(dto.decision)) {
    errors.push({
      field: "decision",
      message: "Оберіть коректне рішення.",
    });
  }

  if (dto.comment.length > 300) {
    errors.push({
      field: "comment",
      message: "Коментар не може бути довшим за 300 символів.",
    });
  }

  if (dto.approvedAt === "") {
    errors.push({
      field: "approvedAt",
      message: "Дата і час рішення є обов’язковими.",
    });
  } else if (!isValidDateTimeString(dto.approvedAt)) {
    errors.push({
      field: "approvedAt",
      message: "Введіть коректну дату і час рішення.",
    });
  }

  return errors;
}

export function validateUpdateApprovalRequestDto(
  dto: UpdateApprovalRequestDto,
): ApprovalValidationIssue[] {
  return validateCreateApprovalRequestDto(dto);
}

export function validatePatchApprovalRequestDto(
  dto: PatchApprovalRequestDto,
): ApprovalValidationIssue[] {
  const errors: ApprovalValidationIssue[] = [];

  if (
    "accessRequestId" in dto &&
    (!Number.isInteger(dto.accessRequestId) || (dto.accessRequestId ?? 0) <= 0)
  ) {
    errors.push({
      field: "accessRequestId",
      message: "Некоректний accessRequestId.",
    });
  }

  if (
    "approvedByUserId" in dto &&
    (!Number.isInteger(dto.approvedByUserId) ||
      (dto.approvedByUserId ?? 0) <= 0)
  ) {
    errors.push({
      field: "approvedByUserId",
      message: "Некоректний approvedByUserId.",
    });
  }

  if ("decision" in dto && !isValidDecision(dto.decision)) {
    errors.push({
      field: "decision",
      message: "Оберіть коректне рішення.",
    });
  }

  if ("comment" in dto && (dto.comment?.length ?? 0) > 300) {
    errors.push({
      field: "comment",
      message: "Коментар не може бути довшим за 300 символів.",
    });
  }

  if ("approvedAt" in dto) {
    if (dto.approvedAt === "") {
      errors.push({
        field: "approvedAt",
        message: "Дата і час рішення є обов’язковими.",
      });
    } else if (!isValidDateTimeString(dto.approvedAt ?? "")) {
      errors.push({
        field: "approvedAt",
        message: "Введіть коректну дату і час рішення.",
      });
    }
  }

  if ("isDeleted" in dto && typeof dto.isDeleted !== "boolean") {
    errors.push({
      field: "isDeleted",
      message: "Поле isDeleted має бути boolean.",
    });
  }

  return errors;
}