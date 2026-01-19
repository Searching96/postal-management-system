package org.f3.postalmanagement.dto.request.absa;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for sending comment to ABSA analysis.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to analyze comment sentiment")
public class ABSAAnalysisRequest {

    @Schema(description = "Order comment ID")
    @NotNull(message = "Order comment ID is required")
    private UUID id;

    @Schema(description = "Comment text to analyze")
    @NotBlank(message = "Comment text is required")
    private String commentText;

    @Schema(description = "Callback URL to receive analysis result")
    private String callbackUrl;
}
