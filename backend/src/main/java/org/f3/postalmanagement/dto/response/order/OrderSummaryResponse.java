package org.f3.postalmanagement.dto.response.order;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import org.f3.postalmanagement.enums.OrderStatus;
import org.f3.postalmanagement.enums.PackageType;
import org.f3.postalmanagement.enums.ServiceType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Summary response for an order (lighter than full OrderResponse).
 * Used in lists and batch order listings.
 */
@Data
@Builder
@Schema(description = "Order summary")
public class OrderSummaryResponse {

    @Schema(description = "Order ID")
    private UUID id;

    @Schema(description = "Tracking number", example = "VN123456789VN")
    private String trackingNumber;

    @Schema(description = "Current status")
    private OrderStatus status;

    @Schema(description = "Sender name")
    private String senderName;

    @Schema(description = "Receiver name")
    private String receiverName;

    @Schema(description = "Receiver address line 1")
    private String receiverAddressLine1;

    @Schema(description = "Package type")
    private PackageType packageType;

    @Schema(description = "Service type")
    private ServiceType serviceType;

    @Schema(description = "Chargeable weight in kg")
    private BigDecimal chargeableWeightKg;

    @Schema(description = "Package volume in cubic cm (L x W x H)")
    private BigDecimal volumeCm3;

    @Schema(description = "Total amount")
    private BigDecimal totalAmount;

    @Schema(description = "Order creation date")
    private LocalDateTime createdAt;

    @Schema(description = "Estimated delivery date")
    private LocalDateTime estimatedDeliveryDate;
}
