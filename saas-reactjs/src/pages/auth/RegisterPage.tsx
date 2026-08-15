import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../types/auth';
import { getErrorMessage, getFieldError } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import { FormInput, FormTextarea, FormButton } from '../../components/forms';
import { GoogleLoginButton } from '../../components/oauth/GoogleLoginButton';

const registerSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!?*~`_\-[\]{}|\\:;"'<>,./])(?=\S+$).{8,}$/,
        'Password must contain uppercase, lowercase, digit, and special character'
      ),
    confirmPassword: z.string(),
    about: z.string().max(500, 'About must not exceed 500 characters').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterData & { confirmPassword: string }>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData & { confirmPassword: string }) => {
    setIsLoading(true);
    setRegisterError(null);

    try {
      const registerData: RegisterData = {
        name: data.name,
        email: data.email,
        password: data.password,
        about: data.about,
      };
      await registerUser(registerData);
      logger.userAction('Registration successful', { email: data.email });
      navigate('/login');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      logger.error('Registration failed', error, { email: data.email });

      // Set general error message
      setRegisterError(errorMessage);

      // Handle field-specific errors
      const emailError = getFieldError(error, 'email');
      if (emailError || errorMessage.toLowerCase().includes('email already exists')) {
        setError('email', {
          type: 'manual',
          message: emailError || 'This email is already registered',
        });
      }

      const nameError = getFieldError(error, 'name');
      if (nameError) {
        setError('name', {
          type: 'manual',
          message: nameError,
        });
      }

      const passwordError = getFieldError(error, 'password');
      if (passwordError) {
        setError('password', {
          type: 'manual',
          message: passwordError,
        });
      }
    } finally {
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-400 hover:text-cyan-400 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {registerError && (
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
                <p className="text-sm font-medium text-red-400">{registerError}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <FormInput
              label="Full Name"
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              helperText="Your full name as you'd like it displayed"
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              {...register('name')}
            />

            <FormInput
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              helperText="We'll send a verification email to this address"
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

            <FormInput
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.password?.message}
              helperText="Min 8 chars, must include uppercase, lowercase, number, and special character"
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
              {...register('password')}
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

            <FormTextarea
              label="About (Optional)"
              rows={3}
              placeholder="Tell us about yourself"
              error={errors.about?.message}
              helperText="Optional: Share a bit about yourself (max 500 characters)"
              {...register('about')}
            />
          </div>

          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            loadingText="Creating account..."
          >
            Create account
          </FormButton>

          <GoogleLoginButton />
        </form>
      </div>
    </div>
  );
};
