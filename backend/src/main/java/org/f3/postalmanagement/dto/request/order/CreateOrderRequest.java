package org.f3.postalmanagement.dto.request.order;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.f3.postalmanagement.enums.PackageType;
import org.f3.postalmanagement.enums.ServiceType;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Request DTO for creating a new order at post office.
 * Supports both walk-in customers (no account) and registered customers.
 */
@Data
@Schema(description = "Request to create a new shipping order")
public class CreateOrderRequest {

    // ==================== SENDER INFORMATION ====================

    @Schema(description = "ID of registered customer (optional - leave null for walk-in customers)")
    private UUID senderCustomerId;

    @NotBlank(message = "Sender name is required")
    @Size(max = 255, message = "Sender name must not exceed 255 characters")
    @Schema(description = "Sender's full name", example = "Nguyen Van A")
    private String senderName;

    @NotBlank(message = "Sender phone is required")
    @Pattern(regexp = "^0\\d{9,10}$", message = "Invalid phone number format")
    @Schema(description = "Sender's phone number", example = "0901234567")
    private String senderPhone;

    @NotBlank(message = "Sender address line 1 is required")
    @Schema(description = "Sender's address line 1", example = "123 Nguyen Hue")
    private String senderAddressLine1;

    @NotBlank(message = "Sender ward code is required")
    @Schema(description = "Sender's ward code (Province is derivable from ward)", example = "00001")
    private String senderWardCode;

    // ==================== RECEIVER INFORMATION ====================

    @NotBlank(message = "Receiver name is required")
    @Size(max = 255, message = "Receiver name must not exceed 255 characters")
    @Schema(description = "Receiver's full name", example = "Tran Thi B")
    private String receiverName;

    @NotBlank(message = "Receiver phone is required")
    @Pattern(regexp = "^0\\d{9,10}$", message = "Invalid phone number format")
    @Schema(description = "Receiver's phone number", example = "0912345678")
    private String receiverPhone;

    @NotBlank(message = "Receiver address line 1 is required")
    @Schema(description = "Receiver's address line 1", example = "456 Tran Hung Dao")
    private String receiverAddressLine1;

    @NotBlank(message = "Receiver ward code is required")
    @Schema(description = "Receiver's ward code (Province is derivable from ward)", example = "00001")
    private String receiverWardCode;

    // ==================== PACKAGE INFORMATION ====================

    @NotNull(message = "Package type is required")
    @Schema(description = "Type of package", example = "BOX")
    private PackageType packageType;

    @Size(max = 500, message = "Package description must not exceed 500 characters")
    @Schema(description = "Description of package contents", example = "Electronics - Laptop")
    private String packageDescription;

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.01", message = "Weight must be at least 0.01 kg")
    @DecimalMax(value = "100.00", message = "Weight must not exceed 100 kg")
    @Schema(description = "Actual weight in kilograms", example = "2.5")
    private BigDecimal weightKg;

    @DecimalMin(value = "0.1", message = "Length must be at least 0.1 cm")
    @DecimalMax(value = "300.0", message = "Length must not exceed 300 cm")
    @Schema(description = "Length in centimeters", example = "30")
    private BigDecimal lengthCm;

    @DecimalMin(value = "0.1", message = "Width must be at least 0.1 cm")
    @DecimalMax(value = "300.0", message = "Width must not exceed 300 cm")
    @Schema(description = "Width in centimeters", example = "20")
    private BigDecimal widthCm;

    @DecimalMin(value = "0.1", message = "Height must be at least 0.1 cm")
    @DecimalMax(value = "300.0", message = "Height must not exceed 300 cm")
    @Schema(description = "Height in centimeters", example = "15")
    private BigDecimal heightCm;

    // ==================== SERVICE OPTIONS ====================

    @NotNull(message = "Service type is required")
    @Schema(description = "Shipping service type", example = "STANDARD")
    private ServiceType serviceType;

    @DecimalMin(value = "0.00", message = "COD amount cannot be negative")
    @Schema(description = "Cash on Delivery amount (0 if not COD)", example = "500000")
    private BigDecimal codAmount = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "Declared value cannot be negative")
    @Schema(description = "Declared value for insurance", example = "5000000")
    private BigDecimal declaredValue;

    @Schema(description = "Whether to add insurance based on declared value", example = "true")
    private boolean addInsurance = false;

    // ==================== ADDITIONAL OPTIONS ====================

    @Size(max = 500, message = "Delivery instructions must not exceed 500 characters")
    @Schema(description = "Special instructions for delivery", example = "Call before delivery")
    private String deliveryInstructions;

    @Size(max = 500, message = "Internal notes must not exceed 500 characters")
    @Schema(description = "Internal notes for staff")
    private String internalNotes;
}
