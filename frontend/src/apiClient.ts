import { API_BASE_URL } from "./config";
import type {
  AccessRequestResponseDto,
  AccessRequestWithUserResponseDto,
  ApiClientError,
  ApiErrorResponseDto,
  CreateAccessRequestRequestDto,
  CreateUserRequestDto,
  EntityStatusFilter,
  UpdateAccessRequestRequestDto,
  UpdateUserRequestDto,
  UserResponseDto,
} from "./dtos";

type ItemsResponse<T> = {
  items: T[];
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  let response: Response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    const apiError: ApiClientError = {
      status: 0,
      code: "NETWORK_OR_CORS_ERROR",
      message: "Помилка мережі або CORS.",
      details: error instanceof Error ? error.message : String(error),
    };

    throw apiError;
  }

  if (response.status === 204) {
    return null as T;
  }

  const rawText = await response.text();

  if (response.ok) {
    return rawText ? (JSON.parse(rawText) as T) : (null as T);
  }

  let parsedError: ApiErrorResponseDto | null = null;

  try {
    parsedError = rawText ? (JSON.parse(rawText) as ApiErrorResponseDto) : null;
  } catch {
    parsedError = null;
  }

  const apiError: ApiClientError = {
    status: response.status,
    code: parsedError?.error.code ?? "HTTP_ERROR",
    message: parsedError?.error.message ?? "HTTP помилка.",
    details: parsedError?.error.details ?? rawText,
  };

  throw apiError;
}

function jsonOptions(method: "POST" | "PUT" | "PATCH", body: unknown): RequestInit {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

export async function getUsers(
  status: EntityStatusFilter = "active",
): Promise<UserResponseDto[]> {
  const response = await request<ItemsResponse<UserResponseDto>>(
    `/users?status=${encodeURIComponent(status)}`,
  );

  return response.items;
}

export async function getUserById(id: number): Promise<UserResponseDto> {
  return request<UserResponseDto>(`/users/${id}`);
}

export async function createUser(
  dto: CreateUserRequestDto,
): Promise<UserResponseDto> {
  return request<UserResponseDto>("/users", jsonOptions("POST", dto));
}

export async function updateUser(
  id: number,
  dto: UpdateUserRequestDto,
): Promise<UserResponseDto> {
  return request<UserResponseDto>(`/users/${id}`, jsonOptions("PUT", dto));
}

export async function deleteUser(id: number): Promise<void> {
  return request<void>(`/users/${id}`, {
    method: "DELETE",
  });
}

export async function getAccessRequests(
  status: EntityStatusFilter = "active",
): Promise<AccessRequestResponseDto[]> {
  const response = await request<ItemsResponse<AccessRequestResponseDto>>(
    `/access-requests?status=${encodeURIComponent(status)}`,
  );

  return response.items;
}

export async function getAccessRequestsWithUsers(
  status: EntityStatusFilter = "active",
  limit = 100,
): Promise<AccessRequestWithUserResponseDto[]> {
  const response = await request<ItemsResponse<AccessRequestWithUserResponseDto>>(
    `/access-requests/with-users?status=${encodeURIComponent(status)}&limit=${limit}`,
  );

  return response.items;
}

export async function createAccessRequest(
  dto: CreateAccessRequestRequestDto,
): Promise<AccessRequestResponseDto> {
  return request<AccessRequestResponseDto>(
    "/access-requests",
    jsonOptions("POST", dto),
  );
}

export async function updateAccessRequest(
  id: number,
  dto: UpdateAccessRequestRequestDto,
): Promise<AccessRequestResponseDto> {
  return request<AccessRequestResponseDto>(
    `/access-requests/${id}`,
    jsonOptions("PUT", dto),
  );
}

export async function deleteAccessRequest(id: number): Promise<void> {
  return request<void>(`/access-requests/${id}`, {
    method: "DELETE",
  });
}