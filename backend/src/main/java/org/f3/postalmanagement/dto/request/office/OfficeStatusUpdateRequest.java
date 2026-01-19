package org.f3.postalmanagement.dto.request.office;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class OfficeStatusUpdateRequest {

    @Schema(description = "Is accepting orders manually")
    private Boolean isAcceptingOrders;

    @Schema(description = "Working hours in HH:mm-HH:mm format", example = "07:00-17:00")
    @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
            message = "Working hours must be in HH:mm-HH:mm format")
    private String workingHours;
}
