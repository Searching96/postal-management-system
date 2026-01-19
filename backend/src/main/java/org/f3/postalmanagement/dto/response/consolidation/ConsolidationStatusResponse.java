package org.f3.postalmanagement.dto.response.consolidation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response showing current consolidation status for a route.
 * Used to check how many orders are waiting, etc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsolidationStatusResponse {

    /**
     * Route identifier.
     */
    private UUID routeId;

    /**
     * Route name.
     */
    private String routeName;

    /**
     * Number of orders currently waiting for consolidation.
     */
    private Integer pendingOrderCount;

    /**
     * Current total weight of pending orders (kg).
     */
    private BigDecimal pendingWeightKg;

    /**
     * Current total volume of pending orders (cm³).
     */
    private BigDecimal pendingVolumeCm3;

    /**
     * Can consolidation be triggered now?
     * True if: pending > min threshold OR time threshold exceeded
     */
    private Boolean canConsolidate;

    /**
     * Reason why consolidation cannot be triggered (if canConsolidate = false).
     * Examples: "Waiting for more orders", "Time threshold not met"
     */
    private String consolidationBlockReason;

    /**
     * When is the next scheduled consolidation?
     */
    private LocalDateTime nextConsolidationTime;

    /**
     * Last consolidation details.
     */
    private LastConsolidation lastConsolidation;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LastConsolidation {
        private LocalDateTime timestamp;
        private Integer ordersConsolidated;
        private BigDecimal totalWeightKg;
    }
}
