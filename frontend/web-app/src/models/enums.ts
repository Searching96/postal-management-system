/**
 * ENUMS - Mapped 1:1 from SQL ENUM fields
 * All enum values match exactly with database constraints
 */

// Organization Types (3-tier hierarchy)
export enum OrganizationType {
  HQ = "HQ", // Headquarters (Level 1)
  BRANCH = "BRANCH", // Branch/Hub (Level 2)
  POST_OFFICE = "POST_OFFICE", // Post Office (Level 3)
}

// User Roles
export enum UserRole {
  ADMIN = "ADMIN", // System Administrator
  MANAGER = "MANAGER", // Office Manager
  CLERK = "CLERK", // Transaction Clerk
  WAREHOUSE = "WAREHOUSE", // Warehouse Worker
  DISPATCHER = "DISPATCHER", // Route Dispatcher
  COURIER = "COURIER", // Delivery Driver
  ACCOUNTANT = "ACCOUNTANT", // Accountant
}

// Customer Types
export enum CustomerType {
  INDIVIDUAL = "INDIVIDUAL", // Individual/Small seller (5-50 orders/day)
  SME = "SME", // SME (50-500 orders/day)
  ENTERPRISE = "ENTERPRISE", // Enterprise (>500 orders/day)
}

// Order Status (Main workflow)
export enum OrderStatus {
  PENDING = "PENDING", // Order created, waiting for pickup
  PICKED_UP = "PICKED_UP", // Picked up from sender
  IN_TRANSIT = "IN_TRANSIT", // In transit between offices
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY", // Out for delivery to receiver
  DELIVERED = "DELIVERED", // Successfully delivered
  FAILED = "FAILED", // Delivery failed
  RETURNED = "RETURNED", // Returned to sender
  CANCELLED = "CANCELLED", // Order cancelled
}

// Delivery Route Status
export enum RouteStatus {
  PLANNED = "PLANNED", // Route is planned
  IN_PROGRESS = "IN_PROGRESS", // Route is in progress
  COMPLETED = "COMPLETED", // Route completed
  CANCELLED = "CANCELLED", // Route cancelled
}

// Failed Delivery Reason
export enum FailedDeliveryReason {
  RECEIVER_ABSENT = "RECEIVER_ABSENT", // No one at delivery address
  WRONG_ADDRESS = "WRONG_ADDRESS", // Incorrect address
  REFUSED_BY_RECEIVER = "REFUSED_BY_RECEIVER", // Receiver refused to accept
  DAMAGED_PACKAGE = "DAMAGED_PACKAGE", // Package is damaged
  OTHER = "OTHER", // Other reason
}

// COD Reconciliation Status
export enum ReconciliationStatus {
  PENDING = "PENDING", // Waiting for reconciliation
  VERIFIED = "VERIFIED", // Verified by accountant
  PAID = "PAID", // Paid to customer
  DISPUTED = "DISPUTED", // Has dispute
}

// Manifest Status
export enum ManifestStatus {
  DRAFT = "DRAFT", // Draft manifest
  SEALED = "SEALED", // Sealed for transfer
  IN_TRANSIT = "IN_TRANSIT", // In transit
  RECEIVED = "RECEIVED", // Received at destination
  DISCREPANCY = "DISCREPANCY", // Has discrepancy
}

// Complaint Status
export enum ComplaintStatus {
  OPEN = "OPEN", // Newly created
  IN_PROGRESS = "IN_PROGRESS", // Being handled
  RESOLVED = "RESOLVED", // Resolved
  CLOSED = "CLOSED", // Closed
  ESCALATED = "ESCALATED", // Escalated to higher level
}

// Complaint Priority
export enum ComplaintPriority {
  LOW = "LOW", // Low priority
  MEDIUM = "MEDIUM", // Medium priority
  HIGH = "HIGH", // High priority
  URGENT = "URGENT", // Urgent
}

// Complaint Type
export enum ComplaintType {
  DAMAGED = "DAMAGED", // Package damaged
  LOST = "LOST", // Package lost
  DELAY = "DELAY", // Delivery delayed
  MISSING_ITEM = "MISSING_ITEM", // Item missing
  WRONG_DELIVERY = "WRONG_DELIVERY", // Wrong delivery
  SERVICE = "SERVICE", // Service quality issue
  OTHER = "OTHER", // Other issue
}

// Audit Action Types
export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  STATUS_CHANGE = "STATUS_CHANGE",
}
