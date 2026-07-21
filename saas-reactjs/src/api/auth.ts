import { api } from './axios';
import { ApiResponse } from '../types/api';
import { JwtRequest, JwtResponse, RegisterData } from '../types/auth';

export const authApi = {
  login: async (credentials: JwtRequest): Promise<JwtResponse> => {
    const response = await api.post<JwtResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/verify-email', null, {
      params: { token },
    });
    return response.data;
  },

  resendVerification: async (email: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/resend-verification', null, {
      params: { email },
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/forgot-password', null, {
      params: { email },
    });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/reset-password', null, {
      params: { token, newPassword },
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<JwtResponse> => {
    const response = await api.post<JwtResponse>('/auth/refresh-token', null, {
      params: { refreshToken },
    });
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/logout');
    return response.data;
  },
};

