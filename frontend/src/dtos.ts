export type UserRole = "student" | "teacher" | "lab_assistant" | "admin";

export type AccessRequestStatus = "pending" | "approved" | "rejected";

export type EntityStatusFilter = "active" | "deleted" | "all";

export interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  notes: string;
}

export interface CreateUserRequestDto {
  fullName: string;
  email: string;
  role: UserRole;
  notes: string;
}

export interface UpdateUserRequestDto {
  fullName: string;
  email: string;
  role: UserRole;
  notes: string;
}

export interface AccessRequestResponseDto {
  id: number;
  userId: number;
  startDateTime: string;
  endDateTime: string;
  comments: string;
  status: AccessRequestStatus;
}

export interface AccessRequestWithUserResponseDto {
  id: number;
  userId: number;
  startDateTime: string;
  endDateTime: string;
  comments: string;
  status: AccessRequestStatus;
  isDeleted: boolean;
  userFullName: string;
  userEmail: string;
  userRole: UserRole;
}

export interface CreateAccessRequestRequestDto {
  startDateTime: string;
  endDateTime: string;
  comments: string;
  status: AccessRequestStatus;
}

export interface UpdateAccessRequestRequestDto {
  startDateTime: string;
  endDateTime: string;
  comments: string;
  status: AccessRequestStatus;
}

export interface ApiValidationIssue {
  field: string;
  message: string;
}

export interface ApiErrorResponseDto {
  error: {
    code: string;
    message: string;
    details: ApiValidationIssue[] | unknown | null;
  };
}

export interface ApiClientError {
  status: number;
  code: string;
  message: string;
  details: unknown;
}