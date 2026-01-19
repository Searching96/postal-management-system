package org.f3.postalmanagement.entity.unit;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.entity.administrative.Province;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a consolidation route from multiple ward offices to a province warehouse.
 * Multiple routes per province can exist for load distribution.
 *
 * Example: Province X
 * - ConsolidationRoute 1: Wards [A, B, C] → Province Warehouse
 * - ConsolidationRoute 2: Wards [D, E, F] → Province Warehouse
 *
 * Each ward is FIXED to one consolidation route (no dynamic assignment).
 */
@Entity
@Table(name = "consolidation_routes", indexes = {
    @Index(name = "idx_consolidation_province", columnList = "province_code"),
    @Index(name = "idx_consolidation_active", columnList = "is_active")
})
@Getter
@Setter
@SQLDelete(sql = "UPDATE consolidation_routes SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class ConsolidationRoute extends BaseEntity {

    /**
     * Friendly name for the route.
     * Example: "Tuyến tập kết 1 - TP Hồ Chí Minh"
     */
    @Column(name = "name", nullable = false)
    private String name;

    /**
     * Province this route serves.
     * All wards in the route_sequence must belong to this province.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_code", nullable = false)
    private Province province;

    /**
     * Final destination: the province warehouse where orders consolidate.
     * Must be of type PROVINCE_WAREHOUSE.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_warehouse_id", nullable = false)
    private Office destinationWarehouse;

    /**
     * JSON array of route stops in order.
     * Format: [{"wardCode":"D1001", "wardOfficeName":"Ward 1 Office", "order":1}, ...]
     * Orders flow: Ward1 → Ward2 → ... → Province Warehouse
     */
    @Column(name = "route_sequence", columnDefinition = "JSON", nullable = false)
    private String routeSequence;

    /**
     * Maximum weight capacity in kg for orders on this route.
     */
    @Column(name = "max_weight_kg", precision = 10, scale = 2)
    private BigDecimal maxWeightKg;

    /**
     * Maximum volume capacity in cubic cm for orders on this route.
     */
    @Column(name = "max_volume_cm3", precision = 15, scale = 2)
    private BigDecimal maxVolumeCm3;

    /**
     * Maximum number of orders this route can consolidate in one cycle.
     */
    @Column(name = "max_orders")
    private Integer maxOrders;

    /**
     * Whether this route is currently active.
     * Inactive routes do not accept new orders.
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /**
     * Metrics: Total orders consolidated through this route (cumulative).
     */
    @Column(name = "total_consolidated_orders")
    private Integer totalConsolidatedOrders = 0;

    /**
     * Metrics: Last consolidation timestamp.
     */
    @Column(name = "last_consolidation_at")
    private LocalDateTime lastConsolidationAt;

    /**
     * Helper: Get list of ward codes in this route.
     * Parses route_sequence JSON to extract ward codes.
     */
    public List<String> getWardCodes() {
        List<String> wardCodes = new ArrayList<>();
        try {
            if (routeSequence != null && !routeSequence.isEmpty()) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(routeSequence);

                if (root.isArray()) {
                    for (JsonNode stop : root) {
                        String wardCode = stop.get("wardCode").asText();
                        if (wardCode != null && !wardCode.isEmpty()) {
                            wardCodes.add(wardCode);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Log parsing error silently to avoid cascading failures
        }
        return wardCodes;
    }

    /**
     * Check if a ward is part of this route.
     */
    public boolean containsWard(String wardCode) {
        return getWardCodes().contains(wardCode);
    }

    /**
     * Container for route stop information.
     */
    @Data
    @AllArgsConstructor
    public static class RouteStop {
        @JsonProperty("wardCode")
        private String wardCode;

        @JsonProperty("wardOfficeName")
        private String wardOfficeName;

        @JsonProperty("order")
        private int order;

        @JsonProperty("distanceKm")
        private Integer distanceKm;
    }
}
