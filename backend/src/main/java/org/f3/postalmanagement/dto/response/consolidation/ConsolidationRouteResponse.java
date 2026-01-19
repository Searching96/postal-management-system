package org.f3.postalmanagement.dto.response.consolidation;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response containing consolidation route details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsolidationRouteResponse {

    /**
     * Route unique identifier.
     */
    private UUID id;

    /**
     * Route name.
     */
    private String name;

    /**
     * Province served by this route.
     */
    private ProvinceInfo province;

    /**
     * Final destination warehouse.
     */
    private OfficeInfo destinationWarehouse;

    /**
     * Ordered list of stops on this route.
     */
    private List<RouteStop> routeStops;

    /**
     * Capacity limits.
     */
    private CapacityInfo capacity;

    /**
     * Route status and metrics.
     */
    private StatusInfo status;

    /**
     * Timestamps.
     */
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProvinceInfo {
        private String code;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OfficeInfo {
        private UUID id;
        private String name;
        private String code;
    }

    @Data
    @Builder
    @NoArgsConstructor
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

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CapacityInfo {
        private BigDecimal maxWeightKg;
        private BigDecimal maxVolumeCm3;
        private Integer maxOrders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusInfo {
        private Boolean isActive;
        private Integer totalConsolidatedOrders;
        private LocalDateTime lastConsolidationAt;
    }
}
