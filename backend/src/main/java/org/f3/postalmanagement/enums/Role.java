package org.f3.postalmanagement.enums;

public enum Role {
    // -- System
    SYSTEM_ADMIN,

    // -- Hub
    HUB_MANAGER,

    // Warehouse
    BRANCH_MANAGER, // Province
    WAREHOUSE_MANAGER, // Ware
    WAREHOUSE_STAFF, // Staff of the warehouse

    // Post office
    PROVINCE_POST_MANAGER, // Province
    POST_OFFICE_MANAGER, // Post office
    POST_OFFICE_STAFF, // Staff of the post office

    //
    SHIPPER,
    CUSTOMER
}
