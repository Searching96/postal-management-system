/**
 * Order status constants
 * Centralized enum for order statuses across the application
 */
export enum OrderStatus {
  CREATED = "CREATED",
  ACCEPTED = "ACCEPTED",
  PENDING_PICKUP = "PENDING_PICKUP",
  PICKED_UP = "PICKED_UP",
  AT_ORIGIN_OFFICE = "AT_ORIGIN_OFFICE",
  SORTED_AT_ORIGIN = "SORTED_AT_ORIGIN",
  IN_TRANSIT_TO_HUB = "IN_TRANSIT_TO_HUB",
  AT_HUB = "AT_HUB",
  IN_TRANSIT_FROM_HUB = "IN_TRANSIT_FROM_HUB",
  IN_TRANSIT_TO_DESTINATION = "IN_TRANSIT_TO_DESTINATION",
  AT_DESTINATION_HUB = "AT_DESTINATION_HUB",
  IN_TRANSIT_TO_OFFICE = "IN_TRANSIT_TO_OFFICE",
  AT_DESTINATION_OFFICE = "AT_DESTINATION_OFFICE",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  DELIVERY_FAILED = "DELIVERY_FAILED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
  RETURNING = "RETURNING",
  ON_HOLD = "ON_HOLD",
  LOST = "LOST",
  DAMAGED = "DAMAGED",
}

/**
 * Get display label for order status
 */
export const getOrderStatusLabel = (status: OrderStatus | string): string => {
  const labels: Record<OrderStatus, string> = {
    [OrderStatus.CREATED]: "Đã tạo",
    [OrderStatus.ACCEPTED]: "Đã chấp nhận",
    [OrderStatus.PENDING_PICKUP]: "Chờ lấy hàng",
    [OrderStatus.PICKED_UP]: "Đã lấy hàng",
    [OrderStatus.AT_ORIGIN_OFFICE]: "Tại bưu cục gửi",
    [OrderStatus.SORTED_AT_ORIGIN]: "Đã phân loại",
    [OrderStatus.IN_TRANSIT_TO_HUB]: "Đang chuyển đến Hub",
    [OrderStatus.AT_HUB]: "Tại Hub",
    [OrderStatus.IN_TRANSIT_FROM_HUB]: "Đang chuyển từ Hub",
    [OrderStatus.IN_TRANSIT_TO_DESTINATION]: "Đang chuyển đến đích",
    [OrderStatus.AT_DESTINATION_HUB]: "Tại Hub đích",
    [OrderStatus.IN_TRANSIT_TO_OFFICE]: "Đang chuyển đến bưu cục",
    [OrderStatus.AT_DESTINATION_OFFICE]: "Tại bưu cục đích",
    [OrderStatus.OUT_FOR_DELIVERY]: "Đang giao hàng",
    [OrderStatus.DELIVERED]: "Đã giao",
    [OrderStatus.DELIVERY_FAILED]: "Giao thất bại",
    [OrderStatus.CANCELLED]: "Đã hủy",
    [OrderStatus.RETURNED]: "Đã hoàn trả",
    [OrderStatus.RETURNING]: "Đang hoàn trả",
    [OrderStatus.ON_HOLD]: "Tạm giữ",
    [OrderStatus.LOST]: "Mất hàng",
    [OrderStatus.DAMAGED]: "Hư hỏng",
  };

  return labels[status as OrderStatus] || status;
};

/**
 * Get color class for order status badge
 */
export const getOrderStatusColor = (status: OrderStatus | string): string => {
  const colors: Record<string, string> = {
    [OrderStatus.CREATED]: "bg-gray-100 text-gray-800",
    [OrderStatus.ACCEPTED]: "bg-blue-100 text-blue-800",
    [OrderStatus.PENDING_PICKUP]: "bg-yellow-100 text-yellow-800",
    [OrderStatus.PICKED_UP]: "bg-indigo-100 text-indigo-800",
    [OrderStatus.AT_ORIGIN_OFFICE]: "bg-purple-100 text-purple-800",
    [OrderStatus.SORTED_AT_ORIGIN]: "bg-purple-100 text-purple-800",
    [OrderStatus.IN_TRANSIT_TO_HUB]: "bg-blue-100 text-blue-800",
    [OrderStatus.AT_HUB]: "bg-indigo-100 text-indigo-800",
    [OrderStatus.IN_TRANSIT_FROM_HUB]: "bg-blue-100 text-blue-800",
    [OrderStatus.IN_TRANSIT_TO_DESTINATION]: "bg-blue-100 text-blue-800",
    [OrderStatus.AT_DESTINATION_HUB]: "bg-indigo-100 text-indigo-800",
    [OrderStatus.IN_TRANSIT_TO_OFFICE]: "bg-blue-100 text-blue-800",
    [OrderStatus.AT_DESTINATION_OFFICE]: "bg-purple-100 text-purple-800",
    [OrderStatus.OUT_FOR_DELIVERY]: "bg-orange-100 text-orange-800",
    [OrderStatus.DELIVERED]: "bg-green-100 text-green-800",
    [OrderStatus.DELIVERY_FAILED]: "bg-red-100 text-red-800",
    [OrderStatus.CANCELLED]: "bg-gray-100 text-gray-800",
    [OrderStatus.RETURNED]: "bg-yellow-100 text-yellow-800",
    [OrderStatus.RETURNING]: "bg-yellow-100 text-yellow-800",
    [OrderStatus.ON_HOLD]: "bg-orange-100 text-orange-800",
    [OrderStatus.LOST]: "bg-red-100 text-red-800",
    [OrderStatus.DAMAGED]: "bg-red-100 text-red-800",
  };

  return colors[status] || "bg-gray-100 text-gray-800";
};
