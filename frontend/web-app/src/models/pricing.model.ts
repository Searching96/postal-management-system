/**
 * Pricing Interface
 * Defines pricing matrix for different weight ranges and service types
 */
export interface Pricing {
  id: number;
  version: string; // Version number (e.g., 'v1.0')
  serviceTypeId: number; // Reference to service type
  weightFrom: number; // Weight range start (kg)
  weightTo: number; // Weight range end (kg)
  basePrice: number; // Base price (VND)
  perKgPrice: number; // Price per additional kg (VND)
  effectiveFrom: Date; // Effective start date
  effectiveTo?: Date; // Effective end date (null = current)
  isActive: boolean; // Active status
  createdAt: Date; // Creation timestamp
}
