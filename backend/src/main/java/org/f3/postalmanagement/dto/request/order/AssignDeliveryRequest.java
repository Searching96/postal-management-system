package org.f3.postalmanagement.dto.request.order;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to assign multiple orders to a shipper for delivery")
public class AssignDeliveryRequest {

    @NotNull(message = "Shipper ID is required")
    @Schema(description = "ID of the shipper to assign", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID shipperId;

    @NotEmpty(message = "Order IDs list cannot be empty")
    @Schema(description = "List of order IDs to assign for delivery")
    private List<UUID> orderIds;
}
