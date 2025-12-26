/**
 * Service Type Interface
 * Defines delivery service types (Express, Fast, Standard)
 */
export interface ServiceType {
  id: number;
  code: string; // Unique code ('EXPRESS', 'FAST', 'STANDARD')
  name: string; // Display name (Vietnamese)
  description?: string; // Service description
  estimatedDeliveryDays: number; // Estimated delivery time in days
  priority: number; // Priority (1=lowest, 3=highest)
  isActive: boolean; // Active status
  createdAt: Date; // Creation timestamp
}
