package org.f3.postalmanagement.dto.request.route;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.f3.postalmanagement.enums.DisruptionType;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisableRouteRequest {

    @NotNull(message = "Disruption type is required")
    private DisruptionType disruptionType;

    private String reason;

    private LocalDateTime expectedEndTime;
}
