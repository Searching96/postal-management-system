package org.f3.postalmanagement.enums;

public enum NotificationType {
    NEW_PICKUP_ORDER,      // New online order requires pickup
    ORDER_ASSIGNED,        // Shipper assigned to an order
    ORDER_PICKED_UP,       // Package picked up from customer
    ORDER_STATUS_CHANGED,  // General status change notification
    ORDER_DELIVERED,       // Package delivered successfully
    DELIVERY_FAILED,       // Delivery attempt failed
    NEW_STAFF_ADDED,       // New staff added to office
    SHIPPER_ASSIGNED,      // Shipper assigned to delivery task
    SYSTEM_ALERT           // System-level alerts
}
