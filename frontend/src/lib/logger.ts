/**
 * Logging utility for development and production environments
 * Centralizes console logging with proper formatting and control
 */

const isDevelopment = import.meta.env?.DEV ?? true;

/**
 * Log levels for categorizing log messages
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Logger class for consistent logging across the application
 */
class Logger {
  /**
   * Log debug messages (only in development)
   */
  debug(message: string, ...args: unknown[]): void {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log informational messages (only in development)
   */
  info(message: string, ...args: unknown[]): void {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, ...args: unknown[]): void {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Log error messages
   */
  error(message: string, error?: unknown, ...args: unknown[]): void {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error, ...args);
    }
  }

  /**
   * Create a namespaced logger for a specific module
   */
  createNamespacedLogger(namespace: string) {
    return {
      debug: (message: string, ...args: unknown[]) =>
        this.debug(`[${namespace}] ${message}`, ...args),
      info: (message: string, ...args: unknown[]) =>
        this.info(`[${namespace}] ${message}`, ...args),
      warn: (message: string, ...args: unknown[]) =>
        this.warn(`[${namespace}] ${message}`, ...args),
      error: (message: string, error?: unknown, ...args: unknown[]) =>
        this.error(`[${namespace}] ${message}`, error, ...args),
    };
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();

/**
 * Create a logger for a specific module/component
 * @example
 * const log = createLogger("OrderService");
 * log.info("Fetching orders...");
 */
export const createLogger = (namespace: string) => {
  return logger.createNamespacedLogger(namespace);
};
