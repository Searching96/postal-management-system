package org.f3.postalmanagement.dto.response.order;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response for operations on a group of orders")
public class GroupOrderResponse {

    @Schema(description = "Number of orders successfully processed")
    private int successCount;

    @Schema(description = "Number of orders that failed to process")
    private int failureCount;

    @Schema(description = "Summary message of the operation")
    private String message;

    @Schema(description = "List of orders that were successfully processed")
    private List<OrderResponse> orders;
}
