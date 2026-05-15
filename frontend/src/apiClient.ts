import { API_BASE_URL } from "./config";
import type {
  AccessRequestResponseDto,
  ApiErrorDto,
  CreateAccessRequestDto,
  CreateUserRequestDto,
  UserResponseDto,
} from "./dtos";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  let response: Response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    const apiError: ApiErrorDto = {
      status: 0,
      message: "Помилка мережі або CORS",
      details: error instanceof Error ? error.message : String(error),
    };

    throw apiError;
  }

  if (response.status === 204) {
    return null as T;
  }

  const rawText = await response.text();

  if (response.ok) {
    if (!rawText) {
      return null as T;
    }

    return JSON.parse(rawText) as T;
  }

  let payload: unknown = null;

  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = null;
  }

  const errorPayload = payload as Partial<ApiErrorDto> | null;

  const apiError: ApiErrorDto = {
    status: response.status,
    message: errorPayload?.message || "HTTP помилка",
    details: errorPayload?.details || rawText || `HTTP ${response.status}`,
    errors: errorPayload?.errors,
  };

  throw apiError;
}

export async function getUsers(): Promise<UserResponseDto[]> {
  return request<UserResponseDto[]>("/users");
}

export async function getUserById(id: number): Promise<UserResponseDto> {
  return request<UserResponseDto>(`/users/${id}`);
}

export async function createUser(
  dto: CreateUserRequestDto,
): Promise<UserResponseDto> {
  return request<UserResponseDto>("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function deleteUser(id: number): Promise<void> {
  return request<void>(`/users/${id}`, {
    method: "DELETE",
  });
}

export async function getAccessRequests(): Promise<AccessRequestResponseDto[]> {
  return request<AccessRequestResponseDto[]>("/access-requests");
}

export async function createAccessRequest(
  dto: CreateAccessRequestDto,
): Promise<AccessRequestResponseDto> {
  return request<AccessRequestResponseDto>("/access-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}