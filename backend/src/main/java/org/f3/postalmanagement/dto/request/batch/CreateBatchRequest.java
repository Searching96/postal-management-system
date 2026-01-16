package org.f3.postalmanagement.dto.request.batch;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Request to create a new batch package manually.
 */
@Data
public class CreateBatchRequest {
    
    /**
     * Destination office for the batch (all orders in this batch go here)
     */
    @NotNull(message = "Destination office ID is required")
    private UUID destinationOfficeId;

    /**
     * Maximum weight capacity in kg
     */
    @NotNull(message = "Maximum weight is required")
    @DecimalMin(value = "0.1", message = "Maximum weight must be at least 0.1 kg")
    private BigDecimal maxWeightKg;

    /**
     * Maximum volume capacity in cubic cm (optional)
     */
    @DecimalMin(value = "1", message = "Maximum volume must be positive")
    private BigDecimal maxVolumeCm3;

    /**
     * Maximum number of orders (optional)
     */
    @Min(value = 1, message = "Maximum order count must be at least 1")
    private Integer maxOrderCount;

    /**
     * Optional notes
     */
    private String notes;
}
