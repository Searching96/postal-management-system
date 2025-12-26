import { AuditAction } from "./enums";

/**
 * Audit Log Interface
 * System audit trail for all important actions
 */
export interface AuditLog {
  id: number;
  userId?: number; // User who performed action
  action: AuditAction; // Action type
  entity: string; // Entity name (e.g., 'Order', 'User')
  entityId?: number; // Entity ID
  oldValue?: string; // Old value (JSON string)
  newValue?: string; // New value (JSON string)
  ipAddress?: string; // IP address
  userAgent?: string; // Browser user agent
  createdAt: Date; // Action timestamp
}
