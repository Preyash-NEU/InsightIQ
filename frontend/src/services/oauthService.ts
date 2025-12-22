import apiClient from './api';
import { Token } from '../types';

export class OAuthService {
  /**
   * Initiate Google OAuth flow
   */
  static async initiateGoogleLogin(): Promise<void> {
    try {
      // Get authorization URL from backend
      const response = await apiClient.get('/auth/google');
      const { auth_url, state } = response.data;
      
      // Store state for verification
      sessionStorage.setItem('oauth_state', state);
      
      // Redirect to Google auth
      window.location.href = auth_url;
    } catch (error) {
      console.error('Google OAuth initiation failed:', error);
      throw error;
    }
  }

  /**
   * Initiate GitHub OAuth flow
   */
  static async initiateGitHubLogin(): Promise<void> {
    try {
      // Get authorization URL from backend
      const response = await apiClient.get('/auth/github');
      const { auth_url, state } = response.data;
      
      // Store state for verification
      sessionStorage.setItem('oauth_state', state);
      
      // Redirect to GitHub auth
      window.location.href = auth_url;
    } catch (error) {
      console.error('GitHub OAuth initiation failed:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback (Google)
   */
  static async handleGoogleCallback(code: string, state: string): Promise<Token> {
    // Verify state matches
    const savedState = sessionStorage.getItem('oauth_state');
    if (savedState !== state) {
      throw new Error('Invalid OAuth state');
    }
    
    // Exchange code for tokens
    const response = await apiClient.post<Token>('/auth/google/callback', {
      code,
      state
    });
    
    // Store tokens
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    // Clean up
    sessionStorage.removeItem('oauth_state');
    
    return response.data;
  }

  /**
   * Handle OAuth callback (GitHub)
   */
  static async handleGitHubCallback(code: string, state: string): Promise<Token> {
    // Verify state matches
    const savedState = sessionStorage.getItem('oauth_state');
    if (savedState !== state) {
      throw new Error('Invalid OAuth state');
    }
    
    // Exchange code for tokens
    const response = await apiClient.post<Token>('/auth/github/callback', {
      code,
      state
    });
    
    // Store tokens
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    // Clean up
    sessionStorage.removeItem('oauth_state');
    
    return response.data;
  }
}

export default OAuthService;
