import type {
  CreateUserRequestDto,
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

export function validateCreateUserRequestDto(
  dto: CreateUserRequestDto,
): UserValidationIssue[] {
  const errors: UserValidationIssue[] = [];

  if (dto.fullName === "") {
    errors.push({
      field: "fullName",
      message: "Поле є обов’язковим.",
    });
  } else if (dto.fullName.length < 3 || dto.fullName.length > 60) {
    errors.push({
      field: "fullName",
      message: "Довжина має бути від 3 до 60 символів.",
    });
  }

  if (dto.email === "") {
    errors.push({
      field: "email",
      message: "Email є обов’язковим.",
    });
  } else if (!isValidEmail(dto.email)) {
    errors.push({
      field: "email",
      message: "Введіть коректний Email.",
    });
  }

  if (dto.role === "") {
    errors.push({
      field: "role",
      message: "Оберіть роль.",
    });
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