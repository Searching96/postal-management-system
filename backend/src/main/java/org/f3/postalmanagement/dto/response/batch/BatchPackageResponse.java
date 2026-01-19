package org.f3.postalmanagement.dto.response.batch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import org.f3.postalmanagement.dto.response.order.OrderSummaryResponse;
import org.f3.postalmanagement.enums.BatchStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response containing batch package details.
 */
@Data
@Builder
@Schema(description = "Batch package details")
public class BatchPackageResponse {

    @Schema(description = "Batch ID")
    private UUID id;

    @Schema(description = "Unique batch code", example = "BATCH-HN001-SGN001-20260116120000")
    private String batchCode;

    @Schema(description = "Current batch status")
    private BatchStatus status;

    // ==================== OFFICES ====================

    @Schema(description = "Origin office info")
    private OfficeInfo originOffice;

    @Schema(description = "Destination office info")
    private OfficeInfo destinationOffice;

    // ==================== CAPACITY ====================

    @Schema(description = "Maximum weight capacity in kg")
    private BigDecimal maxWeightKg;

    @Schema(description = "Maximum volume capacity in cubic cm")
    private BigDecimal maxVolumeCm3;

    @Schema(description = "Maximum number of orders")
    private Integer maxOrderCount;

    // ==================== CURRENT USAGE ====================

    @Schema(description = "Current weight in kg")
    private BigDecimal currentWeightKg;

    @Schema(description = "Current volume in cubic cm")
    private BigDecimal currentVolumeCm3;

    @Schema(description = "Current number of orders")
    private Integer currentOrderCount;

    @Schema(description = "Remaining weight capacity in kg")
    private BigDecimal remainingWeightKg;

    @Schema(description = "Weight fill percentage", example = "75.5")
    private Double weightFillPercentage;

    @Schema(description = "Order count fill percentage", example = "60.0")
    private Double orderCountFillPercentage;

    // ==================== TIMING ====================

    @Schema(description = "When the batch was created")
    private LocalDateTime createdAt;

    @Schema(description = "When the batch was sealed")
    private LocalDateTime sealedAt;

    @Schema(description = "When the batch departed")
    private LocalDateTime departedAt;

    @Schema(description = "When the batch arrived")
    private LocalDateTime arrivedAt;

    // ==================== STAFF ====================

    @Schema(description = "Staff who created the batch")
    private String createdByEmployeeName;

    @Schema(description = "Staff who sealed the batch")
    private String sealedByEmployeeName;

    // ==================== ORDERS ====================

    @Schema(description = "Summary of orders in this batch (optional, may not be included)")
    private List<OrderSummaryResponse> orders;

    @Schema(description = "Notes")
    private String notes;

    // ==================== NESTED CLASSES ====================

    @Data
    @Builder
    public static class OfficeInfo {
        private UUID id;
        private String name;
        private String addressLine1;
        private String province;
    }
}
