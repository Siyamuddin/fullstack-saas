import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, EmailSettings, SecuritySettings, RateLimitSettings, FileStorageSettings, OAuthSettings } from '../api/settings';
import { queryKeys } from '../config';
import { showSuccessToast, showErrorToast } from '../utils/errorHandler';
import { logger } from '../utils/logger';

/**
 * Hook to fetch all settings
 */
export const useAllSettings = () => {
  return useQuery({
    queryKey: queryKeys.settings.allSettings(),
    queryFn: () => settingsApi.getAllSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to update email settings
 */
export const useUpdateEmailSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: EmailSettings) => settingsApi.updateEmailSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      logger.userAction('Updated email settings');
      showSuccessToast('Email settings updated successfully');
    },
    onError: (error) => {
      logger.error('Failed to update email settings', error);
      showErrorToast(error, 'Failed to update email settings');
    },
  });
};

/**
 * Hook to update security settings
 */
export const useUpdateSecuritySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: SecuritySettings) => settingsApi.updateSecuritySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      logger.userAction('Updated security settings');
      showSuccessToast('Security settings updated successfully');
    },
    onError: (error) => {
      logger.error('Failed to update security settings', error);
      showErrorToast(error, 'Failed to update security settings');
    },
  });
};

/**
 * Hook to update rate limit settings
 */
export const useUpdateRateLimitSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: RateLimitSettings) => settingsApi.updateRateLimitSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      logger.userAction('Updated rate limit settings');
      showSuccessToast('Rate limit settings updated successfully');
    },
    onError: (error) => {
      logger.error('Failed to update rate limit settings', error);
      showErrorToast(error, 'Failed to update rate limit settings');
    },
  });
};

/**
 * Hook to update file storage settings
 */
export const useUpdateFileStorageSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: FileStorageSettings) => settingsApi.updateFileStorageSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      logger.userAction('Updated file storage settings');
      showSuccessToast('File storage settings updated successfully');
    },
    onError: (error) => {
      logger.error('Failed to update file storage settings', error);
      showErrorToast(error, 'Failed to update file storage settings');
    },
  });
};

/**
 * Hook to update OAuth settings
 */
export const useUpdateOAuthSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: OAuthSettings) => settingsApi.updateOAuthSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      logger.userAction('Updated OAuth settings');
      showSuccessToast('OAuth settings updated successfully');
    },
    onError: (error) => {
      logger.error('Failed to update OAuth settings', error);
      showErrorToast(error, 'Failed to update OAuth settings');
    },
  });
};

/**
 * Hook to test email connection
 */
export const useTestEmailConnection = () => {
  return useMutation({
    mutationFn: (settings: EmailSettings) => settingsApi.testEmailConnection(settings),
    onSuccess: (data) => {
      if (data.success) {
        showSuccessToast('Email connection test successful!');
      } else {
        showErrorToast(new Error('Email connection test failed'));
      }
    },
    onError: (error) => {
      logger.error('Email connection test failed', error);
      showErrorToast(error, 'Failed to test email connection');
    },
  });
};

/**
 * Hook to test OAuth configuration
 */
export const useTestOAuthConfig = () => {
  return useMutation({
    mutationFn: (settings: OAuthSettings) => settingsApi.testOAuthConfig(settings),
    onSuccess: (data) => {
      if (data.success) {
        showSuccessToast('OAuth configuration is valid!');
      } else {
        showErrorToast(new Error('OAuth configuration is invalid'));
      }
    },
    onError: (error) => {
      logger.error('OAuth configuration test failed', error);
      showErrorToast(error, 'Failed to test OAuth configuration');
    },
  });
};

/**
 * Hook to reset settings
 */
export const useResetSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: string) => settingsApi.resetSettings(category),
    onSuccess: (_, category) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      logger.userAction('Reset settings', { category });
      showSuccessToast(`${category} settings reset to defaults`);
    },
    onError: (error) => {
      logger.error('Failed to reset settings', error);
      showErrorToast(error, 'Failed to reset settings');
    },
  });
};

