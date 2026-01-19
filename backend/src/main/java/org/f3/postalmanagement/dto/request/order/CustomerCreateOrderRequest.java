package org.f3.postalmanagement.dto.request.order;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.f3.postalmanagement.enums.PackageType;
import org.f3.postalmanagement.enums.ServiceType;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for registered customers to create pickup orders online.
 * The sender information is automatically retrieved from the customer's account.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request for creating a pickup order by a registered customer")
public class CustomerCreateOrderRequest {

    // ==================== ORIGIN OFFICE ====================

    @NotNull(message = "Origin office ID is required")
    @Schema(description = "ID of the post office that will handle the pickup")
    private UUID originOfficeId;

    // ==================== PICKUP ADDRESS ====================
    
    // ==================== PICKUP ADDRESS ====================
    
    @NotBlank(message = "Pickup address line 1 is required")
    @Schema(description = "Pickup address line 1")
    private String pickupAddressLine1;

    @NotBlank(message = "Pickup ward code is required")
    @Schema(description = "Pickup ward code")
    private String pickupWardCode;

    @NotBlank(message = "Pickup province code is required")
    @Schema(description = "Pickup province code")
    private String pickupProvinceCode;

    @Schema(description = "Additional pickup instructions for shipper")
    private String pickupInstructions;

    // ==================== RECEIVER INFORMATION ====================

    @NotBlank(message = "Receiver name is required")
    @Schema(description = "Full name of the receiver")
    private String receiverName;

    @NotBlank(message = "Receiver phone is required")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Invalid phone number format")
    @Schema(description = "Receiver's phone number", example = "0912345678")
    private String receiverPhone;

    @NotBlank(message = "Receiver address line 1 is required")
    @Schema(description = "Receiver address line 1")
    private String receiverAddressLine1;

    @NotBlank(message = "Receiver ward code (destination) is required")
    @Schema(description = "Receiver ward code")
    private String receiverWardCode;

    @NotBlank(message = "Receiver province code is required")
    @Schema(description = "Receiver province code")
    private String receiverProvinceCode;

    // ==================== PACKAGE INFORMATION ====================

    @NotNull(message = "Package type is required")
    @Schema(description = "Type of package for handling classification")
    private PackageType packageType;

    @Schema(description = "Description of package contents")
    private String packageDescription;

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    @Schema(description = "Actual weight in kilograms", example = "1.5")
    private BigDecimal weightKg;

    @PositiveOrZero(message = "Length must be non-negative")
    @Schema(description = "Length in centimeters", example = "30")
    private BigDecimal lengthCm;

    @PositiveOrZero(message = "Width must be non-negative")
    @Schema(description = "Width in centimeters", example = "20")
    private BigDecimal widthCm;

    @PositiveOrZero(message = "Height must be non-negative")
    @Schema(description = "Height in centimeters", example = "15")
    private BigDecimal heightCm;

    // ==================== SERVICE OPTIONS ====================

    @NotNull(message = "Service type is required")
    @Schema(description = "Delivery speed option", example = "STANDARD")
    private ServiceType serviceType;

    @PositiveOrZero(message = "COD amount must be non-negative")
    @Schema(description = "Cash on delivery amount (0 if not COD)", example = "0")
    private BigDecimal codAmount;

    @PositiveOrZero(message = "Declared value must be non-negative")
    @Schema(description = "Declared value of package contents for insurance purposes")
    private BigDecimal declaredValue;

    @Schema(description = "Whether to add insurance coverage")
    private boolean addInsurance;

    // ==================== DELIVERY INSTRUCTIONS ====================

    @Schema(description = "Special delivery instructions for the receiver")
    private String deliveryInstructions;

    // ==================== PREFERRED PICKUP TIME ====================

    @Schema(description = "Preferred pickup time window (morning/afternoon/evening)")
    private String preferredPickupTime;
}
