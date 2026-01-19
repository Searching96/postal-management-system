package org.f3.postalmanagement.dto.request.consolidation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Request to create a new consolidation route.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConsolidationRouteRequest {

    /**
     * Friendly name for the route.
     * Example: "Tuyến tập kết 1 - TP Hồ Chí Minh"
     */
    @NotBlank(message = "Route name is required")
    private String name;

    /**
     * Province code this route serves.
     * Example: "VN-01" for Ha Noi
     */
    @NotBlank(message = "Province code is required")
    private String provinceCode;

    /**
     * UUID of the province warehouse (destination).
     * Must be of type PROVINCE_WAREHOUSE.
     */
    @NotNull(message = "Destination warehouse ID is required")
    private UUID destinationWarehouseId;

    /**
     * List of wards in consolidation sequence.
     * Orders will consolidate: Ward1 → Ward2 → ... → Warehouse
     * Minimum 1 ward, maximum 10 wards per route.
     */
    @NotNull(message = "Route stops are required")
    private List<RouteStopRequest> routeStops;

    /**
     * Maximum weight capacity in kg.
     * Example: 500 kg per consolidation cycle
     */
    @Positive(message = "Max weight must be positive")
    private BigDecimal maxWeightKg;

    /**
     * Maximum volume capacity in cm³.
     * Optional - if null, volume not checked.
     */
    private BigDecimal maxVolumeCm3;

    /**
     * Maximum number of orders per consolidation cycle.
     * Example: 100 orders per cycle
     */
    @Positive(message = "Max orders must be positive")
    private Integer maxOrders;

    /**
     * Whether route should be active immediately.
     * Default: true
     */
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Container for individual route stop information.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteStopRequest {

        /**
         * Ward code. Example: "D1001"
         */
        @NotBlank(message = "Ward code is required")
        private String wardCode;

        /**
         * Display name of ward office.
         * Example: "Bưu Cục Quận 1"
         */
        @NotBlank(message = "Ward office name is required")
        private String wardOfficeName;

        /**
         * Order in sequence (1st, 2nd, 3rd stop, etc).
         * Determines consolidation order.
         */
        @Positive(message = "Order must be positive")
        private int order;

        /**
         * Approximate distance in km to next stop.
         * Optional for metrics.
         */
        private Integer distanceKm;
    }
}
