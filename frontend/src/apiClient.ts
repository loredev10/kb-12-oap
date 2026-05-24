import { API_BASE_URL, DEMO_USER_ID } from "./config";
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

function isApiErrorResponse(value: unknown): value is ApiErrorResponseDto {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("error" in value)) {
    return false;
  }

  const error = (value as { error: unknown }).error;

  if (typeof error !== "object" || error === null) {
    return false;
  }

  return "message" in error;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  let response: Response;

  try {
  response = await fetchWithTimeout(url, options);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "REQUEST_TIMEOUT"
    ) {
      throw error;
    }

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

  let parsedBody: unknown = null;

  try {
    parsedBody = rawText ? JSON.parse(rawText) : null;
  } catch {
    parsedBody = null;
  }

  if (isApiErrorResponse(parsedBody)) {
    const apiError: ApiClientError = {
      status: response.status,
      code: parsedBody.error.code,
      message: parsedBody.error.message,
      details: parsedBody.error.details,
    };

    throw apiError;
  }

  const apiError: ApiClientError = {
    status: response.status,
    code: "HTTP_ERROR",
    message: "HTTP помилка.",
    details: rawText || `HTTP ${response.status}`,
  };

  throw apiError;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10_000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers(options.headers);
    headers.set("X-Demo-UserId", DEMO_USER_ID);

    return await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw {
        status: 0,
        code: "REQUEST_TIMEOUT",
        message: "Запит перевищив таймаут.",
        details: "Бекенд не відповів протягом 10 секунд.",
      } satisfies ApiClientError;
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function jsonOptions(
  method: "POST" | "PUT" | "PATCH",
  body: unknown,
): RequestInit {
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

export async function testServerError(): Promise<void> {
  return request<void>("/debug/500");
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