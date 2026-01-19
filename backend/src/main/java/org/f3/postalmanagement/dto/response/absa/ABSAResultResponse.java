package org.f3.postalmanagement.dto.response.absa;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for ABSA analysis result response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "ABSA analysis result")
public class ABSAResultResponse {

    @Schema(description = "Order comment ID")
    private UUID orderCommentId;

    @Schema(description = "Analysis status: success/error")
    private String status;

    @Schema(description = "Sentiment aspects: time, staff, quality, price", 
            example = "{\"time\": \"positive\", \"staff\": \"neutral\", \"quality\": \"positive\", \"price\": \"not_mentioned\"}")
    private Map<String, String> aspects;

    @Schema(description = "Analysis timestamp")
    private LocalDateTime timestamp;

    @Schema(description = "Error message if analysis failed")
    private String errorMessage;
}
