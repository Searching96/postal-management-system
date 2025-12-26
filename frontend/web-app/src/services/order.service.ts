import {
  Order,
  CreateOrderDto,
  OrderStatus,
  OrderStatusHistory,
} from "../models";
import { BaseService } from "./base.service";
import { PricingService } from "./pricing.service";

/**
 * Order Service
 * Manages orders (shipments) - the core entity of the system
 */
class OrderServiceClass extends BaseService<Order> {
  private mockOrders: Order[] = [
    {
      id: 1,
      trackingNumber: "VN20250120000123VN",
      customerId: 1,
      serviceTypeId: 2, // FAST
      originOfficeId: 3,
      destinationOfficeId: 4,

      senderName: "Nguyễn Văn Dũng",
      senderPhone: "0912345678",
      senderAddress: "123 Nguyễn Văn Cừ",
      senderProvince: "TP. Hồ Chí Minh",
      senderDistrict: "Quận 5",
      senderWard: "Phường 1",

      receiverName: "Trần Thị Lan",
      receiverPhone: "0987654321",
      receiverAddress: "456 Cách Mạng Tháng 8",
      receiverProvince: "TP. Hồ Chí Minh",
      receiverDistrict: "Quận 3",
      receiverWard: "Phường 2",

      packageType: "Quần áo",
      actualWeight: 0.8,
      volumetricWeight: 0.5,
      chargeableWeight: 0.8,
      declaredValue: 500000,
      notes: "Hàng dễ vỡ, xin nhẹ tay",

      baseFee: 29000,
      insuranceFee: 5000,
      codFee: 15000,
      totalFee: 49000,

      codAmount: 750000,

      status: OrderStatus.IN_TRANSIT,
      estimatedDelivery: new Date("2025-01-23"),
      actualDelivery: undefined,
      createdBy: 2,
      createdAt: new Date("2025-01-20T08:30:00"),
      updatedAt: new Date("2025-01-21T10:15:00"),
    },
    {
      id: 2,
      trackingNumber: "VN20250119000456VN",
      customerId: 2,
      serviceTypeId: 1, // EXPRESS
      originOfficeId: 3,
      destinationOfficeId: 3,

      senderName: "Trần Thị Hoa",
      senderPhone: "0923456789",
      senderAddress: "456 Lê Văn Sỹ",
      senderProvince: "TP. Hồ Chí Minh",
      senderDistrict: "Quận 3",
      senderWard: "Phường 2",

      receiverName: "Phạm Văn Hùng",
      receiverPhone: "0909123456",
      receiverAddress: "789 Điện Biên Phủ",
      receiverProvince: "TP. Hồ Chí Minh",
      receiverDistrict: "Quận 1",
      receiverWard: "Phường Bến Thành",

      packageType: "Giày dép thời trang",
      actualWeight: 1.2,
      volumetricWeight: 0.8,
      chargeableWeight: 1.2,
      declaredValue: 1200000,
      notes: "Giao trong giờ hành chính",

      baseFee: 57400,
      insuranceFee: 6000,
      codFee: 24000,
      totalFee: 87400,

      codAmount: 1200000,

      status: OrderStatus.DELIVERED,
      estimatedDelivery: new Date("2025-01-20"),
      actualDelivery: new Date("2025-01-20T14:30:00"),
      createdBy: 2,
      createdAt: new Date("2025-01-19T09:00:00"),
      updatedAt: new Date("2025-01-20T14:30:00"),
    },
    {
      id: 3,
      trackingNumber: "VN20250121000789VN",
      customerId: 3,
      serviceTypeId: 2, // FAST
      originOfficeId: 3,
      destinationOfficeId: 5,

      senderName: "Phạm Minh Tuấn",
      senderPhone: "0934567890",
      senderAddress: "789 Điện Biên Phủ",
      senderProvince: "TP. Hồ Chí Minh",
      senderDistrict: "Quận Bình Thạnh",
      senderWard: "Phường 25",

      receiverName: "Lê Thị Nga",
      receiverPhone: "0911222333",
      receiverAddress: "111 Hai Bà Trưng",
      receiverProvince: "Hà Nội",
      receiverDistrict: "Quận Hoàn Kiếm",
      receiverWard: "Phường Cửa Đông",

      packageType: "Linh kiện điện tử",
      actualWeight: 2.5,
      volumetricWeight: 1.8,
      chargeableWeight: 2.5,
      declaredValue: 5000000,
      notes: "Hàng công nghệ, cần bảo quản cẩn thận",

      baseFee: 47000,
      insuranceFee: 25000,
      codFee: 0,
      totalFee: 72000,

      codAmount: 0,

      status: OrderStatus.OUT_FOR_DELIVERY,
      estimatedDelivery: new Date("2025-01-24"),
      actualDelivery: undefined,
      createdBy: 2,
      createdAt: new Date("2025-01-21T10:00:00"),
      updatedAt: new Date("2025-01-23T08:00:00"),
    },
    {
      id: 4,
      trackingNumber: "VN20250122000012VN",
      customerId: 5,
      serviceTypeId: 3, // STANDARD
      originOfficeId: 3,
      destinationOfficeId: 4,

      senderName: "Võ Thanh Tùng",
      senderPhone: "0956789012",
      senderAddress: "555 Cách Mạng Tháng 8",
      senderProvince: "TP. Hồ Chí Minh",
      senderDistrict: "Quận Tân Bình",
      senderWard: "Phường 7",

      receiverName: "Nguyễn Thị Thu",
      receiverPhone: "0922333444",
      receiverAddress: "222 Võ Văn Tần",
      receiverProvince: "TP. Hồ Chí Minh",
      receiverDistrict: "Quận 3",
      receiverWard: "Phường 5",

      packageType: "Mỹ phẩm",
      actualWeight: 0.3,
      volumetricWeight: 0.2,
      chargeableWeight: 0.3,
      declaredValue: 300000,
      notes: "Giao buổi chiều",

      baseFee: 15000,
      insuranceFee: 5000,
      codFee: 6000,
      totalFee: 26000,

      codAmount: 300000,

      status: OrderStatus.PENDING,
      estimatedDelivery: new Date("2025-01-27"),
      actualDelivery: undefined,
      createdBy: 2,
      createdAt: new Date("2025-01-22T11:30:00"),
      updatedAt: new Date("2025-01-22T11:30:00"),
    },
    {
      id: 5,
      trackingNumber: "VN20250118000345VN",
      customerId: 1,
      serviceTypeId: 2, // FAST
      originOfficeId: 3,
      destinationOfficeId: 3,

      senderName: "Nguyễn Văn Dũng",
      senderPhone: "0912345678",
      senderAddress: "123 Nguyễn Văn Cừ",
      senderProvince: "TP. Hồ Chí Minh",
      senderDistrict: "Quận 5",
      senderWard: "Phường 1",

      receiverName: "Hoàng Văn Nam",
      receiverPhone: "0933444555",
      receiverAddress: "333 Nguyễn Đình Chiểu",
      receiverProvince: "TP. Hồ Chí Minh",
      receiverDistrict: "Quận 1",
      receiverWard: "Phường Nguyễn Thái Bình",

      packageType: "Sách",
      actualWeight: 1.5,
      volumetricWeight: 1.0,
      chargeableWeight: 1.5,
      declaredValue: 200000,
      notes: "",

      baseFee: 39000,
      insuranceFee: 5000,
      codFee: 10000,
      totalFee: 54000,

      codAmount: 500000,

      status: OrderStatus.FAILED,
      estimatedDelivery: new Date("2025-01-21"),
      actualDelivery: undefined,
      createdBy: 2,
      createdAt: new Date("2025-01-18T14:00:00"),
      updatedAt: new Date("2025-01-21T16:30:00"),
    },
  ];

