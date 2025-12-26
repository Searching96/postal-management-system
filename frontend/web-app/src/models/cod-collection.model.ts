/**
 * COD Collection Interface
 * Records cash collected by courier
 */
export interface CodCollection {
  id: number;
  orderId: number; // Reference to order
  courierId: number; // Courier who collected
  amount: number; // Amount collected (VND)
  collectedAt: Date; // Collection timestamp
  reconciled: boolean; // Whether reconciled
  reconciledAt?: Date; // Reconciliation timestamp
  notes?: string; // Additional notes
  createdAt: Date; // Record creation timestamp
}
