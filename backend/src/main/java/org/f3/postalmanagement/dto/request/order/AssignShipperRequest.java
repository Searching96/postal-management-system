package org.f3.postalmanagement.dto.request.order;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for staff to assign a shipper to pick up an order.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to assign a shipper to an order for pickup")
public class AssignShipperRequest {

    @NotNull(message = "Order ID is required")
    @Schema(description = "ID of the order to assign")
    private UUID orderId;

    @NotNull(message = "Shipper ID is required")
    @Schema(description = "ID of the shipper to assign")
    private UUID shipperId;

    @Schema(description = "Additional notes for the shipper")
    private String notes;
}