  private statusHistory: OrderStatusHistory[] = [];
  private nextId = 6;

  async getAll(): Promise<Order[]> {
    return this.mockSuccess([...this.mockOrders]);
  }

  async getById(id: number): Promise<Order | null> {
    const order = this.mockOrders.find((o) => o.id === id);
    return this.mockSuccess(order || null);
  }

  async create(data: Partial<Order> | CreateOrderDto): Promise<Order> {
    // Calculate fees
    const serviceTypeId = (data as Order).serviceTypeId || 2;
    const actualWeight = (data as Order).actualWeight || 0;
    const declaredValue = (data as Order).declaredValue || 0;
    const codAmount = (data as Order).codAmount || 0;

    const fees = await PricingService.calculateFee(serviceTypeId, actualWeight);
    const insuranceFee =
      declaredValue > 0
        ? await PricingService.calculateInsuranceFee(declaredValue)
        : 0;
    const codFee =
      codAmount > 0 ? await PricingService.calculateCodFee(codAmount) : 0;

    const newOrder: Order = {
      id: this.nextId++,
      trackingNumber: this.generateTrackingNumber(),
      customerId: (data as Order).customerId,
      serviceTypeId,
      originOfficeId: (data as Order).originOfficeId || 3,
      destinationOfficeId: (data as Order).destinationOfficeId,

      senderName: (data as CreateOrderDto).senderName || "",
      senderPhone: (data as CreateOrderDto).senderPhone || "",
      senderAddress: (data as CreateOrderDto).senderAddress || "",
      senderProvince: (data as CreateOrderDto).senderProvince,
      senderDistrict: (data as CreateOrderDto).senderDistrict,
      senderWard: (data as CreateOrderDto).senderWard,

      receiverName: (data as CreateOrderDto).receiverName || "",
      receiverPhone: (data as CreateOrderDto).receiverPhone || "",
      receiverAddress: (data as CreateOrderDto).receiverAddress || "",
      receiverProvince: (data as CreateOrderDto).receiverProvince || "",
      receiverDistrict: (data as CreateOrderDto).receiverDistrict || "",
      receiverWard: (data as CreateOrderDto).receiverWard,

      packageType: (data as CreateOrderDto).packageType,
      actualWeight,
      volumetricWeight: actualWeight * 0.7, // Mock calculation
      chargeableWeight: actualWeight,
      declaredValue,
      notes: (data as CreateOrderDto).notes,

      baseFee: fees.baseFee,
      insuranceFee,
      codFee,
      totalFee: fees.baseFee + insuranceFee + codFee,

      codAmount,

      status: OrderStatus.PENDING,
      estimatedDelivery: this.addDays(3),
      actualDelivery: undefined,
      createdBy: (data as Order).createdBy || 1,
      createdAt: this.now(),
      updatedAt: this.now(),
    };

    this.mockOrders.push(newOrder);

    // Create initial status history
    this.statusHistory.push({
      id: this.generateId(),
      orderId: newOrder.id,
      status: OrderStatus.PENDING,
      location: "Bưu cục Quận 1",
      organizationId: newOrder.originOfficeId,
      notes: "Đơn hàng đã được tạo",
      createdBy: newOrder.createdBy,
      createdAt: newOrder.createdAt,
    });

    return this.mockSuccess(newOrder);
  }

