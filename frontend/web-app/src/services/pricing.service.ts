import { ServiceType, Pricing } from "../models";
import { BaseService } from "./base.service";

/**
 * Pricing Service
 * Manages service types and pricing calculations
 */
class PricingServiceClass extends BaseService<Pricing> {
  private serviceTypes: ServiceType[] = [
    {
      id: 1,
      code: "EXPRESS",
      name: "Hỏa tốc",
      description: "Giao hàng trong vòng 24 giờ",
      estimatedDeliveryDays: 1,
      priority: 3,
      isActive: true,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: 2,
      code: "FAST",
      name: "Chuyển phát nhanh",
      description: "Giao hàng trong vòng 2-3 ngày",
      estimatedDeliveryDays: 3,
      priority: 2,
      isActive: true,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: 3,
      code: "STANDARD",
      name: "Tiết kiệm",
      description: "Giao hàng trong vòng 4-7 ngày",
      estimatedDeliveryDays: 5,
      priority: 1,
      isActive: true,
      createdAt: new Date("2024-01-01"),
    },
  ];

  private pricingMatrix: Pricing[] = [
    // EXPRESS
    {
      id: 1,
      version: "v1.0",
      serviceTypeId: 1,
      weightFrom: 0,
      weightTo: 0.5,
      basePrice: 35000,
      perKgPrice: 0,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: undefined,
      isActive: true,
      createdAt: new Date("2025-01-01"),
    },
    {
      id: 2,
      version: "v1.0",
      serviceTypeId: 1,
      weightFrom: 0.5,
      weightTo: 1.0,
      basePrice: 40000,
      perKgPrice: 15000,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: undefined,
      isActive: true,
      createdAt: new Date("2025-01-01"),
    },
    {
      id: 3,
      version: "v1.0",
      serviceTypeId: 1,
      weightFrom: 1.0,
      weightTo: 5.0,
      basePrice: 55000,
      perKgPrice: 12000,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: undefined,
      isActive: true,
      createdAt: new Date("2025-01-01"),
    },
    {
      id: 4,
      version: "v1.0",
      serviceTypeId: 1,
      weightFrom: 5.0,
      weightTo: 20.0,
      basePrice: 103000,
      perKgPrice: 10000,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: undefined,
      isActive: true,
      createdAt: new Date("2025-01-01"),
    },

    // FAST
    {
      id: 5,
      version: "v1.0",
      serviceTypeId: 2,
      weightFrom: 0,
      weightTo: 0.5,
      basePrice: 20000,
      perKgPrice: 0,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: undefined,
      isActive: true,
      createdAt: new Date("2025-01-01"),
    },
    {
      id: 6,
      version: "v1.0",
      serviceTypeId: 2,
      weightFrom: 0.5,
      weightTo: 1.0,
      basePrice: 25000,
      perKgPrice: 10000,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: undefined,
      isActive: true,
      createdAt: new Date("2025-01-01"),
    },
    {
      id: 7,
      version: "v1.0",
      serviceTypeId: 2,
      weightFrom: 1.0,
      weightTo: 5.0,
      basePrice: 35000,
      perKgPrice: 8000,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: undefined,
      isActive: true,
      createdAt: new Date("2025-01-01"),
    },
    {
      id: 8,
      version: "v1.0",
      serviceTypeId: 2,
      weightFrom: 5.0,
      weightTo: 20.0,
      basePrice: 67000,
      perKgPrice: 7000,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: undefined,
      isActive: true,
      createdAt: new Date("2025-01-01"),
    },

    // STANDARD
    {
      id: 9,
      version: "v1.0",
      serviceTypeId: 3,
      weightFrom: 0,
      weightTo: 0.5,
      basePrice: 15000,
      perKgPrice: 0,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: undefined,
      isActive: true,
      createdAt: new Date("2025-01-01"),
    },
    {
      id: 10,
      version: "v1.0",
      serviceTypeId: 3,
      weightFrom: 0.5,
      weightTo: 1.0,
      basePrice: 18000,
      perKgPrice: 7000,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: undefined,
      isActive: true,
      createdAt: new Date("2025-01-01"),
    },
    {
      id: 11,
      version: "v1.0",
      serviceTypeId: 3,
      weightFrom: 1.0,
      weightTo: 5.0,
      basePrice: 25000,
      perKgPrice: 5000,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: undefined,
      isActive: true,
      createdAt: new Date("2025-01-01"),
    },
    {
      id: 12,
      version: "v1.0",
      serviceTypeId: 3,
      weightFrom: 5.0,
      weightTo: 20.0,
      basePrice: 45000,
      perKgPrice: 4000,
      effectiveFrom: new Date("2025-01-01"),
      effectiveTo: undefined,
      isActive: true,
      createdAt: new Date("2025-01-01"),
    },
  ];

