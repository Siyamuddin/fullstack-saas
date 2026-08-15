import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { queryKeys, FILE_UPLOAD_CONFIG } from '../config';
import { showSuccessToast, showErrorToast } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { UserDto } from '../types/user';

interface FileUploadOptions {
  onSuccess?: (data: UserDto) => void;
  onError?: (error: unknown) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
}

/**
 * Custom hook for file upload with validation
 */
export const useFileUpload = (options: FileUploadOptions = {}) => {
  const [uploadProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  const maxFileSize = options.maxFileSize || FILE_UPLOAD_CONFIG.maxFileSize;
  const allowedTypes: string[] = options.allowedTypes || [...FILE_UPLOAD_CONFIG.allowedImageTypes];

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  };

  /**
   * Handle file selection and validation
   */
  const handleFileSelect = (file: File | null): { valid: boolean; error?: string } => {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    setIsValidating(true);
    const validation = validateFile(file);
    setIsValidating(false);

    if (!validation.valid) {
      logger.warn('File validation failed', { fileName: file.name, error: validation.error });
      showErrorToast(new Error(validation.error || 'Invalid file'));
    }

    return validation;
  };

  return {
    validateFile,
    handleFileSelect,
    uploadProgress,
    isValidating,
    maxFileSize,
    allowedTypes,
  };
};

/**
 * Custom hook for uploading profile photo (current user)
 */
export const useUploadProfilePhoto = () => {
  const queryClient = useQueryClient();
  const { validateFile, uploadProgress } = useFileUpload();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      return usersApi.uploadMyProfilePhoto(file);
    },
    onSuccess: (data) => {
      // Update user data in cache
      queryClient.setQueryData(queryKeys.users.current(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      showSuccessToast('Profile photo uploaded successfully');
      logger.userAction('Profile photo uploaded', { userId: data.id });
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to upload profile photo');
      logger.error('Profile photo upload failed', error);
    },
  });

  return {
    ...mutation,
    uploadProgress,
  };
};

/**
 * Custom hook for uploading profile photo (admin for any user)
 */
export const useUploadUserProfilePhoto = () => {
  const queryClient = useQueryClient();
  const { validateFile } = useFileUpload();

  return useMutation({
    mutationFn: async ({ userId, file }: { userId: number; file: File }) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      return usersApi.uploadProfilePhoto(userId, file);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.users.detail(variables.userId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      showSuccessToast('Profile photo uploaded successfully');
      logger.userAction('Admin uploaded user profile photo', { userId: variables.userId });
    },
    onError: (error) => {
      showErrorToast(error, 'Failed to upload profile photo');
      logger.error('Profile photo upload failed (admin)', error);
    },
  });
};

/**
 * Hook to get file size in human-readable format
 */
export const useFormatFileSize = () => {
  return (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };
};

/**
 * Hook to validate image dimensions
 */
export const useValidateImageDimensions = () => {
  return (file: File, minWidth: number = 0, minHeight: number = 0, maxWidth: number = Infinity, maxHeight: number = Infinity): Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const { width, height } = img;

        if (width < minWidth || height < minHeight) {
          resolve({
            valid: false,
            error: `Image dimensions must be at least ${minWidth}x${minHeight}px`,
            dimensions: { width, height },
          });
        } else if (width > maxWidth || height > maxHeight) {
          resolve({
            valid: false,
            error: `Image dimensions must not exceed ${maxWidth}x${maxHeight}px`,
            dimensions: { width, height },
          });
        } else {
          resolve({ valid: true, dimensions: { width, height } });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ valid: false, error: 'Failed to load image' });
      };

      img.src = url;
    });
  };
};

