/**
 * Proof of Delivery Interface
 * Records delivery confirmation with signature/photo
 */
export interface ProofOfDelivery {
  id: number;
  orderId: number; // Reference to order
  courierId: number; // Courier who delivered
  receiverName: string; // Name of person who received
  receiverRelation?: string; // Relation to original receiver
  signatureUrl?: string; // URL to signature image
  photoUrl?: string; // URL to delivery photo
  latitude?: number; // GPS latitude at delivery
  longitude?: number; // GPS longitude at delivery
  notes?: string; // Additional notes
  deliveredAt: Date; // Actual delivery timestamp
  createdAt: Date; // Record creation timestamp
}
