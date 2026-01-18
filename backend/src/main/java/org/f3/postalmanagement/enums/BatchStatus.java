package org.f3.postalmanagement.enums;

/**
 * Status of a batch package throughout its lifecycle.
 */
public enum BatchStatus {
    /**
     * Batch is open and accepting more orders
     */
    OPEN,
    
    /**
     * Batch is being processed (adding orders)
     */
    PROCESSING,
    
    /**
     * Batch is sealed and ready for transit
     */
    SEALED,
    
    /**
     * Batch is in transit to destination
     */
    IN_TRANSIT,
    
    /**
     * Batch arrived at destination and is being unpacked
     */
    ARRIVED,
    
    /**
     * All orders in batch have been distributed
     */
    DISTRIBUTED,
    
    /**
     * Batch was cancelled
     */
    CANCELLED
}
