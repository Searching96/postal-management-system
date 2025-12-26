import { ReconciliationStatus } from "./enums";

/**
 * COD Reconciliation Interface
 * Manages COD reconciliation batches
 */
export interface CodReconciliation {
  id: number;
  code: string; // Reconciliation code (e.g., 'RC20250126001')
  courierId: number; // Courier being reconciled
  accountantId?: number; // Accountant handling reconciliation
  periodFrom: Date; // Period start date
  periodTo: Date; // Period end date
  totalOrders: number; // Total number of COD orders
  expectedAmount: number; // Expected total amount (VND)
  actualAmount: number; // Actual amount submitted (VND)
  variance: number; // Difference (VND)
  status: ReconciliationStatus; // Reconciliation status
  notes?: string; // Additional notes
  submittedAt?: Date; // When courier submitted
  verifiedAt?: Date; // When accountant verified
  paidAt?: Date; // When paid to customer
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
