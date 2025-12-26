/**
 * Manifest Item Interface
 * Individual order within a manifest
 */
export interface ManifestItem {
  id: number;
  manifestId: number; // Reference to manifest
  orderId: number; // Reference to order
  sequence: number; // Item sequence in manifest
  noted: boolean; // Whether item was noted in manifest
  createdAt: Date; // Creation timestamp
}
