package org.f3.postalmanagement.dto.request.order;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.f3.postalmanagement.enums.PackageType;
import org.f3.postalmanagement.enums.ServiceType;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Request DTO for calculating price before creating an order.
 * Used by both staff (at post office) and customers (online).
 */
@Data
@Schema(description = "Request to calculate shipping price and SLA")
public class CalculatePriceRequest {

    @Schema(description = "Origin office ID (required for online customers, optional for staff - defaults to their office)")
    private UUID originOfficeId;
    
    @Schema(description = "Sender ward code (optional - helps find nearest office/hub)")
    private String senderWardCode;

    @NotBlank(message = "Destination ward code is required")
    @Schema(description = "Ward code of destination", example = "00001")
    private String destinationWardCode;

    @NotNull(message = "Package type is required")
    @Schema(description = "Type of package", example = "BOX")
    private PackageType packageType;

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

    @NotNull(message = "Service type is required")
    @Schema(description = "Shipping service type", example = "STANDARD")
    private ServiceType serviceType;

    @DecimalMin(value = "0.00", message = "Declared value cannot be negative")
    @Schema(description = "Declared value for insurance calculation", example = "5000000")
    private BigDecimal declaredValue;

    @Schema(description = "Whether to add insurance", example = "true")
    private boolean addInsurance = false;
}
