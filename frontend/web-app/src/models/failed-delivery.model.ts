import { FailedDeliveryReason } from "./enums";

/**
 * Failed Delivery Attempt Interface
 * Records failed delivery attempts
 */
export interface FailedDeliveryAttempt {
  id: number;
  orderId: number; // Reference to order
  courierId: number; // Courier who attempted delivery
  attemptNumber: number; // Attempt number (1, 2, 3...)
  reason: FailedDeliveryReason; // Reason for failure
  reasonDetail?: string; // Detailed explanation
  photoUrl?: string; // Photo evidence (optional)
  latitude?: number; // GPS latitude at attempt
  longitude?: number; // GPS longitude at attempt
  nextAttemptScheduled?: Date; // Next scheduled attempt
  notes?: string; // Additional notes
  attemptedAt: Date; // Attempt timestamp
  createdAt: Date; // Record creation timestamp
}
