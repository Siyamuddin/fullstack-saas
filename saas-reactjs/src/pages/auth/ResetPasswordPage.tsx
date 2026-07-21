import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/auth';
import { getErrorMessage, showSuccessToast, showErrorToast } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import { FormInput, FormButton } from '../../components/forms';

const resetPasswordSchema = z
  .object({
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

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<{ newPassword: string; confirmPassword: string }>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      showErrorToast(new Error('Invalid or missing reset token'));
      setTokenError('Invalid reset link. Please request a new password reset.');
      setTimeout(() => {
        navigate('/forgot-password');
      }, 3000);
    }
  }, [token, navigate]);

  const onSubmit = async (data: { newPassword: string; confirmPassword: string }) => {
    if (!token) return;

    setIsLoading(true);
    setResetError(null);

    try {
      await authApi.resetPassword(token, data.newPassword);
      setIsSuccess(true);
      logger.userAction('Password reset successful');
      showSuccessToast('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      logger.error('Password reset failed', error);

      setResetError(errorMessage);

      // Handle specific errors
      if (
        errorMessage.toLowerCase().includes('token') &&
        (errorMessage.toLowerCase().includes('invalid') ||
          errorMessage.toLowerCase().includes('expired'))
      ) {
        setTokenError(
          'This reset link is invalid or has expired. Please request a new password reset.'
        );
      } else if (errorMessage.toLowerCase().includes('password')) {
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

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 p-8 rounded-xl shadow-xl text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Password Reset Successful</h2>
          <p className="text-gray-300">Your password has been reset. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 p-8 rounded-xl shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">Enter your new password below</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {(tokenError || resetError) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
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
                <p className="text-sm font-medium text-red-400">{tokenError || resetError}</p>
                {tokenError && (
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-400 hover:text-cyan-400 mt-2 inline-block"
                  >
                    Request a new reset link →
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <FormInput
              label="New Password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
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
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
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
          </div>

          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            loadingText="Resetting..."
            disabled={!!tokenError}
          >
            Reset password
          </FormButton>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-blue-400 hover:text-cyan-400 transition-colors"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
