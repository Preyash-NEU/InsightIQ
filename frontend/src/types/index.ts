// Types matching backend schemas

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
}

export interface UserPublic {
  id: string;
  email: string;
  full_name: string;
  is_verified: boolean;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface TokenRefresh {
  refresh_token: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface ApiError {
  detail: string;
}

export interface UserStats {
  total_queries: number;
  total_data_sources: number;
  storage_used_mb: number;
  member_since: string;
}
