export type UserRole = "student" | "teacher" | "lab_assistant" | "admin" | "";

export type User = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  notes: string;
};

export type UserDto = {
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

export type ValidationIssue = {
  field: keyof UserDto;
  message: string;
};