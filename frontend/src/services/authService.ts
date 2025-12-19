import apiClient from './api';
import { LoginRequest, UserCreate, Token, User, UserPublic } from '../types';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: UserCreate): Promise<UserPublic> {
    const response = await apiClient.post<UserPublic>('/auth/register', userData);
    return response.data;
  }

  /**
   * Login with email and password
   */
  static async login(loginData: LoginRequest): Promise<Token> {
    const response = await apiClient.post<Token>('/auth/login', loginData);
    
    // Store tokens in localStorage
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    return response.data;
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<Token> {
    const response = await apiClient.post<Token>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    // Update stored tokens
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    return response.data;
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  /**
   * Get stored access token
   */
  static getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get stored refresh token
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
}

export default AuthService;
