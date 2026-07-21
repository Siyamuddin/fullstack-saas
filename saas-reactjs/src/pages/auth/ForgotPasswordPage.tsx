import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/auth';
import { getErrorMessage, showSuccessToast, showErrorToast } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import { FormInput, FormButton } from '../../components/forms';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    setRequestError(null);

    try {
      await authApi.forgotPassword(data.email);
      setIsSubmitted(true);
      logger.userAction('Password reset requested', { email: data.email });
      showSuccessToast('Password reset email sent! Please check your inbox.');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      logger.error('Password reset request failed', error, { email: data.email });

      setRequestError(errorMessage);

      // Handle specific errors
      if (
        errorMessage.toLowerCase().includes('not found') ||
        errorMessage.toLowerCase().includes('invalid email')
      ) {
        setError('email', {
          type: 'manual',
          message: 'No account found with this email address',
        });
      } else if (errorMessage.toLowerCase().includes('rate limit')) {
        setRequestError('Too many requests. Please wait a moment and try again.');
      }

      showErrorToast(error, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
          <h2 className="text-2xl font-bold text-white">Check your email</h2>
          <p className="text-gray-300">
            We've sent a password reset link to your email address. Please check your inbox and
            follow the instructions.
          </p>
          <Link
            to="/login"
            className="inline-block mt-4 text-blue-400 hover:text-cyan-400 font-medium transition-colors"
          >
            Back to login
          </Link>
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
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {requestError && (
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
                <p className="text-sm font-medium text-red-400">{requestError}</p>
              </div>
            </div>
          )}

          <FormInput
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="john@example.com"
            error={errors.email?.message}
            helperText="Enter the email address associated with your account"
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            }
            {...register('email')}
          />

          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            loadingText="Sending..."
          >
            Send reset link
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
