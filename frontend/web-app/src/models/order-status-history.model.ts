import { OrderStatus } from "./enums";

/**
 * Order Status History Interface
 * Tracks all status changes for an order
 */
export interface OrderStatusHistory {
  id: number;
  orderId: number; // Reference to order
  status: OrderStatus; // Status at this point
  location?: string; // Location description
  organizationId?: number; // Organization where status changed
  notes?: string; // Additional notes
  latitude?: number; // GPS latitude (for mobile tracking)
  longitude?: number; // GPS longitude (for mobile tracking)
  createdBy?: number; // User who created this record
  createdAt: Date; // Timestamp of status change
}
