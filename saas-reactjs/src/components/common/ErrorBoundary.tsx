/* eslint-disable react-refresh/only-export-components -- ErrorBoundary exports hook helper alongside component */
import React, { Component, ReactNode } from 'react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console and monitoring service
    logger.error('Error caught by boundary', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DefaultErrorUI error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

/**
 * Default Error UI
 */
interface DefaultErrorUIProps {
  error?: Error;
  onReset: () => void;
}

function DefaultErrorUI({ error, onReset }: DefaultErrorUIProps) {
  const isDev = import.meta.env.DEV;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
          <p className="text-gray-400">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
        </div>

        {isDev && error && (
          <div className="mb-6 p-4 bg-slate-900/50 rounded border border-red-500/20">
            <p className="text-xs font-mono text-red-400 break-all">{error.message}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook-based error boundary (for functional components)
 * Note: This doesn't catch render errors, only errors in effects and handlers
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};
