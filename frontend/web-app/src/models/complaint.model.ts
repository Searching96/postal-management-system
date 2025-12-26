import { ComplaintStatus, ComplaintPriority, ComplaintType } from "./enums";

/**
 * Complaint Interface
 * Customer complaints and issues
 */
export interface Complaint {
  id: number;
  code: string; // Complaint code (e.g., 'CP20250126001')
  orderId?: number; // Related order ID (optional)
  customerId: number; // Customer who filed complaint
  type: ComplaintType; // Complaint type
  subject: string; // Complaint subject
  description: string; // Detailed description
  priority: ComplaintPriority; // Priority level
  status: ComplaintStatus; // Current status
  assignedTo?: number; // User assigned to handle
  resolution?: string; // Resolution notes
  compensationAmount?: number; // Compensation if any (VND)
  attachmentUrls?: string[]; // Photo/document URLs (stored as JSON)
  createdBy: number; // User who created
  resolvedAt?: Date; // When resolved
  resolvedBy?: number; // User who resolved
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
