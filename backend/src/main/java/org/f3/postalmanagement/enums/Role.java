package org.f3.postalmanagement.enums;

public enum Role {
    // -- System
    SYSTEM_ADMIN,

    // Hub
    HUB_ADMIN,
    NATIONAL_MANAGER,   // Manages HUB-level routes (inter-hub network)

    // Warehouse (WH)
    WH_PROVINCE_ADMIN,  // (Quản lý kho cấp tỉnh)
    WH_WARD_MANAGER,    // (Quản lý cấp xã)
    WH_STAFF,           // (Nhân viên kho)

    // Post Office (PO)
    PO_PROVINCE_ADMIN,  // (Quản lý bưu cục cấp tỉnh)
    PO_WARD_MANAGER,    // (Quản lý bưu cục cấp xã)
    PO_STAFF,           // (Nhân viên bưu cục)

    // Others
    SHIPPER,
    CUSTOMER
}
