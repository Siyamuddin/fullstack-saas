/**
 * Custom testing utilities
 * Provides wrapper components and helper functions for testing
 */

/* eslint-disable react-refresh/only-export-components -- test helpers intentionally re-export non-components */

import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';

/**
 * Create a new QueryClient for each test to ensure isolation
 */
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry failed queries in tests
        gcTime: Infinity, // Prevent garbage collection during tests
      },
      mutations: {
        retry: false,
      },
    },
  });

/**
 * All providers wrapper for testing
 */
interface AllProvidersProps {
  children: ReactNode;
}

export const AllProviders = ({ children }: AllProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Custom render function that includes all providers
 */
export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

/**
 * Mock user data for testing
 */
export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  roles: ['ROLE_USER'],
  enabled: true,
  emailVerified: true,
  accountLocked: false,
};

export const mockAdminUser = {
  id: 2,
  name: 'Admin User',
  email: 'admin@example.com',
  roles: ['ROLE_ADMIN', 'ROLE_USER'],
  enabled: true,
  emailVerified: true,
  accountLocked: false,
};

/**
 * Mock session data
 */
export const mockSession = {
  id: 'session-123',
  userId: 1,
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0',
  createdAt: new Date().toISOString(),
  lastAccessedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
};

/**
 * Wait for async updates
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
