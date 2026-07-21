import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { showErrorToast } from '../utils/errorHandler';

/**
 * Centralized React Query configuration
 * Provides consistent caching, retry, and error handling strategies
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes (formerly cacheTime)

      // Refetch configuration
      refetchOnWindowFocus: false, // Don't refetch on window focus (can be enabled per query)
      refetchOnReconnect: true, // Refetch when connection is restored
      refetchOnMount: true, // Refetch when component mounts

      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 404 or 401 errors
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          if (status === 404 || status === 401 || status === 403) {
            return false;
          }
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },
    },
    mutations: {
      // Global mutation error handler
      onError: (error) => {
        // Only show toast for mutations (not queries)
        // Queries handle their own errors in components
        showErrorToast(error);
      },

      // Retry failed mutations once
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export type UserListFilters = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirec: string;
};

/**
 * Query keys factory for consistent query key management
 */
export const queryKeys = {
  // User queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: UserListFilters) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
    search: (query: string) => [...queryKeys.users.all, 'search', query] as const,
  },

  // Session queries
  sessions: {
    all: ['sessions'] as const,
    current: () => [...queryKeys.sessions.all, 'current'] as const,
    list: () => [...queryKeys.sessions.all, 'list'] as const,
  },

  // Auth queries
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },

  // Settings queries
  settings: {
    all: ['settings'] as const,
    allSettings: () => [...queryKeys.settings.all, 'all'] as const,
    category: (category: string) => [...queryKeys.settings.all, 'category', category] as const,
  },
} as const;

/**
 * Helper to invalidate related queries
 */
export const invalidateUserQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
};

export const invalidateSessionQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
};

export const invalidateAuthQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
};

export const invalidateSettingsQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
};
