import { api } from './axios';
import { ApiResponse } from '../types/api';

/**
 * Settings API Types
 */
export interface EmailSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  fromName: string;
  enabled: boolean;
  verificationBaseUrl: string;
  passwordResetBaseUrl: string;
  smtpAuth: boolean;
  smtpTls: boolean;
}

export interface SecuritySettings {
  maxFailedLoginAttempts: number;
  accountLockoutDuration: number;
  passwordMinLength: number;
  passwordMaxLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireDigit: boolean;
  passwordRequireSpecialChar: boolean;
  sessionTimeout: number;
  requireEmailVerification: boolean;
  emailVerificationTokenExpiry: number;
  passwordResetTokenExpiry: number;
}

export interface RateLimitSettings {
  loginRequests: number;
  loginDuration: number;
  registrationRequests: number;
  registrationDuration: number;
  passwordChangeRequests: number;
  passwordChangeDuration: number;
  generalRequests: number;
  generalDuration: number;
}

export interface FileStorageSettings {
  mode: 'local' | 's3';
  maxFileSize: number;
  allowedImageTypes: string;
  localBasePath: string;
  localPublicPrefix: string;
  s3BucketName: string;
  s3Region: string;
  s3AccessKey: string;
  s3SecretKey: string;
  s3PublicBaseUrl: string;
  cleanupEnabled: boolean;
}

export interface OAuthSettings {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizedDomains: string;
  scopes: string;
}

export interface AllSettings {
  email: EmailSettings;
  security: SecuritySettings;
  rateLimits: RateLimitSettings;
  fileStorage: FileStorageSettings;
  oauth: OAuthSettings;
}

/**
 * Settings API Client
 */
export const settingsApi = {
  /**
   * Get all settings
   */
  getAllSettings: async (): Promise<AllSettings> => {
    const response = await api.get<AllSettings>('/admin/settings');
    return response.data;
  },

  /**
   * Get settings by category
   */
  getSettingsByCategory: async (category: string): Promise<Record<string, unknown>[]> => {
    const response = await api.get(`/admin/settings/${category}`);
    return response.data;
  },

  /**
   * Update email settings
   */
  updateEmailSettings: async (settings: EmailSettings): Promise<EmailSettings> => {
    const response = await api.put<EmailSettings>('/admin/settings/email', settings);
    return response.data;
  },

  /**
   * Update security settings
   */
  updateSecuritySettings: async (settings: SecuritySettings): Promise<SecuritySettings> => {
    const response = await api.put<SecuritySettings>('/admin/settings/security', settings);
    return response.data;
  },

  /**
   * Update rate limit settings
   */
  updateRateLimitSettings: async (settings: RateLimitSettings): Promise<RateLimitSettings> => {
    const response = await api.put<RateLimitSettings>('/admin/settings/rate-limits', settings);
    return response.data;
  },

  /**
   * Update file storage settings
   */
  updateFileStorageSettings: async (
    settings: FileStorageSettings
  ): Promise<FileStorageSettings> => {
    const response = await api.put<FileStorageSettings>('/admin/settings/file-storage', settings);
    return response.data;
  },

  /**
   * Update OAuth settings
   */
  updateOAuthSettings: async (settings: OAuthSettings): Promise<OAuthSettings> => {
    const response = await api.put<OAuthSettings>('/admin/settings/oauth', settings);
    return response.data;
  },

  /**
   * Test email connection
   */
  testEmailConnection: async (settings: EmailSettings): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/admin/settings/test-email', settings);
    return response.data;
  },

  /**
   * Test OAuth configuration
   */
  testOAuthConfig: async (settings: OAuthSettings): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/admin/settings/test-oauth', settings);
    return response.data;
  },

  /**
   * Reset settings to defaults
   */
  resetSettings: async (category: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/admin/settings/reset/${category}`);
    return response.data;
  },
};
