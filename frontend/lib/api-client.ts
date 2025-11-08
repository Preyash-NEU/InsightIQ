import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:8000";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string | null;
}

export interface TokenResponse<TUser = unknown> {
  access_token: string;
  token_type: string;
  user: TUser;
}

export async function login(payload: LoginPayload) {
  return apiClient.post<TokenResponse>("/api/v1/auth/login", payload);
}

export async function register(payload: RegisterPayload) {
  return apiClient.post<TokenResponse>("/api/v1/auth/register", payload);
}

export async function fetchCurrentUser(token: string) {
  return apiClient.get("/api/v1/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
