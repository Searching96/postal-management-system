/**
 * Route Order Interface (Junction Table)
 * Links orders to delivery routes with sequence
 */
export interface RouteOrder {
  id: number;
  routeId: number; // Reference to delivery route
  orderId: number; // Reference to order
  sequence: number; // Delivery sequence in route
  estimatedArrival?: Date; // Estimated arrival time
  actualArrival?: Date; // Actual arrival time
  notes?: string; // Additional notes
  createdAt: Date; // Creation timestamp
}
