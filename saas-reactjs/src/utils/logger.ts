/**
 * Logging utility
 * Provides structured logging with support for different log levels and contexts
 * Can be easily extended to send logs to external monitoring services
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDev = import.meta.env.DEV;
  private appName = 'SAAS-Frontend';

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${this.appName}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }

  /**
   * Send log to external monitoring service
   * Placeholder for integration with services like Sentry, LogRocket, etc.
   */
  private sendToMonitoring(
    level: LogLevel,
    message: string,
    error?: unknown,
    context?: LogContext
  ) {
    // TODO: Integrate with monitoring service
    // Example integrations:
    // - Sentry.captureException(error)
    // - LogRocket.captureMessage(message)
    // - Custom API endpoint for log aggregation

    if (this.isDev) {
      return; // Don't send to monitoring in development
    }

    // Placeholder for production monitoring — params reserved for future integration
    void level;
    void message;
    void error;
    void context;
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext) {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext) {
    if (this.isDev) {
      console.log(this.formatMessage('info', message, context));
    }
    this.sendToMonitoring('info', message, undefined, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
    this.sendToMonitoring('warn', message, undefined, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    };

    console.error(this.formatMessage('error', message, errorContext));
    this.sendToMonitoring('error', message, error, errorContext);
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, context?: LogContext) {
    this.debug(`API Request: ${method} ${url}`, context);
  }

  /**
   * Log API response
   */
  apiResponse(
    method: string,
    url: string,
    status: number,
    duration?: number,
    context?: LogContext
  ) {
    this.debug(`API Response: ${method} ${url} - ${status}`, {
      ...context,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  /**
   * Log API error
   */
  apiError(method: string, url: string, error: unknown, context?: LogContext) {
    this.error(`API Error: ${method} ${url}`, error, context);
  }

  /**
   * Log user action
   */
  userAction(action: string, context?: LogContext) {
    this.info(`User Action: ${action}`, context);
  }

  /**
   * Log navigation
   */
  navigation(from: string, to: string, context?: LogContext) {
    this.debug(`Navigation: ${from} -> ${to}`, context);
  }

  /**
   * Log performance metric
   */
  performance(metric: string, value: number, unit: string = 'ms', context?: LogContext) {
    this.info(`Performance: ${metric} = ${value}${unit}`, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export utility functions for common use cases
export const logError = (message: string, error?: unknown, context?: LogContext) => {
  logger.error(message, error, context);
};

export const logInfo = (message: string, context?: LogContext) => {
  logger.info(message, context);
};

export const logWarning = (message: string, context?: LogContext) => {
  logger.warn(message, context);
};

export const logDebug = (message: string, context?: LogContext) => {
  logger.debug(message, context);
};
