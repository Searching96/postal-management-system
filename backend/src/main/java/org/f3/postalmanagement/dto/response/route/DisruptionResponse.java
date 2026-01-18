package org.f3.postalmanagement.dto.response.route;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.f3.postalmanagement.enums.DisruptionType;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisruptionResponse {

    private UUID id;
    private UUID routeId;
    private String routeDescription;
    private DisruptionType disruptionType;
    private String reason;
    private LocalDateTime startTime;
    private LocalDateTime expectedEndTime;
    private LocalDateTime actualEndTime;
    private Boolean isActive;
    private Integer affectedBatchCount;
    private Integer affectedOrderCount;
    private String createdBy;
    private LocalDateTime createdAt;
}
