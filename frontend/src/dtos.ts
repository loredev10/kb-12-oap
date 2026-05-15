export type UserRole = "student" | "teacher" | "lab_assistant" | "admin";

export interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequestDto {
  fullName: string;
  email: string;
  role: UserRole;
  notes?: string;
}

export interface AccessRequestResponseDto {
  id: number;
  userId: number;
  labName: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  comments: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccessRequestDto {
  userId: number;
  labName: string;
  requestedAt: string;
  comments?: string;
}

export interface ApiErrorDto {
  status: number;
  message: string;
  details?: string;
  errors?: Record<string, string[]>;
}