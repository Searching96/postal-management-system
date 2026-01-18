package org.f3.postalmanagement.enums;

/**
 * Types of packages that can be shipped.
 */
public enum PackageType {
    DOCUMENT,       // Papers, documents, letters
    BOX,            // Standard box packages
    FRAGILE,        // Fragile items requiring special handling
    ELECTRONICS,    // Electronic devices
    CLOTHING,       // Clothes and textiles
    FOOD,           // Food items (non-perishable)
    PERISHABLE,     // Perishable items requiring fast delivery
    VALUABLE,       // High-value items requiring insurance
    OVERSIZED,      // Large/heavy items
    OTHER           // Other types
}
