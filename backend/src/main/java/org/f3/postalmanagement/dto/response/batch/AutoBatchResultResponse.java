package org.f3.postalmanagement.dto.response.batch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Response from auto-batching operation.
 */
@Data
@Builder
@Schema(description = "Auto-batch operation result")
public class AutoBatchResultResponse {

    @Schema(description = "Total number of orders processed")
    private int totalOrdersProcessed;

    @Schema(description = "Number of orders successfully added to batches")
    private int ordersAddedToBatches;

    @Schema(description = "Number of orders that couldn't be batched (too heavy, etc.)")
    private int ordersSkipped;

    @Schema(description = "Number of existing batches used")
    private int existingBatchesUsed;

    @Schema(description = "Number of new batches created")
    private int newBatchesCreated;

    @Schema(description = "List of batches that were updated or created")
    private List<BatchSummary> batches;

    @Schema(description = "List of order IDs that were skipped")
    private List<UUID> skippedOrderIds;

    @Schema(description = "Reason for skipped orders")
    private List<String> skipReasons;

    @Data
    @Builder
    public static class BatchSummary {
        private UUID id;
        private String batchCode;
        private String destinationOfficeName;
        private int orderCount;
        private boolean isNew;
    }
}
