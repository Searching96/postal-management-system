package org.f3.postalmanagement.enums;

/**
 * Type of transfer route in the consolidation hierarchy.
 */
public enum RouteType {
    /**
     * Province warehouse → HUB
     * First level of consolidation routing.
     */
    PROVINCE_TO_HUB,

    /**
     * HUB → HUB
     * Inter-hub routing (existing implementation).
     */
    HUB_TO_HUB
}
