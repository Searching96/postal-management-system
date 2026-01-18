package org.f3.postalmanagement.dto.request.batch;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Request to auto-batch orders for a specific destination.
 * The system will optimize and group orders automatically.
 */
@Data
public class AutoBatchRequest {
    
    /**
     * Destination office to batch orders for.
     * If null, batch all destinations.
     */
    private UUID destinationOfficeId;

    /**
     * Maximum weight per batch container
     */
    @NotNull(message = "Maximum weight per batch is required")
    @DecimalMin(value = "0.1", message = "Maximum weight must be at least 0.1 kg")
    private BigDecimal maxWeightPerBatch = new BigDecimal("50.0");

    /**
     * Maximum volume per batch container (optional)
     */
    @DecimalMin(value = "1", message = "Maximum volume must be positive")
    private BigDecimal maxVolumePerBatch;

    /**
     * Maximum orders per batch (optional)
     */
    @Min(value = 1, message = "Maximum order count must be at least 1")
    private Integer maxOrdersPerBatch = 100;

    /**
     * Minimum orders required to create a batch
     */
    @Min(value = 1, message = "Minimum order count must be at least 1")
    private Integer minOrdersPerBatch = 1;

    /**
     * Whether to create new batches for remaining orders
     * that don't fit in existing batches
     */
    private boolean createNewBatches = true;
}