  async getAll(): Promise<Pricing[]> {
    return this.mockSuccess([...this.pricingMatrix]);
  }

  async getById(id: number): Promise<Pricing | null> {
    const pricing = this.pricingMatrix.find((p) => p.id === id);
    return this.mockSuccess(pricing || null);
  }

  async create(data: Partial<Pricing>): Promise<Pricing> {
    const newPricing: Pricing = {
      id: this.generateId(),
      version: data.version || "v1.0",
      serviceTypeId: data.serviceTypeId || 1,
      weightFrom: data.weightFrom || 0,
      weightTo: data.weightTo || 0,
      basePrice: data.basePrice || 0,
      perKgPrice: data.perKgPrice || 0,
      effectiveFrom: data.effectiveFrom || this.now(),
      effectiveTo: data.effectiveTo,
      isActive: data.isActive ?? true,
      createdAt: this.now(),
    };

    this.pricingMatrix.push(newPricing);
    return this.mockSuccess(newPricing);
  }

  async update(id: number, data: Partial<Pricing>): Promise<Pricing> {
    const index = this.pricingMatrix.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Pricing with id ${id} not found`);
    }

    this.pricingMatrix[index] = {
      ...this.pricingMatrix[index],
      ...data,
    };

    return this.mockSuccess(this.pricingMatrix[index]);
  }

  async delete(id: number): Promise<boolean> {
    const index = this.pricingMatrix.findIndex((p) => p.id === id);
    if (index === -1) {
      return this.mockSuccess(false);
    }

    this.pricingMatrix.splice(index, 1);
    return this.mockSuccess(true);
  }

  /**
   * Get all service types
   */
  async getServiceTypes(): Promise<ServiceType[]> {
    return this.mockSuccess([...this.serviceTypes]);
  }

  /**
   * Get service type by ID
   */
  async getServiceTypeById(id: number): Promise<ServiceType | null> {
    const serviceType = this.serviceTypes.find((s) => s.id === id);
    return this.mockSuccess(serviceType || null);
  }

  /**
   * Calculate shipping fee
   */
  async calculateFee(
    serviceTypeId: number,
    weight: number
  ): Promise<{
    baseFee: number;
    insuranceFee: number;
    codFee: number;
    totalFee: number;
  }> {
    await this.simulateDelay();

    // Find applicable pricing
    const pricing = this.pricingMatrix.find(
      (p) =>
        p.serviceTypeId === serviceTypeId &&
        p.isActive &&
        weight >= p.weightFrom &&
        weight <= p.weightTo
    );

    if (!pricing) {
      throw new Error("Không tìm thấy bảng giá phù hợp");
    }

    // Calculate base fee
    let baseFee = pricing.basePrice;
    if (weight > pricing.weightFrom) {
      const extraWeight = weight - pricing.weightFrom;
      baseFee += extraWeight * pricing.perKgPrice;
    }

    // Calculate fees (example rates)
    const insuranceFee = 0; // Insurance is optional
    const codFee = 0; // COD fee calculated separately

    return {
      baseFee: Math.round(baseFee),
      insuranceFee,
      codFee,
      totalFee: Math.round(baseFee + insuranceFee + codFee),
    };
  }

  /**
   * Calculate COD fee (2% of COD amount, min 10,000 VND)
   */
  async calculateCodFee(codAmount: number): Promise<number> {
    await this.simulateDelay();

    if (codAmount <= 0) return 0;

    const fee = Math.max(codAmount * 0.02, 10000);
    return Math.round(fee);
  }

  /**
   * Calculate insurance fee (0.5% of declared value, min 5,000 VND)
   */
  async calculateInsuranceFee(declaredValue: number): Promise<number> {
    await this.simulateDelay();

    if (declaredValue <= 0) return 0;

    const fee = Math.max(declaredValue * 0.005, 5000);
    return Math.round(fee);
  }

  /**
   * Get pricing by service type
   */
  async getPricingByServiceType(serviceTypeId: number): Promise<Pricing[]> {
    const filtered = this.pricingMatrix.filter(
      (p) => p.serviceTypeId === serviceTypeId && p.isActive
    );
    return this.mockSuccess(filtered);
  }
}

export const PricingService = new PricingServiceClass();
