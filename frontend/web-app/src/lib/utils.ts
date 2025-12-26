import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency to VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(
  date: Date | string,
  format: "short" | "long" = "short"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format phone number to Vietnamese format
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  }
  return phone;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

/**
 * Get status color for badges
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PICKED_UP: "bg-blue-100 text-blue-800 border-blue-200",
    IN_TRANSIT: "bg-purple-100 text-purple-800 border-purple-200",
    OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800 border-indigo-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    FAILED: "bg-red-100 text-red-800 border-red-200",
    RETURNED: "bg-orange-100 text-orange-800 border-orange-200",
    CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
}

/**
 * Get Vietnamese status label
 */
export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    PENDING: "Chờ lấy hàng",
    PICKED_UP: "Đã lấy hàng",
    IN_TRANSIT: "Đang vận chuyển",
    OUT_FOR_DELIVERY: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    FAILED: "Giao thất bại",
    RETURNED: "Đã hoàn trả",
    CANCELLED: "Đã hủy",
  };

  return statusLabels[status] || status;
}
