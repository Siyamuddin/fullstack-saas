import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi } from '../../api/users';
import { getErrorMessage, showSuccessToast, showErrorToast } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import { FormInput, FormButton } from '../../components/forms';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!?*~`_\-[\]{}|\\:;"'<>,./])(?=\S+$).{8,}$/,
        'Password must contain uppercase, lowercase, digit, and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const ChangePasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    setPasswordError(null);

    try {
      await usersApi.changePassword(data.currentPassword, data.newPassword);
      logger.userAction('Password changed successfully');
      showSuccessToast('Password changed successfully!');
      reset();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      logger.error('Password change failed', error);

      setPasswordError(errorMessage);

      // Handle specific errors
      if (
        errorMessage.toLowerCase().includes('current password') ||
        errorMessage.toLowerCase().includes('incorrect password')
      ) {
        setError('currentPassword', {
          type: 'manual',
          message: 'Current password is incorrect',
        });
      } else if (
        errorMessage.toLowerCase().includes('same as') ||
        errorMessage.toLowerCase().includes('cannot use the same')
      ) {
        setError('newPassword', {
          type: 'manual',
          message: 'New password must be different from current password',
        });
      } else if (
        errorMessage.toLowerCase().includes('weak') ||
        errorMessage.toLowerCase().includes('requirements')
      ) {
        setError('newPassword', {
          type: 'manual',
          message: errorMessage,
        });
      }

      showErrorToast(error, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Change Password</h1>
        <p className="mt-2 text-gray-300">Update your account password</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl shadow-xl p-6 max-w-2xl">
        {passwordError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">{passwordError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            label="Current Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter current password"
            error={errors.currentPassword?.message}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            }
            {...register('currentPassword')}
          />

          <FormInput
            label="New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter new password"
            error={errors.newPassword?.message}
            helperText="Min 8 chars with uppercase, lowercase, number, and special character"
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
            {...register('newPassword')}
          />

          <FormInput
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            error={errors.confirmPassword?.message}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            {...register('confirmPassword')}
          />

          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            loadingText="Changing..."
          >
            Change Password
          </FormButton>
        </form>
      </div>
    </div>
  );
};
