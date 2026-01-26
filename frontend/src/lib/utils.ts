import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Re-export common utilities from constants
 * These are now centralized in the constants folder
 */
export { getRoleLabel, getOfficeTypeLabel } from "../constants/roles";

/**
 * Format number as Vietnamese currency (VND)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format ISO date string to Vietnamese date format (DD/MM/YYYY)
 * Handles both UTC and local datetime strings from backend
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  
  // Backend sends UTC LocalDateTime without 'Z', so we append it to treat it as UTC
  const normalized =
    dateString.endsWith("Z") || dateString.includes("+")
      ? dateString
      : `${dateString}Z`;
      
  return new Date(normalized).toLocaleDateString("vi-VN");
};

/**
 * Format ISO date string to Vietnamese datetime format (DD/MM/YYYY HH:mm)
 * Handles both UTC and local datetime strings from backend
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return "";
  
  const normalized =
    dateString.endsWith("Z") || dateString.includes("+")
      ? dateString
      : `${dateString}Z`;
      
  return new Date(normalized).toLocaleString("vi-VN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format weight to display with unit
 */
export const formatWeight = (weightKg: number): string => {
  return `${weightKg.toFixed(2)} kg`;
};

/**
 * Format dimensions (length x width x height)
 */
export const formatDimensions = (
  lengthCm: number,
  widthCm: number,
  heightCm: number
): string => {
  return `${lengthCm} × ${widthCm} × ${heightCm} cm`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Check if string is empty or only whitespace
 */
export const isEmptyString = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0;
};
