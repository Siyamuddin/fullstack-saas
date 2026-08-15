import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { getErrorMessage, showSuccessToast, showErrorToast } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        const errorMsg = 'Verification token is missing from the URL';
        setVerifyError(errorMsg);
        setIsLoading(false);
        showErrorToast(new Error(errorMsg));
        logger.error('Email verification failed - missing token');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setIsVerified(true);
        logger.userAction('Email verified successfully', { token: token.substring(0, 10) + '...' });
        showSuccessToast('Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        logger.error('Email verification failed', error, { token: token.substring(0, 10) + '...' });

        // Handle specific error cases
        if (errorMessage.toLowerCase().includes('already verified')) {
          setVerifyError('This email has already been verified. You can proceed to login.');
        } else if (errorMessage.toLowerCase().includes('expired')) {
          setVerifyError(
            'This verification link has expired. Please request a new verification email.'
          );
        } else if (errorMessage.toLowerCase().includes('invalid')) {
          setVerifyError(
            'This verification link is invalid. Please check your email for the correct link.'
          );
        } else {
          setVerifyError(errorMessage);
        }

        showErrorToast(error, errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isVerified) {
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
          <h2 className="text-2xl font-bold text-white">Email Verified</h2>
          <p className="text-gray-300">
            Your email has been verified successfully. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 p-8 rounded-xl shadow-xl text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
        <p className="text-gray-300">
          {verifyError || 'The verification link is invalid or has expired.'}
        </p>
        <div className="flex flex-col gap-3 mt-6">
          <Link
            to="/login"
            className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/50"
          >
            Go to Login
          </Link>
          {verifyError?.toLowerCase().includes('expired') && (
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-blue-400 hover:text-cyan-400 transition-colors"
            >
              Request new verification email
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
