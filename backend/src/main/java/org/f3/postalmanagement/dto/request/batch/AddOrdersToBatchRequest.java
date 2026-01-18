package org.f3.postalmanagement.dto.request.batch;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Request to add orders to a batch manually.
 */
@Data
public class AddOrdersToBatchRequest {
    
    /**
     * The batch to add orders to
     */
    @NotNull(message = "Batch ID is required")
    private UUID batchId;

    /**
     * List of order IDs to add to the batch
     */
    @NotEmpty(message = "At least one order ID is required")
    private List<UUID> orderIds;
}
