package org.f3.postalmanagement.dto.response.order;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.f3.postalmanagement.enums.ServiceType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for price calculation.
 * Shows customer the price breakdown and estimated delivery time.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Price calculation result with SLA information")
public class PriceCalculationResponse {

    // ==================== WEIGHT CALCULATION ====================

    @Schema(description = "Actual weight in kg", example = "2.5")
    private BigDecimal actualWeightKg;

    @Schema(description = "Volumetric weight in kg (L x W x H / 5000)", example = "1.8")
    private BigDecimal volumetricWeightKg;

    @Schema(description = "Chargeable weight (max of actual and volumetric)", example = "2.5")
    private BigDecimal chargeableWeightKg;

    // ==================== ROUTING INFO ====================

    @Schema(description = "Origin province name", example = "Ho Chi Minh")
    private String originProvinceName;

    @Schema(description = "Destination province name", example = "Ha Noi")
    private String destinationProvinceName;

    @Schema(description = "Destination ward name", example = "Phuong Hoan Kiem")
    private String destinationWardName;

    @Schema(description = "Whether this is same-province delivery", example = "false")
    private boolean sameProvince;

    @Schema(description = "Whether this is same-region delivery", example = "false")
    private boolean sameRegion;

    // ==================== PRICING BREAKDOWN ====================

    @Schema(description = "Base shipping fee", example = "35000")
    private BigDecimal baseShippingFee;

    @Schema(description = "Weight surcharge (for heavy packages)", example = "10000")
    private BigDecimal weightSurcharge;

    @Schema(description = "Package type surcharge (fragile, valuable, etc.)", example = "5000")
    private BigDecimal packageTypeSurcharge;

    @Schema(description = "Distance surcharge (inter-province, inter-region)", example = "15000")
    private BigDecimal distanceSurcharge;

    @Schema(description = "Subscription discount (for MONTHLY/ANNUALLY customers)", example = "5000")
    private BigDecimal subscriptionDiscount;

    @Schema(description = "Total shipping fee", example = "65000")
    private BigDecimal shippingFee;

    @Schema(description = "Insurance fee (if applicable)", example = "50000")
    private BigDecimal insuranceFee;

    @Schema(description = "Total amount to pay", example = "115000")
    private BigDecimal totalAmount;

    // ==================== SLA INFORMATION ====================

    @Schema(description = "Selected service type", example = "STANDARD")
    private ServiceType serviceType;

    @Schema(description = "Estimated delivery days", example = "3")
    private int estimatedDeliveryDays;

    @Schema(description = "Estimated delivery date", example = "2026-01-19T18:00:00")
    private LocalDateTime estimatedDeliveryDate;

    @Schema(description = "SLA description", example = "2-3 business days")
    private String slaDescription;

    // ==================== ALL SERVICE OPTIONS ====================

    @Schema(description = "All available service options with prices")
    private List<ServiceOption> availableServices;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Service option with price and SLA")
    public static class ServiceOption {
        @Schema(description = "Service type", example = "EXPRESS")
        private ServiceType serviceType;

        @Schema(description = "Service name", example = "Express Delivery")
        private String serviceName;

        @Schema(description = "Shipping fee for this service", example = "150000")
        private BigDecimal shippingFee;

        @Schema(description = "Total amount including insurance", example = "200000")
        private BigDecimal totalAmount;

        @Schema(description = "Estimated delivery days", example = "1")
        private int estimatedDeliveryDays;

        @Schema(description = "Estimated delivery date", example = "2026-01-17T18:00:00")
        private LocalDateTime estimatedDeliveryDate;

        @Schema(description = "SLA description", example = "Next day delivery")
        private String slaDescription;
    }
}
