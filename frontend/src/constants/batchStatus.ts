/**
 * Batch status constants
 * Centralized enum for batch statuses across the application
 */
export enum BatchStatus {
  OPEN = "OPEN",
  PROCESSING = "PROCESSING",
  SEALED = "SEALED",
  IN_TRANSIT = "IN_TRANSIT",
  ARRIVED = "ARRIVED",
  DISTRIBUTED = "DISTRIBUTED",
  CANCELLED = "CANCELLED",
}

/**
 * Get display label for batch status
 */
export const getBatchStatusLabel = (status: BatchStatus | string): string => {
  const labels: Record<BatchStatus, string> = {
    [BatchStatus.OPEN]: "Đang mở",
    [BatchStatus.PROCESSING]: "Đang xử lý",
    [BatchStatus.SEALED]: "Đã niêm phong",
    [BatchStatus.IN_TRANSIT]: "Đang vận chuyển",
    [BatchStatus.ARRIVED]: "Đã đến",
    [BatchStatus.DISTRIBUTED]: "Đã phân phối",
    [BatchStatus.CANCELLED]: "Đã hủy",
  };

  return labels[status as BatchStatus] || status;
};

/**
 * Get color class for batch status badge
 */
export const getBatchStatusColor = (status: BatchStatus | string): string => {
  const colors: Record<string, string> = {
    [BatchStatus.OPEN]: "bg-green-100 text-green-800",
    [BatchStatus.PROCESSING]: "bg-blue-100 text-blue-800",
    [BatchStatus.SEALED]: "bg-indigo-100 text-indigo-800",
    [BatchStatus.IN_TRANSIT]: "bg-purple-100 text-purple-800",
    [BatchStatus.ARRIVED]: "bg-orange-100 text-orange-800",
    [BatchStatus.DISTRIBUTED]: "bg-green-100 text-green-800",
    [BatchStatus.CANCELLED]: "bg-red-100 text-red-800",
  };

  return colors[status] || "bg-gray-100 text-gray-800";
};
