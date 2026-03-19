import type {
  CreateUserRequestDto,
  PatchUserRequestDto,
  UpdateUserRequestDto,
  UserRole,
  UserValidationIssue,
} from "../types/user.js";

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizeCreateUserRequestDto(
  body: unknown,
): CreateUserRequestDto {
  const dto = (body ?? {}) as Partial<CreateUserRequestDto>;

  return {
    fullName: typeof dto.fullName === "string" ? dto.fullName.trim() : "",
    email: typeof dto.email === "string" ? dto.email.trim() : "",
    role: typeof dto.role === "string" ? (dto.role.trim() as UserRole) : "",
    notes: typeof dto.notes === "string" ? dto.notes.trim() : "",
  };
}

export function normalizeUpdateUserRequestDto(
  body: unknown,
): UpdateUserRequestDto {
  const dto = (body ?? {}) as Partial<UpdateUserRequestDto>;

  return {
    fullName: typeof dto.fullName === "string" ? dto.fullName.trim() : "",
    email: typeof dto.email === "string" ? dto.email.trim() : "",
    role: typeof dto.role === "string" ? (dto.role.trim() as UserRole) : "",
    notes: typeof dto.notes === "string" ? dto.notes.trim() : "",
  };
}

export function normalizePatchUserRequestDto(
  body: unknown,
): PatchUserRequestDto {
  const dto = (body ?? {}) as Partial<PatchUserRequestDto>;
  const result: PatchUserRequestDto = {};

  if ("fullName" in dto) {
    result.fullName =
      typeof dto.fullName === "string" ? dto.fullName.trim() : "";
  }

  if ("email" in dto) {
    result.email = typeof dto.email === "string" ? dto.email.trim() : "";
  }

  if ("role" in dto) {
    result.role =
      typeof dto.role === "string" ? (dto.role.trim() as UserRole) : "";
  }

  if ("notes" in dto) {
    result.notes = typeof dto.notes === "string" ? dto.notes.trim() : "";
  }

  if ("isDeleted" in dto) {
    result.isDeleted =
      typeof dto.isDeleted === "boolean" ? dto.isDeleted : undefined;
  }

  return result;
}

export function validateCreateUserRequestDto(
  dto: CreateUserRequestDto,
): UserValidationIssue[] {
  const errors: UserValidationIssue[] = [];

  if (dto.fullName === "") {
    errors.push({ field: "fullName", message: "Поле є обов’язковим." });
  } else if (dto.fullName.length < 3 || dto.fullName.length > 60) {
    errors.push({
      field: "fullName",
      message: "Довжина має бути від 3 до 60 символів.",
    });
  }

  if (dto.email === "") {
    errors.push({ field: "email", message: "Email є обов’язковим." });
  } else if (!isValidEmail(dto.email)) {
    errors.push({ field: "email", message: "Введіть коректний Email." });
  }

  if (dto.role === "") {
    errors.push({ field: "role", message: "Оберіть роль." });
  }

  if (dto.notes !== "" && dto.notes.length < 5) {
    errors.push({
      field: "notes",
      message:
        "Коментар має містити щонайменше 5 символів (або залиште порожнім).",
    });
  }

  return errors;
}

export function validateUpdateUserRequestDto(
  dto: UpdateUserRequestDto,
): UserValidationIssue[] {
  return validateCreateUserRequestDto(dto);
}

export function validatePatchUserRequestDto(
  dto: PatchUserRequestDto,
): UserValidationIssue[] {
  const errors: UserValidationIssue[] = [];

  if ("fullName" in dto) {
    if (dto.fullName === "") {
      errors.push({ field: "fullName", message: "Поле є обов’язковим." });
    } else if (
      (dto.fullName?.length ?? 0) < 3 ||
      (dto.fullName?.length ?? 0) > 60
    ) {
      errors.push({
        field: "fullName",
        message: "Довжина має бути від 3 до 60 символів.",
      });
    }
  }

  if ("email" in dto) {
    if (dto.email === "") {
      errors.push({ field: "email", message: "Email є обов’язковим." });
    } else if (!isValidEmail(dto.email ?? "")) {
      errors.push({ field: "email", message: "Введіть коректний Email." });
    }
  }

  if ("role" in dto && dto.role === "") {
    errors.push({ field: "role", message: "Оберіть роль." });
  }

  if (
    "notes" in dto &&
    dto.notes !== undefined &&
    dto.notes !== "" &&
    dto.notes.length < 5
  ) {
    errors.push({
      field: "notes",
      message:
        "Коментар має містити щонайменше 5 символів (або залиште порожнім).",
    });
  }

  if ("isDeleted" in dto && typeof dto.isDeleted !== "boolean") {
    errors.push({
      field: "isDeleted",
      message: "Поле isDeleted має бути boolean.",
    });
  }

  return errors;
}
