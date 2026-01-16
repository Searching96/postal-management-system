package org.f3.postalmanagement.enums;

/**
 * Status of an order throughout its lifecycle.
 */
public enum OrderStatus {
    // Creation phase
    CREATED,                    // Order created at post office
    
    // Pickup/First-mile phase
    PENDING_PICKUP,             // Waiting for pickup (for home pickup orders)
    PICKED_UP,                  // Picked up from customer
    
    // Processing at origin
    AT_ORIGIN_OFFICE,           // At origin post office/warehouse
    SORTED_AT_ORIGIN,           // Sorted and ready for transit
    
    // Transit phase
    IN_TRANSIT_TO_HUB,          // On the way to regional hub
    AT_HUB,                     // At regional hub
    IN_TRANSIT_TO_DESTINATION,  // On the way to destination region
    AT_DESTINATION_HUB,         // At destination regional hub
    
    // Last-mile phase
    IN_TRANSIT_TO_OFFICE,       // On the way to destination office
    AT_DESTINATION_OFFICE,      // At destination post office
    OUT_FOR_DELIVERY,           // With shipper for delivery
    
    // Delivery outcomes
    DELIVERED,                  // Successfully delivered
    DELIVERY_FAILED,            // Delivery attempt failed
    
    // Return/Exception handling
    RETURNING,                  // Being returned to sender
    RETURNED,                   // Returned to sender
    
    // Special statuses
    ON_HOLD,                    // On hold (issue with package)
    LOST,                       // Package lost
    DAMAGED,                    // Package damaged
    CANCELLED                   // Order cancelled
}
