package org.f3.postalmanagement.dto.request.office;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Schema(description = "Request to assign wards to a ward office pair (WARD_WAREHOUSE + WARD_POST)")
public class AssignWardsRequest {

    @NotNull(message = "Office pair ID is required")
    @Schema(
            description = "ID of the office pair (from office_pairs table)",
            example = "550e8400-e29b-41d4-a716-446655440000",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private UUID officePairId;

    @NotEmpty(message = "At least one ward code is required")
    @Schema(
            description = "List of ward codes to assign to this office pair",
            example = "[\"26734\", \"26735\", \"26736\"]",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private List<String> wardCodes;
}
