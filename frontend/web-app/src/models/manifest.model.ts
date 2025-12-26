import { ManifestStatus } from "./enums";

/**
 * Manifest Interface
 * Represents a batch of orders transferred between offices
 */
export interface Manifest {
  id: number;
  code: string; // Manifest code (e.g., 'MF20250126001')
  fromOrganizationId: number; // Origin office ID
  toOrganizationId: number; // Destination office ID
  totalItems: number; // Total number of items
  totalWeight: number; // Total weight (kg)
  status: ManifestStatus; // Manifest status
  sealNumber?: string; // Seal number for security
  vehicleNumber?: string; // Transport vehicle number
  driverName?: string; // Driver name
  driverPhone?: string; // Driver phone
  notes?: string; // Additional notes
  sealedAt?: Date; // When sealed
  sealedBy?: number; // User who sealed
  receivedAt?: Date; // When received
  receivedBy?: number; // User who received
  createdBy: number; // User who created
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
