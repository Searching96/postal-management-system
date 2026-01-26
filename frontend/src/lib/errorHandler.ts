import { toast } from "sonner";
import { logger } from "./logger";

/**
 * Standard error response from API
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data
  ) {
    return String(error.response.data.message);
  }

  return "Đã xảy ra lỗi không xác định";
};

/**
 * Handle API errors with consistent logging and user notification
 */
export const handleApiError = (
  error: unknown,
  context: string,
  options: {
    showToast?: boolean;
    customMessage?: string;
    logError?: boolean;
  } = {}
): void => {
  const {
    showToast = true,
    customMessage,
    logError = true,
  } = options;

  const errorMessage = customMessage || getErrorMessage(error);

  if (logError) {
    logger.error(`${context}:`, error);
  }

  if (showToast) {
    toast.error(errorMessage);
  }
};

/**
 * Async error wrapper for consistent error handling
 */
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  context: string,
  options?: {
    showToast?: boolean;
    customMessage?: string;
    onError?: (error: unknown) => void;
  }
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    handleApiError(error, context, options);
    options?.onError?.(error);
    return null;
  }
};
