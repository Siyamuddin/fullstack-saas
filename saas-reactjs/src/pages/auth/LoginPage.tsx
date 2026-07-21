import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { JwtRequest } from '../../types/auth';
import { getErrorMessage, isPasswordError } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import { FormInput, FormButton } from '../../components/forms';
import { GoogleLoginButton } from '../../components/oauth/GoogleLoginButton';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<JwtRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: JwtRequest) => {
    // Clear previous errors first
    setIsLoading(true);
    setLoginError(null);

    try {
      await login(data);
      logger.userAction('Login successful', { email: data.email });
      // Redirect to auth-redirect which will handle role-based routing
      navigate('/auth-redirect');
    } catch (error: unknown) {
      // Keep loading state for a moment to ensure error is visible
      const errorMessage = getErrorMessage(error);

      logger.error('Login failed', error, { email: data.email });

      // Set error message that will persist until next submission
      setLoginError(errorMessage);

      // Specific error handling for better UX
      if (isPasswordError(error) || errorMessage.toLowerCase().includes('credential')) {
        // Highlight password field for password/credential errors
        setError('password', {
          type: 'manual',
          message: 'Invalid email or password',
        });
        setError('email', {
          type: 'manual',
          message: 'Invalid email or password',
        });
      } else if (errorMessage.toLowerCase().includes('account is locked')) {
        // Account locked error
        setLoginError(
          'Your account has been locked due to multiple failed login attempts. Please try again later or contact support.'
        );
      } else if (errorMessage.toLowerCase().includes('account is disabled')) {
        // Account disabled error
        setLoginError('Your account has been disabled. Please contact support for assistance.');
      } else if (errorMessage.toLowerCase().includes('email not verified')) {
        // Email not verified error
        setLoginError(
          'Please verify your email address before logging in. Check your inbox for the verification link.'
        );
      } else if (errorMessage.toLowerCase().includes('not found')) {
        // User not found
        setError('email', {
          type: 'manual',
          message: 'No account found with this email',
        });
      }

      // Ensure loading state is set to false after error is set
      setIsLoading(false);
    }
  };

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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-400 hover:text-cyan-400 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {loginError && (
            <div className="bg-red-500/10 border-2 border-red-500/50 rounded-lg p-4 flex items-start space-x-3 animate-shake animate-fadeIn">
              <svg
                className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-base font-semibold text-red-300 mb-1">Login Failed</p>
                <p className="text-sm text-red-400">{loginError}</p>
                {(loginError.toLowerCase().includes('password') ||
                  loginError.toLowerCase().includes('credential')) && (
                  <p className="text-xs text-gray-400 mt-2">
                    💡 Tip: Make sure you're using the correct email and password combination.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <FormInput
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
              error={errors.email?.message}
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

            <FormInput
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
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
              {...register('password')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-400 hover:text-cyan-400 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            loadingText="Signing in..."
          >
            Sign in
          </FormButton>

          <GoogleLoginButton />
        </form>
      </div>
    </div>
  );
};
