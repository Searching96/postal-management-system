package org.f3.postalmanagement.dto.request.order;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
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
@Schema(description = "Request to acknowledge receipt of multiple incoming orders at an office")
public class ReceiveIncomingRequest {

    @NotEmpty(message = "Order IDs list cannot be empty")
    @Schema(description = "List of order IDs to acknowledge receipt for")
    private List<UUID> orderIds;
}
