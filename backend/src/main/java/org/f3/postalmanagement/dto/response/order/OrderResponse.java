package org.f3.postalmanagement.dto.response.order;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.f3.postalmanagement.enums.OrderStatus;
import org.f3.postalmanagement.enums.PackageType;
import org.f3.postalmanagement.enums.ServiceType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for order details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Order details response")
public class OrderResponse {

    @Schema(description = "Order ID")
    private UUID orderId;

    @Schema(description = "Tracking number for public tracking", example = "VN123456789VN")
    private String trackingNumber;

    // ==================== SENDER INFO ====================

    @Schema(description = "Sender customer ID (if registered)")
    private UUID senderCustomerId;

    @Schema(description = "Sender name", example = "Nguyen Van A")
    private String senderName;

    @Schema(description = "Sender phone", example = "0901234567")
    private String senderPhone;

    @Schema(description = "Sender address")
    private String senderAddress;

    // ==================== RECEIVER INFO ====================

    @Schema(description = "Receiver name", example = "Tran Thi B")
    private String receiverName;

    @Schema(description = "Receiver phone", example = "0912345678")
    private String receiverPhone;

    @Schema(description = "Receiver address")
    private String receiverAddress;

    @Schema(description = "Destination ward name")
    private String destinationWardName;

    @Schema(description = "Destination province name")
    private String destinationProvinceName;

    // ==================== PACKAGE INFO ====================

    @Schema(description = "Package type", example = "BOX")
    private PackageType packageType;

    @Schema(description = "Package description")
    private String packageDescription;

    @Schema(description = "Actual weight in kg", example = "2.5")
    private BigDecimal weightKg;

    @Schema(description = "Chargeable weight in kg", example = "2.5")
    private BigDecimal chargeableWeightKg;

    @Schema(description = "Dimensions (L x W x H cm)", example = "30 x 20 x 15")
    private String dimensions;

    // ==================== SERVICE & PRICING ====================

    @Schema(description = "Service type", example = "STANDARD")
    private ServiceType serviceType;

    @Schema(description = "Shipping fee", example = "65000")
    private BigDecimal shippingFee;

    @Schema(description = "COD amount", example = "500000")
    private BigDecimal codAmount;

    @Schema(description = "Insurance fee", example = "50000")
    private BigDecimal insuranceFee;

    @Schema(description = "Total amount", example = "115000")
    private BigDecimal totalAmount;

    // ==================== STATUS & TIMING ====================

    @Schema(description = "Current status", example = "CREATED")
    private OrderStatus status;

    @Schema(description = "Status description", example = "Order created at post office")
    private String statusDescription;

    @Schema(description = "Estimated delivery date")
    private LocalDateTime estimatedDeliveryDate;

    @Schema(description = "Actual delivery date (if delivered)")
    private LocalDateTime actualDeliveryDate;

    // ==================== LOCATION ====================

    @Schema(description = "Origin office name")
    private String originOfficeName;

    @Schema(description = "Current location/office name")
    private String currentOfficeName;

    @Schema(description = "Destination office name")
    private String destinationOfficeName;

    // ==================== STAFF INFO ====================

    @Schema(description = "Staff who created the order")
    private String createdByEmployeeName;

    @Schema(description = "Assigned shipper name (if assigned)")
    private String assignedShipperName;

    // ==================== TIMESTAMPS ====================

    @Schema(description = "Order creation time")
    private LocalDateTime createdAt;

    @Schema(description = "Last update time")
    private LocalDateTime updatedAt;

    // ==================== NOTES ====================

    @Schema(description = "Delivery instructions")
    private String deliveryInstructions;

    // ==================== TRACKING HISTORY ====================

    @Schema(description = "Status history for tracking")
    private List<StatusHistoryItem> statusHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Status history item")
    public static class StatusHistoryItem {
        @Schema(description = "Status at this point", example = "CREATED")
        private OrderStatus status;

        @Schema(description = "Status description", example = "Order created at post office")
        private String description;

        @Schema(description = "Location/office name")
        private String location;

        @Schema(description = "Timestamp")
        private LocalDateTime timestamp;
    }
}
