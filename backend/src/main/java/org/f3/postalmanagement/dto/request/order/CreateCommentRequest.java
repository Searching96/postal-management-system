package org.f3.postalmanagement.dto.request.order;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a comment on an order.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to add a comment to an order")
public class CreateCommentRequest {

    @NotBlank(message = "Comment text is required")
    @Size(min = 1, max = 2000, message = "Comment must be between 1 and 2000 characters")
    @Schema(description = "Comment text content", example = "Customer requested to change delivery address")
    private String commentText;

    @Schema(description = "Whether this comment is internal (visible only to staff)", example = "false")
    private Boolean isInternal;
}
