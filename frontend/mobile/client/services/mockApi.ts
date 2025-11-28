export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
}

export interface TrackingEvent {
  timestamp: string;
  status: "picked-up" | "transferring" | "delivering" | "delivered" | "failed";
  message: string;
  location?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: "pending" | "in-transit" | "delivered" | "failed" | "pending-payment";
  targetDeliveryDate: string;
  codAmount: number;
  recipientName: string;
  recipientPhone: string;
  address: string;
  createdDate: string;
  items: string;
  trackingHistory?: TrackingEvent[];
}

// Mock customer data - in a real app this would come from a backend API
const mockCustomerInfo: CustomerInfo = {
  name: "Nguyễn Văn A",
  phone: "0901234567",
  email: "nguyenva@example.com",
};

// Mock order history - in a real app this would come from a backend API
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "VN123456789001",
    status: "delivered",
    targetDeliveryDate: "2024-01-15",
    codAmount: 500000,
    recipientName: "Trần Văn B",
    recipientPhone: "0987654321",
    address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    createdDate: "2024-01-10",
    items: "Quần áo, Giày dép",
    trackingHistory: [
      {
        timestamp: "2024-01-10 08:30",
        status: "picked-up",
        message: "Đơn hàng được lấy từ điểm gửi",
        location: "TP.HCM",
      },
      {
        timestamp: "2024-01-11 14:20",
        status: "transferring",
        message: "Đơn hàng đang được vận chuyển",
        location: "Hệ thống phân loại Tân Bình",
      },
      {
        timestamp: "2024-01-14 10:15",
        status: "delivering",
        message: "Đơn hàng đang được giao",
        location: "Quận 1, TP.HCM",
      },
      {
        timestamp: "2024-01-15 14:50",
        status: "delivered",
        message: "Đơn hàng đã được giao thành công",
        location: "123 Đường Lê Lợi, Quận 1, TP.HCM",
      },
    ],
  },
  {
    id: "2",
    orderNumber: "VN123456789002",
    status: "in-transit",
    targetDeliveryDate: "2024-01-18",
    codAmount: 750000,
    recipientName: "Phạm Thị C",
    recipientPhone: "0912345678",
    address: "456 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    createdDate: "2024-01-12",
    items: "Điện thoại",
    trackingHistory: [
      {
        timestamp: "2024-01-12 09:00",
        status: "picked-up",
        message: "Đơn hàng được lấy từ điểm gửi",
        location: "TP.HCM",
      },
      {
        timestamp: "2024-01-13 15:30",
        status: "transferring",
        message: "Đơn hàng đang được vận chuyển",
        location: "Hệ thống phân loại Tân Bình",
      },
      {
        timestamp: "2024-01-17 11:20",
        status: "delivering",
        message: "Đơn hàng đang được giao",
        location: "Quận 1, TP.HCM",
      },
    ],
  },
  {
    id: "3",
    orderNumber: "VN123456789003",
    status: "pending",
    targetDeliveryDate: "2024-01-20",
    codAmount: 300000,
    recipientName: "Hoàng Văn D",
    recipientPhone: "0923456789",
    address: "789 Đường Trần Hưng Đạo, Quận 5, TP.HCM",
    createdDate: "2024-01-13",
    items: "Sách, Dụng cụ học tập",
    trackingHistory: [
      {
        timestamp: "2024-01-13 10:45",
        status: "picked-up",
        message: "Đơn hàng được lấy từ điểm gửi",
        location: "TP.HCM",
      },
    ],
  },
  {
    id: "4",
    orderNumber: "VN123456789004",
    status: "pending-payment",
    targetDeliveryDate: "2024-01-19",
    codAmount: 1200000,
    recipientName: "Võ Thị E",
    recipientPhone: "0934567890",
    address: "321 Đường Bà Triệu, Quận Hà Đông, Hà Nội",
    createdDate: "2024-01-11",
    items: "Laptop",
    trackingHistory: [
      {
        timestamp: "2024-01-11 11:20",
        status: "picked-up",
        message: "Đơn hàng được lấy từ điểm gửi",
        location: "Hà Nội",
      },
      {
        timestamp: "2024-01-12 16:00",
        status: "transferring",
        message: "Đơn hàng đang được vận chuyển",
        location: "Hệ thống phân loại Hoàng Mai",
      },
    ],
  },
  {
    id: "5",
    orderNumber: "VN123456789005",
    status: "delivered",
    targetDeliveryDate: "2024-01-14",
    codAmount: 200000,
    recipientName: "Dương Văn F",
    recipientPhone: "0945678901",
    address: "654 Đường Hàng Bài, Quận Hoàn Kiếm, Hà Nội",
    createdDate: "2024-01-09",
    items: "Mỹ phẩm",
    trackingHistory: [
      {
        timestamp: "2024-01-09 07:15",
        status: "picked-up",
        message: "Đơn hàng được lấy từ điểm gửi",
        location: "Hà Nội",
      },
      {
        timestamp: "2024-01-10 13:45",
        status: "transferring",
        message: "Đơn hàng đang được vận chuyển",
        location: "Hệ thống phân loại Hoàng Mai",
      },
      {
        timestamp: "2024-01-13 09:30",
        status: "delivering",
        message: "Đơn hàng đang được giao",
        location: "Quận Hoàn Kiếm, Hà Nội",
      },
      {
        timestamp: "2024-01-14 16:20",
        status: "delivered",
        message: "Đơn hàng đã được giao thành công",
        location: "654 Đường Hàng Bài, Quận Hoàn Kiếm, Hà Nội",
      },
    ],
  },
];

