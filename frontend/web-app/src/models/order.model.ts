import { OrderStatus } from "./enums";

/**
 * Order Interface (Main entity)
 * Represents a shipment/order
 */
export interface Order {
  id: number;
  trackingNumber: string; // Unique tracking number (e.g., 'VN20250126001234VN')
  customerId: number; // Reference to customer
  serviceTypeId: number; // Reference to service type
  originOfficeId: number; // Origin post office ID
  destinationOfficeId?: number; // Destination post office ID

  // Sender Information
  senderName: string; // Sender's name
  senderPhone: string; // Sender's phone
  senderAddress: string; // Sender's full address
  senderProvince?: string; // Sender's province
  senderDistrict?: string; // Sender's district
  senderWard?: string; // Sender's ward

  // Receiver Information
  receiverName: string; // Receiver's name
  receiverPhone: string; // Receiver's phone
  receiverAddress: string; // Receiver's full address
  receiverProvince: string; // Receiver's province (required)
  receiverDistrict: string; // Receiver's district (required)
  receiverWard?: string; // Receiver's ward

  // Package Information
  packageType?: string; // Package type description
  actualWeight: number; // Actual weight (kg)
  volumetricWeight: number; // Volumetric weight (kg)
  chargeableWeight: number; // Chargeable weight (max of actual/volumetric)
  declaredValue: number; // Declared value (VND)
  notes?: string; // Additional notes

  // Pricing
  baseFee: number; // Base shipping fee (VND)
  insuranceFee: number; // Insurance fee (VND)
  codFee: number; // COD handling fee (VND)
  totalFee: number; // Total fee (VND)

  // COD Information
  codAmount: number; // Cash on delivery amount (VND)

  // Status
  status: OrderStatus; // Current order status

  // Timestamps
  estimatedDelivery?: Date; // Estimated delivery date
  actualDelivery?: Date; // Actual delivery date
  createdBy: number; // User ID who created this order
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}

/**
 * Order Creation DTO (Data Transfer Object)
 * Used when creating new orders
 */
export interface CreateOrderDto {
  customerId: number;
  serviceTypeId: number;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderProvince?: string;
  senderDistrict?: string;
  senderWard?: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverProvince: string;
  receiverDistrict: string;
  receiverWard?: string;
  packageType?: string;
  actualWeight: number;
  declaredValue?: number;
  notes?: string;
  codAmount?: number;
}