  async update(id: number, data: Partial<Order>): Promise<Order> {
    const index = this.mockOrders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Order with id ${id} not found`);
    }

    this.mockOrders[index] = {
      ...this.mockOrders[index],
      ...data,
      updatedAt: this.now(),
    };

    return this.mockSuccess(this.mockOrders[index]);
  }

  async delete(id: number): Promise<boolean> {
    const index = this.mockOrders.findIndex((o) => o.id === id);
    if (index === -1) {
      return this.mockSuccess(false);
    }

    this.mockOrders.splice(index, 1);
    return this.mockSuccess(true);
  }

  /**
   * Get order by tracking number
   */
  async getByTrackingNumber(trackingNumber: string): Promise<Order | null> {
    const order = this.mockOrders.find(
      (o) => o.trackingNumber === trackingNumber
    );
    return this.mockSuccess(order || null);
  }

  /**
   * Search orders by multiple criteria
   */
  async search(criteria: {
    trackingNumber?: string;
    receiverPhone?: string;
    receiverName?: string;
    status?: OrderStatus;
    customerId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Order[]> {
    let filtered = [...this.mockOrders];

    if (criteria.trackingNumber) {
      filtered = filtered.filter((o) =>
        o.trackingNumber.includes(criteria.trackingNumber!)
      );
    }

    if (criteria.receiverPhone) {
      filtered = filtered.filter((o) =>
        o.receiverPhone.includes(criteria.receiverPhone!)
      );
    }

    if (criteria.receiverName) {
      const name = criteria.receiverName.toLowerCase();
      filtered = filtered.filter((o) =>
        o.receiverName.toLowerCase().includes(name)
      );
    }

    if (criteria.status) {
      filtered = filtered.filter((o) => o.status === criteria.status);
    }

    if (criteria.customerId) {
      filtered = filtered.filter((o) => o.customerId === criteria.customerId);
    }

    if (criteria.dateFrom) {
      filtered = filtered.filter((o) => o.createdAt >= criteria.dateFrom!);
    }

    if (criteria.dateTo) {
      filtered = filtered.filter((o) => o.createdAt <= criteria.dateTo!);
    }

    return this.mockSuccess(filtered);
  }

  /**
   * Update order status
   */
  async updateStatus(
    orderId: number,
    status: OrderStatus,
    notes?: string,
    userId?: number,
    location?: string
  ): Promise<Order> {
    const order = await this.getById(orderId);
    if (!order) {
      throw new Error(`Order with id ${orderId} not found`);
    }

    // Update order status
    order.status = status;
    order.updatedAt = this.now();

    if (status === OrderStatus.DELIVERED) {
      order.actualDelivery = this.now();
    }

    // Add status history
    this.statusHistory.push({
      id: this.generateId(),
      orderId,
      status,
      location,
      organizationId: order.originOfficeId,
      notes,
      createdBy: userId,
      createdAt: this.now(),
    });

    return this.mockSuccess(order);
  }

  /**
   * Get status history for an order
   */
  async getStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    const history = this.statusHistory.filter((h) => h.orderId === orderId);
    return this.mockSuccess(history);
  }

  /**
   * Get orders by status
   */
  async getByStatus(status: OrderStatus): Promise<Order[]> {
    const filtered = this.mockOrders.filter((o) => o.status === status);
    return this.mockSuccess(filtered);
  }

  /**
   * Get orders by customer
   */
  async getByCustomer(customerId: number): Promise<Order[]> {
    const filtered = this.mockOrders.filter((o) => o.customerId === customerId);
    return this.mockSuccess(filtered);
  }

  /**
   * Get statistics
   */
  async getStatistics(
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{
    total: number;
    byStatus: Record<OrderStatus, number>;
    totalRevenue: number;
    totalCod: number;
  }> {
    let filtered = [...this.mockOrders];

    if (dateFrom) {
      filtered = filtered.filter((o) => o.createdAt >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter((o) => o.createdAt <= dateTo);
    }

    const byStatus = filtered.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);

    const totalRevenue = filtered.reduce((sum, o) => sum + o.totalFee, 0);
    const totalCod = filtered.reduce((sum, o) => sum + o.codAmount, 0);

    return this.mockSuccess({
      total: filtered.length,
      byStatus,
      totalRevenue,
      totalCod,
    });
  }
}

export const OrderService = new OrderServiceClass();
