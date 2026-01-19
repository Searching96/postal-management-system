package org.f3.postalmanagement.dto.response.route;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.f3.postalmanagement.enums.DisruptionType;
import org.f3.postalmanagement.enums.RouteType;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferRouteResponse {

    private UUID id;
    private String fromHubName;
    private UUID fromHubId;
    private String fromRegionName;
    private String toHubName;
    private UUID toHubId;
    private String toRegionName;
    private Integer distanceKm;
    private Integer transitHours;
    private Integer priority;
    private Boolean isActive;
    private RouteType routeType;

    // Disruption info (if currently disabled)
    private DisruptionInfo activeDisruption;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DisruptionInfo {
        private UUID disruptionId;
        private DisruptionType type;
        private String reason;
        private LocalDateTime startTime;
        private LocalDateTime expectedEndTime;
        private Integer affectedBatchCount;
        private Integer affectedOrderCount;
    }
}
