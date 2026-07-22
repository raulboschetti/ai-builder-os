export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// La API sirve los archivos subidos (avatares) fuera del prefijo /api/v1,
// así que necesitamos el origen "pelado" para construir su URL completa.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+$/, "");

export function avatarUrl(image: string | null): string | null {
  if (!image) return null;
  if (image.startsWith("http")) return image; // avatar de Google, ya es absoluta
  return `${API_ORIGIN}${image}`;
}

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
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

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type ProjectBuildStage =
  | "INTAKE"
  | "ARCHITECTURE_GENERATED"
  | "BUILDING"
  | "DEPLOYED";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  status: ProjectStatus;
  businessVertical: string | null;
  description: string | null;
  buildStage: ProjectBuildStage;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  return parseResponse<T>(response);
}

/**
 * Igual que request(), pero añade el Bearer token y, si el access token
 * ha caducado (401), intenta renovarlo una vez con el refresh token antes
 * de rendirse. Si el refresh también falla, limpia la sesión para que el
 * que llama pueda redirigir a /login.
 */
async function authenticatedRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const accessToken = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });

  if (response.status !== 401) {
    return parseResponse<T>(response);
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearSession();
    throw new ApiError("Sesión caducada", 401);
  }

  try {
    const refreshed = await request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    storeSession(refreshed);
  } catch {
    clearSession();
    throw new ApiError("Sesión caducada", 401);
  }

  const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
      ...init?.headers,
    },
  });

  return parseResponse<T>(retryResponse);
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

export interface MeResponse {
  user: SessionUser;
  organization: { id: string; name: string; slug: string };
}

export function me() {
  return authenticatedRequest<MeResponse>("/auth/me");
}

export function listWorkspaces() {
  return authenticatedRequest<Workspace[]>("/workspaces");
}

export function createWorkspace(name: string) {
  return authenticatedRequest<Workspace>("/workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function listProjects(workspaceId: string) {
  return authenticatedRequest<Project[]>(
    `/workspaces/${workspaceId}/projects`,
  );
}

export interface ProjectAnalysis {
  id: string;
  viability: string;
  summary: string;
  keyFeatures: string[];
  risks: string[];
  recommendation: string;
  marketCostEstimate: string;
  createdAt: string;
}

export function generateAnalysis(workspaceId: string, projectId: string) {
  return authenticatedRequest<ProjectAnalysis>(
    `/workspaces/${workspaceId}/projects/${projectId}/analysis`,
    { method: "POST" },
  );
}

export function getLatestAnalysis(workspaceId: string, projectId: string) {
  return authenticatedRequest<ProjectAnalysis | null>(
    `/workspaces/${workspaceId}/projects/${projectId}/analysis`,
  );
}

export function getProject(workspaceId: string, projectId: string) {
  return authenticatedRequest<Project>(
    `/workspaces/${workspaceId}/projects/${projectId}`,
  );
}

export function updateProject(
  workspaceId: string,
  projectId: string,
  data: { name?: string; businessVertical?: string; description?: string },
) {
  return authenticatedRequest<Project>(
    `/workspaces/${workspaceId}/projects/${projectId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export function deleteProject(workspaceId: string, projectId: string) {
  return authenticatedRequest<void>(
    `/workspaces/${workspaceId}/projects/${projectId}`,
    { method: "DELETE" },
  );
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function listNotifications() {
  return authenticatedRequest<Notification[]>("/notifications");
}

export function markNotificationRead(id: string) {
  return authenticatedRequest<void>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export function markAllNotificationsRead() {
  return authenticatedRequest<void>("/notifications/read-all", {
    method: "PATCH",
  });
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export function listOrganizationUsers() {
  return authenticatedRequest<SessionUser[]>("/users");
}

export function listInvitations() {
  return authenticatedRequest<Invitation[]>("/invitations");
}

export function createInvitation(email: string) {
  return authenticatedRequest<Invitation>("/invitations", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function revokeInvitation(id: string) {
  return authenticatedRequest<void>(`/invitations/${id}`, {
    method: "DELETE",
  });
}

export interface InvitationPreview {
  email: string;
  organizationName: string;
}

export function getInvitation(token: string) {
  return request<InvitationPreview>(`/invitations/${token}`);
}

export function acceptInvitation(
  token: string,
  data: { name?: string; password: string },
) {
  return request<AuthResponse>(`/invitations/${token}/accept`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProfile(data: { name?: string }) {
  return authenticatedRequest<SessionUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function updateOrganization(name: string) {
  return authenticatedRequest<{ id: string; name: string; slug: string }>(
    "/organizations/me",
    {
      method: "PATCH",
      body: JSON.stringify({ name }),
    },
  );
}

export function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  return authenticatedRequest<void>("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Subida de archivo: no puede pasar por authenticatedRequest porque esa
 * función fuerza Content-Type: application/json. Aquí dejamos que el
 * navegador ponga el Content-Type multipart con el boundary correcto.
 */
export async function uploadAvatar(file: File): Promise<SessionUser> {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: formData,
  });

  return parseResponse<SessionUser>(response);
}

export function createProject(
  workspaceId: string,
  data: { name: string; businessVertical?: string; description?: string },
) {
  return authenticatedRequest<Project>(
    `/workspaces/${workspaceId}/projects`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

const ACCESS_TOKEN_KEY = "aibuilder_access_token";
const REFRESH_TOKEN_KEY = "aibuilder_refresh_token";

export function storeSession(auth: AuthResponse) {
  storeTokens(auth.accessToken, auth.refreshToken);
}

export function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}