// Mock API functions
export async function fetchCustomerInfo(): Promise<CustomerInfo> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCustomerInfo);
    }, 300);
  });
}

export async function fetchOrders(): Promise<Order[]> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockOrders);
    }, 300);
  });
}

export function getStatusLabel(status: Order["status"]): string {
  const statusLabels: Record<Order["status"], string> = {
    pending: "Chưa lấy",
    "in-transit": "Đang vận chuyển",
    delivered: "Đã giao",
    failed: "Giao thất bại",
    "pending-payment": "Chờ thanh toán",
  };
  return statusLabels[status];
}

export function getStatusColor(status: Order["status"]): string {
  const colors: Record<Order["status"], string> = {
    pending: "text-yellow-600",
    "in-transit": "text-blue-600",
    delivered: "text-green-600",
    failed: "text-red-600",
    "pending-payment": "text-orange-600",
  };
  return colors[status];
}

export function getStatusBgColor(status: Order["status"]): string {
  const colors: Record<Order["status"], string> = {
    pending: "bg-yellow-50",
    "in-transit": "bg-blue-50",
    delivered: "bg-green-50",
    failed: "bg-red-50",
    "pending-payment": "bg-orange-50",
  };
  return colors[status];
}

export async function fetchOrderTracking(orderNumber: string): Promise<{
  order: Order;
  trackingHistory: TrackingEvent[];
  currentMilestoneIndex: number;
}> {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = mockOrders.find((o) => o.orderNumber === orderNumber);
      if (!order) {
        throw new Error("Order not found");
      }

      const trackingHistory = order.trackingHistory || [];
      const milestones = ["picked-up", "transferring", "delivering", "delivered"] as const;
      const currentMilestoneIndex = trackingHistory.length > 0
        ? milestones.indexOf(
            trackingHistory[trackingHistory.length - 1].status as any
          )
        : -1;

      resolve({
        order,
        trackingHistory,
        currentMilestoneIndex,
      });
    }, 300);
  });
}

export function formatDateTime(dateTimeString: string): string {
  try {
    const [datePart, timePart] = dateTimeString.split(" ");
    const [year, month, day] = datePart.split("-");
    return `${timePart} ${day}/${month}/${year}`;
  } catch {
    return dateTimeString;
  }
}
