export type UserRole = "student" | "teacher" | "lab_assistant" | "admin" | "";

export type User = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  notes: string;
};

export type CreateUserRequestDto = {
  fullName: string;
  email: string;
  role: UserRole;
  notes: string;
};

export type UpdateUserRequestDto = {
  fullName: string;
  email: string;
  role: UserRole;
  notes: string;
};

export type UserResponseDto = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  notes: string;
};

export type UserValidationIssue = {
  field: keyof CreateUserRequestDto;
  message: string;
};