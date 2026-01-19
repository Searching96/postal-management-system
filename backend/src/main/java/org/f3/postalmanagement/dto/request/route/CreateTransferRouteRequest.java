package org.f3.postalmanagement.dto.request.route;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.f3.postalmanagement.enums.RouteType;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransferRouteRequest {

    @NotNull(message = "Route type is required")
    private RouteType routeType;

    @NotNull(message = "From hub ID is required")
    private UUID fromHubId;

    @NotNull(message = "To hub ID is required")
    private UUID toHubId;

    private Integer distanceKm;

    private Integer transitHours;

    private Integer priority = 1;

    private Boolean isActive = true;

    /**
     * For PROVINCE_TO_HUB routes: the province warehouse ID
     * For HUB_TO_HUB routes: optional
     */
    private UUID provinceWarehouseId;
}
