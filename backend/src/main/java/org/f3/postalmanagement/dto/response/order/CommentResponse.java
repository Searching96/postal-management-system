package org.f3.postalmanagement.dto.response.order;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for order comment response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Order comment details")
public class CommentResponse {

    @Schema(description = "Comment ID")
    private UUID id;

    @Schema(description = "Order ID this comment belongs to")
    private UUID orderId;

    @Schema(description = "Comment text content")
    private String commentText;

    @Schema(description = "Account ID that created this comment")
    private UUID createdById;

    @Schema(description = "Name of the account that created this comment")
    private String createdByName;

    @Schema(description = "When the comment was created")
    private LocalDateTime createdAt;

    @Schema(description = "When the comment was last updated")
    private LocalDateTime updatedAt;
}
