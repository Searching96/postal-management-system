package org.f3.postalmanagement.entity.unit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * Represents a transfer route in the hierarchy.
 * Can be:
 * 1. PROVINCE_TO_HUB: From province warehouse to hub (new)
 * 2. HUB_TO_HUB: Between hubs (existing)
 *
 * Example:
 * - PROVINCE_TO_HUB: DA NANG Warehouse → DA NANG HUB
 * - HUB_TO_HUB: DA NANG HUB → HO CHI MINH HUB
 */
@Entity
@Table(name = "transfer_routes", indexes = {
    @Index(name = "idx_transfer_from_to", columnList = "from_hub_id, to_hub_id"),
    @Index(name = "idx_transfer_type", columnList = "route_type"),
    @Index(name = "idx_transfer_province", columnList = "province_warehouse_id")
})
@Getter
@Setter
@SQLDelete(sql = "UPDATE transfer_routes SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class TransferRoute extends BaseEntity {

    /**
     * Type of route: PROVINCE_TO_HUB or HUB_TO_HUB
     * Default: HUB_TO_HUB for backward compatibility
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "route_type", nullable = false)
    private org.f3.postalmanagement.enums.RouteType routeType = org.f3.postalmanagement.enums.RouteType.HUB_TO_HUB;

    /**
     * Source hub/warehouse for this route segment.
     * For PROVINCE_TO_HUB: PROVINCE_WAREHOUSE office
     * For HUB_TO_HUB: HUB office
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_hub_id", nullable = false)
    private Office fromHub;

    /**
     * Destination hub for this route segment.
     * Must be an office with OfficeType.HUB
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_hub_id", nullable = false)
    private Office toHub;

    /**
     * For PROVINCE_TO_HUB routes: the province warehouse this route serves.
     * For HUB_TO_HUB routes: null
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_warehouse_id")
    private Office provinceWarehouse;

    /**
     * Distance between hubs/warehouses in kilometers (optional, for optimization).
     */
    @Column(name = "distance_km")
    private Integer distanceKm;

    /**
     * Estimated transit time in hours.
     */
    @Column(name = "transit_hours")
    private Integer transitHours;

    /**
     * Priority/order for route selection (lower = preferred).
     */
    @Column(name = "priority")
    private Integer priority = 1;

    /**
     * Whether this route is currently active.
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /**
     * Helper: Check if this is a province-to-hub route.
     */
    public boolean isProvinceToHubRoute() {
        return routeType == org.f3.postalmanagement.enums.RouteType.PROVINCE_TO_HUB;
    }

    /**
     * Helper: Check if this is a hub-to-hub route.
     */
    public boolean isHubToHubRoute() {
        return routeType == org.f3.postalmanagement.enums.RouteType.HUB_TO_HUB;
    }
}
