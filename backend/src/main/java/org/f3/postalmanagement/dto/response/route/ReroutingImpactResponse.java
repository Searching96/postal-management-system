package org.f3.postalmanagement.dto.response.route;

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
public class ReroutingImpactResponse {

    private UUID routeId;
    private String routeDescription;
    private int affectedBatchCount;
    private int affectedOrderCount;
    private boolean hasAlternativeRoute;
    private String alternativeRouteDescription;
    private Integer additionalHours;

    private List<AffectedBatchSummary> affectedBatches;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AffectedBatchSummary {
        private UUID batchId;
        private String batchCode;
        private String status;
        private int orderCount;
        private String currentLocation;
        private String destination;
        private boolean canReroute;
    }
}
