/**
 * Application-wide constants
 * Centralized location for all constant values used across the application
 */

export const APP_CONFIG = {
  name: 'SAAS Starter Kit',
  version: '1.0.0',
  description: 'Production-ready SAAS starter kit',
} as const;

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 1,
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:9090' : ''),
} as const;

export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50, 100],
  defaultSortBy: 'id',
  defaultSortDirection: 'asc',
} as const;

export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  allowedImageExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
} as const;

export const VALIDATION_CONFIG = {
  password: {
    minLength: 8,
    maxLength: 100,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  },
  email: {
    maxLength: 255,
  },
  name: {
    minLength: 2,
    maxLength: 100,
  },
} as const;

export const SESSION_CONFIG = {
  tokenRefreshBuffer: 5 * 60 * 1000, // Refresh token 5 minutes before expiry
  inactivityTimeout: 30 * 60 * 1000, // 30 minutes
} as const;

export const TOAST_CONFIG = {
  duration: {
    success: 3000,
    error: 5000,
    info: 4000,
    warning: 4000,
  },
  position: 'top-right' as const,
} as const;

export const MENU_ITEMS = {
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'User Management', icon: '👥' },
    { path: '/admin/profile', label: 'Profile', icon: '👤' },
    { path: '/admin/sessions', label: 'Sessions', icon: '🔐' },
    { path: '/admin/settings', label: 'App Settings', icon: '⚙️' },
  ],
  user: [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/sessions', label: 'Sessions', icon: '🔐' },
    { path: '/change-password', label: 'Change Password', icon: '🔒' },
  ],
} as const;

export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  sessionExpired: 'Your session has expired. Please log in again.',
  serverError: 'Server error. Please try again later.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
} as const;

export const SUCCESS_MESSAGES = {
  login: 'Login successful!',
  logout: 'Logged out successfully',
  register: 'Registration successful! Please check your email for verification.',
  passwordChanged: 'Password changed successfully',
  profileUpdated: 'Profile updated successfully',
  emailSent: 'Email sent successfully',
  sessionRevoked: 'Session revoked successfully',
} as const;

