import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { oauthApi } from '../../api/oauth';
import { logger } from '../../utils/logger';
import { showErrorToast } from '../../utils/errorHandler';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../utils/storage';
import { extractRolesFromToken, isAdmin } from '../../utils/roles';

export const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loadUserAfterOAuth } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Check for OAuth errors
      if (error) {
        setStatus('error');
        setErrorMessage('OAuth authentication was cancelled or failed');
        logger.error('OAuth error', new Error(error));
        showErrorToast(new Error(error));
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Validate code and state
      if (!code || !state) {
        setStatus('error');
        setErrorMessage('Invalid OAuth callback parameters');
        logger.error('OAuth callback missing parameters');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Validate state matches
      const storedState = sessionStorage.getItem('oauth_state');
      if (state !== storedState) {
        setStatus('error');
        setErrorMessage('Invalid OAuth state parameter');
        logger.error('OAuth state mismatch');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Handle OAuth callback and get JWT tokens
        const response = await oauthApi.handleCallback(code, state);

        // Store tokens
        if (response.jwtToken && response.refreshToken) {
          storage.setToken(response.jwtToken);
          storage.setRefreshToken(response.refreshToken);

          // Extract roles from JWT to determine redirect
          const roles = extractRolesFromToken(response.jwtToken);
          const isAdminUser = isAdmin(roles);

          // Load user data and set auth state
          await loadUserAfterOAuth();

          setStatus('success');
          logger.userAction('OAuth login successful');

          // Clear stored state
          sessionStorage.removeItem('oauth_state');

          // Redirect directly to appropriate dashboard based on role
          setTimeout(() => {
            if (isAdminUser) {
              navigate('/admin/dashboard', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          }, 1500);
        } else {
          throw new Error('No tokens received from OAuth callback');
        }
      } catch (err: unknown) {
        setStatus('error');
        setErrorMessage('Failed to complete OAuth authentication');
        logger.error('OAuth callback failed', err);
        showErrorToast(err);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 p-8 rounded-xl shadow-xl text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Completing sign in...</h2>
            <p className="text-gray-400">Please wait while we complete your Google sign in</p>
          </>
        )}

        {status === 'success' && (
          <>
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
            <h2 className="text-xl font-semibold text-white mb-2">Sign in successful!</h2>
            <p className="text-gray-400">Redirecting to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Authentication Failed</h2>
            <p className="text-gray-400 mb-4">{errorMessage}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
};
