package org.f3.postalmanagement.enums;

public enum Role {
    // -- System
    SYSTEM_ADMIN,

    // Hub
    HUB_ADMIN,

    // Warehouse (WH)
    WH_PROVINCE_ADMIN,  // (Quản lý kho cấp tỉnh)
    WH_MANAGER,         // (Quản lý từng kho)
    WH_STAFF,           // (Nhân viên kho)

    // Post Office (PO)
    PO_PROVINCE_ADMIN,  // (Quản lý bưu cục cấp tỉnh)
    PO_MANAGER,         // (Quản lý từng bưu cục)
    PO_STAFF,           // (Nhân viên bưu cục)

    // Others
    SHIPPER,
    CUSTOMER
}
