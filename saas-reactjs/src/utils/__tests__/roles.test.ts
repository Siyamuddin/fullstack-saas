/**
 * Roles utility tests
 */

import { describe, it, expect, vi } from 'vitest';
import {
  extractRolesFromToken,
  hasRole,
  isAdmin,
  isUser,
  ROLE_ADMIN,
  ROLE_NORMAL,
} from '../roles';

/** Build a minimal unsigned JWT-like token with the given payload */
function makeToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

describe('roles', () => {
  describe('extractRolesFromToken', () => {
    it('extracts authorities from token payload', () => {
      const token = makeToken({ authorities: [ROLE_ADMIN, ROLE_NORMAL] });
      expect(extractRolesFromToken(token)).toEqual([ROLE_ADMIN, ROLE_NORMAL]);
    });

    it('falls back to roles field when authorities is missing', () => {
      const token = makeToken({ roles: [ROLE_NORMAL] });
      expect(extractRolesFromToken(token)).toEqual([ROLE_NORMAL]);
    });

    it('returns empty array for malformed tokens', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(extractRolesFromToken('not-a-jwt')).toEqual([]);
      expect(extractRolesFromToken('')).toEqual([]);
      spy.mockRestore();
    });
  });

  describe('hasRole / isAdmin / isUser', () => {
    it('detects admin role', () => {
      expect(isAdmin([ROLE_ADMIN])).toBe(true);
      expect(isAdmin([ROLE_NORMAL])).toBe(false);
      expect(hasRole([ROLE_ADMIN], ROLE_ADMIN)).toBe(true);
    });

    it('detects normal user role', () => {
      expect(isUser([ROLE_NORMAL])).toBe(true);
      expect(isUser([ROLE_ADMIN])).toBe(false);
    });
  });
});
