/**
 * Validation patterns for common form inputs
 */
export const VALIDATION_PATTERNS = {
  PHONE: /(84|0)+([0-9]{9})\b/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

/**
 * Validation error messages in Vietnamese
 */
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: "Trường này là bắt buộc",
  INVALID_PHONE: "Số điện thoại không hợp lệ (VD: 0912345678)",
  INVALID_EMAIL: "Email không hợp lệ",
  MIN_LENGTH: (min: number) => `Phải có ít nhất ${min} ký tự`,
  MAX_LENGTH: (max: number) => `Không được vượt quá ${max} ký tự`,
  MIN_VALUE: (min: number) => `Giá trị phải lớn hơn hoặc bằng ${min}`,
  MAX_VALUE: (max: number) => `Giá trị phải nhỏ hơn hoặc bằng ${max}`,
} as const;

/**
 * Default pagination settings
 */
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 10,
  SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/**
 * API endpoints base paths
 */
export const API_ENDPOINTS = {
  AUTH: "/auth",
  ORDERS: "/orders",
  BATCHES: "/batches",
  OFFICES: "/offices",
  USERS: "/users",
  ROUTES: "/routes",
  MESSAGES: "/messages",
  TRACKING: "/tracking",
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "token",
  USER_PREFERENCES: "userPreferences",
} as const;

/**
 * Toast notification durations (in milliseconds)
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
} as const;

/**
 * Debounce delays (in milliseconds)
 */
export const DEBOUNCE_DELAY = {
  SEARCH: 500,
  PRICE_CALCULATION: 800,
  AUTO_SAVE: 1000,
} as const;
