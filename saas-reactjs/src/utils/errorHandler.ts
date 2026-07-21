import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { TOAST_STYLES, ICON_THEME, TOAST_CONFIG } from '../config';

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: number;
  timestamp?: string;
  path?: string;
}

interface ValidationFieldError {
  field?: string;
  message?: string;
  defaultMessage?: string;
}

interface ValidationErrorResponse extends ApiErrorResponse {
  errors?: ValidationFieldError[];
}

/**
 * Extracts a user-friendly error message from an API error response
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const response = error.response;

    if (response?.data) {
      const data = response.data as ApiErrorResponse;

      // Handle specific error messages from backend
      if (data.message) {
        return formatErrorMessage(data.message);
      }

      if (data.error) {
        return formatErrorMessage(data.error);
      }
    }

    // Handle HTTP status codes
    switch (response?.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication failed. Please check your credentials.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This resource already exists. Please try a different value.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        if (error.message) {
          return formatErrorMessage(error.message);
        }
    }
  }

  if (error instanceof Error) {
    return formatErrorMessage(error.message);
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Formats error messages to be more user-friendly
 */
const formatErrorMessage = (message: string): string => {
  // Common backend error messages and their user-friendly versions
  const errorMappings: Record<string, string> = {
    // Authentication errors
    'Bad credentials': 'Invalid email or password. Please check your credentials and try again.',
    'Invalid credentials':
      'Invalid email or password. Please check your credentials and try again.',
    'Username or password is incorrect':
      'Invalid email or password. Please check your credentials and try again.',
    'Invalid password': 'The password you entered is incorrect. Please try again.',
    'Current password is incorrect':
      'The current password you entered is incorrect. Please verify and try again.',
    'Password mismatch': 'The password you entered does not match. Please try again.',

    // Account status errors
    'Account is locked': 'Your account has been locked. Please contact support or try again later.',
    'Account is disabled': 'Your account has been disabled. Please contact support for assistance.',
    'Email not verified':
      'Please verify your email address before logging in. Check your inbox for the verification link.',
    'Email already verified': 'This email address has already been verified.',
    'Token expired': 'Your session has expired. Please log in again.',
    'Invalid token': 'The verification link is invalid or has expired. Please request a new one.',

    // Validation errors
    'Email already exists':
      'This email address is already registered. Please use a different email or try logging in.',
    'User already exists':
      'An account with this email already exists. Please use a different email or try logging in.',
    'Password too weak':
      'Your password is too weak. Please use a stronger password with uppercase, lowercase, numbers, and special characters.',
    'Password does not meet requirements':
      'Password must contain at least 8 characters with uppercase, lowercase, numbers, and special characters.',

    // File upload errors
    'File too large': 'The file you uploaded is too large. Please choose a smaller file.',
    'Invalid file type': 'The file type is not supported. Please upload a valid image file.',
    'Failed to upload file':
      'Unable to upload the file. Please try again or choose a different file.',

    // General errors
    'User not found':
      'The user account was not found. Please check your information and try again.',
    'Resource not found': 'The requested resource was not found.',
    'Operation failed': 'The operation could not be completed. Please try again.',
    'Network error': 'Unable to connect to the server. Please check your internet connection.',
  };

  // Check for exact matches first
  if (errorMappings[message]) {
    return errorMappings[message];
  }

  // Check for partial matches (case-insensitive)
  const lowerMessage = message.toLowerCase();
  for (const [key, value] of Object.entries(errorMappings)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Return the original message if no mapping found
  return message;
};

/**
 * Shows a professional error toast notification
 */
export const showErrorToast = (error: unknown, customMessage?: string): void => {
  const message = customMessage || getErrorMessage(error);
  toast.error(message, {
    duration: TOAST_CONFIG.duration.error,
    style: TOAST_STYLES.error,
    iconTheme: ICON_THEME.error,
  });
};

/**
 * Shows a professional success toast notification
 */
export const showSuccessToast = (message: string): void => {
  toast.success(message, {
    duration: TOAST_CONFIG.duration.success,
    style: TOAST_STYLES.success,
    iconTheme: ICON_THEME.success,
  });
};

/**
 * Shows a professional info toast notification
 */
export const showInfoToast = (message: string): void => {
  toast(message, {
    duration: TOAST_CONFIG.duration.info,
    style: TOAST_STYLES.info,
    icon: 'ℹ️',
  });
};

/**
 * Shows a professional warning toast notification
 */
export const showWarningToast = (message: string): void => {
  toast(message, {
    duration: TOAST_CONFIG.duration.warning,
    style: TOAST_STYLES.warning,
    icon: '⚠️',
  });
};

/**
 * Checks if error is a password-related error
 */
export const isPasswordError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('password') || message.includes('credential');
};

/**
 * Checks if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
};

/**
 * Gets a field-specific error message for form validation
 */
export const getFieldError = (error: unknown, fieldName: string): string | undefined => {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ValidationErrorResponse | undefined;

    // Check for field-specific errors in validation response
    if (response?.errors && Array.isArray(response.errors)) {
      const fieldError = response.errors.find(
        (err) => err.field === fieldName || err.field?.toLowerCase() === fieldName.toLowerCase()
      );
      if (fieldError) {
        return formatErrorMessage(fieldError.message || fieldError.defaultMessage || '');
      }
    }

    // Check for field in message
    if (response?.message) {
      const message = response.message.toLowerCase();
      if (message.includes(fieldName.toLowerCase())) {
        return formatErrorMessage(response.message);
      }
    }
  }

  return undefined;
};
