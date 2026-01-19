package org.f3.postalmanagement.enums;

/**
 * VehicleType enum for demo routing flows.
 * Used to categorize vehicle types for each route segment in logistics demos.
 */
public enum VehicleType {
    COLLECTION_TRUCK,      // Xe tập kết: Ward → Ward, Ward → Province
    MEDIUM_TRANSFER_TRUCK, // Xe trung chuyển vừa: Province → Hub
    LARGE_TRANSFER_TRUCK   // Xe trung chuyển lớn: Hub → Hub (inter-region)
}
