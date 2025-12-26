import { RouteStatus } from "./enums";

/**
 * Delivery Route Interface
 * Represents a planned delivery route for a courier
 */
export interface DeliveryRoute {
  id: number;
  code: string; // Unique route code (e.g., 'RT20250126001')
  name: string; // Route name (Vietnamese)
  organizationId: number; // Post office ID
  courierId?: number; // Assigned courier ID
  routeDate: Date; // Route date
  status: RouteStatus; // Route status
  totalOrders: number; // Total number of orders
  deliveredOrders: number; // Successfully delivered orders
  failedOrders: number; // Failed delivery orders
  totalDistanceKm?: number; // Total distance (km)
  estimatedDurationMinutes?: number; // Estimated duration (minutes)
  startTime?: Date; // Actual start time
  endTime?: Date; // Actual end time
  notes?: string; // Additional notes
  createdBy: number; // User who created this route
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
