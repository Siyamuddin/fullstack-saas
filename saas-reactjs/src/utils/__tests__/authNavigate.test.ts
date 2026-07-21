/**
 * authNavigate utility tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setAuthNavigate, authNavigate } from '../authNavigate';

describe('authNavigate', () => {
  beforeEach(() => {
    setAuthNavigate(null);
  });

  afterEach(() => {
    setAuthNavigate(null);
    vi.unstubAllGlobals();
  });

  it('uses the registered navigate function when available', () => {
    const navigate = vi.fn();
    setAuthNavigate(navigate);

    authNavigate('/login');

    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('falls back to window.location when navigate is not set', () => {
    const locationStub = { href: '' };
    vi.stubGlobal('location', locationStub);

    authNavigate('/login');

    expect(locationStub.href).toBe('/login');
  });
});
