const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
}

export interface SessionOrganization {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
  organization: SessionOrganization;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (body && (body.message || body.error)) || "Ha ocurrido un error";
    throw new ApiError(
      Array.isArray(message) ? message.join(", ") : message,
      response.status,
    );
  }

  return body as T;
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(data: {
  name?: string;
  email: string;
  password: string;
  organizationName?: string;
}) {
  return request<SessionUser>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

const ACCESS_TOKEN_KEY = "aibuilder_access_token";
const REFRESH_TOKEN_KEY = "aibuilder_refresh_token";

export function storeSession(auth: AuthResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
