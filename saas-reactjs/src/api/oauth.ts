import { api } from './axios';

export interface OAuthTokenResponse {
  jwtToken: string;
  refreshToken: string;
  username: string;
  tokenType?: string;
}

/**
 * OAuth API Client
 */
export const oauthApi = {
  /**
   * Check if OAuth is enabled
   */
  isEnabled: async (): Promise<boolean> => {
    try {
      const response = await api.get<{ enabled: boolean }>('/auth/oauth/enabled');
      return response.data.enabled;
    } catch {
      return false;
    }
  },

  /**
   * Get Google authorization URL
   */
  getGoogleAuthUrl: async (): Promise<{ authorizationUrl: string; state: string }> => {
    const response = await api.get<{ authorizationUrl: string; state: string }>(
      '/auth/oauth/google/authorize'
    );
    return response.data;
  },

  /**
   * Handle OAuth callback and receive JWT tokens
   */
  handleCallback: async (code: string, state: string): Promise<OAuthTokenResponse> => {
    const response = await api.get<OAuthTokenResponse>('/auth/oauth/google/callback', {
      params: { code, state },
    });
    return response.data;
  },
};
