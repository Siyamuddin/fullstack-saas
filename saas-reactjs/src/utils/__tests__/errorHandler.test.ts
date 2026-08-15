/**
 * Error handler utility tests
 */

import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { getErrorMessage, isPasswordError, isAuthError } from '../errorHandler';

function createAxiosError(
  status: number,
  data?: Record<string, unknown>
): AxiosError {
  return new AxiosError(
    'Request failed',
    String(status),
    { headers: new AxiosHeaders() },
    {},
    {
      status,
      statusText: 'Error',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: data ?? {},
    }
  );
}

describe('errorHandler', () => {
  describe('getErrorMessage', () => {
    it('extracts message from AxiosError response', () => {
      const error = createAxiosError(400, { message: 'Custom error message' });
      const message = getErrorMessage(error);
      expect(message).toBe('Custom error message');
    });

    it('formats bad credentials error', () => {
      const error = createAxiosError(401, { message: 'Bad credentials' });
      const message = getErrorMessage(error);
      expect(message).toContain('Invalid email or password');
    });

    it('handles 404 errors', () => {
      const error = createAxiosError(404);
      const message = getErrorMessage(error);
      expect(message).toContain('not found');
    });

    it('handles 500 errors', () => {
      const error = createAxiosError(500);
      const message = getErrorMessage(error);
      expect(message).toContain('Server error');
    });

    it('handles generic Error objects', () => {
      const error = new Error('Something went wrong');
      const message = getErrorMessage(error);
      expect(message).toBe('Something went wrong');
    });

    it('handles unknown errors', () => {
      const message = getErrorMessage('unknown error');
      expect(message).toContain('unexpected error');
    });
  });

  describe('isPasswordError', () => {
    it('returns true for password-related errors', () => {
      const error = new Error('Invalid password');
      expect(isPasswordError(error)).toBe(true);
    });

    it('returns true for credential errors', () => {
      const error = new Error('Bad credentials');
      expect(isPasswordError(error)).toBe(true);
    });

    it('returns false for non-password errors', () => {
      const error = new Error('Network error');
      expect(isPasswordError(error)).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('returns true for 401 errors', () => {
      expect(isAuthError(createAxiosError(401))).toBe(true);
    });

    it('returns true for 403 errors', () => {
      expect(isAuthError(createAxiosError(403))).toBe(true);
    });

    it('returns false for other errors', () => {
      expect(isAuthError(createAxiosError(400))).toBe(false);
    });
  });
});
