package org.f3.postalmanagement.dto.response.batch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Response showing destinations with pending orders to batch.
 */
@Data
@Builder
@Schema(description = "Destinations available for batching")
public class BatchableDestinationsResponse {

    @Schema(description = "Origin office ID")
    private UUID originOfficeId;

    @Schema(description = "List of destinations with unbatched orders")
    private List<DestinationInfo> destinations;

    @Data
    @Builder
    public static class DestinationInfo {
        @Schema(description = "Destination office ID")
        private UUID officeId;

        @Schema(description = "Destination office name")
        private String officeName;

        @Schema(description = "Destination province")
        private String province;

        @Schema(description = "Number of unbatched orders for this destination")
        private long unbatchedOrderCount;

        @Schema(description = "Total weight of unbatched orders in kg")
        private java.math.BigDecimal totalWeight;

        @Schema(description = "Number of existing open batches for this destination")
        private long openBatchCount;
    }
}
