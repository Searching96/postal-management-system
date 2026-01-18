package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.response.absa.ABSAResultResponse;
import org.f3.postalmanagement.service.IABSAService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for ABSA (Aspect-Based Sentiment Analysis) operations.
 */
@RestController
@RequestMapping("/api/absa")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "ABSA", description = "APIs for ABSA sentiment analysis of order comments")
public class ABSAController {

    private final IABSAService absaService;

    // ==================== CALLBACK ENDPOINT ====================

    @PostMapping("/callback")
    @Operation(
            summary = "Receive ABSA analysis result",
            description = "Callback endpoint for receiving sentiment analysis results from ABSA system. " +
                    "This endpoint is called by the ABSA Python service."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Result received successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request format"),
            @ApiResponse(responseCode = "404", description = "Order comment not found")
    })
    public ResponseEntity<String> receiveAnalysisResult(@RequestBody Map<String, Object> result) {
        try {
            log.info("Received ABSA callback: {}", result);

            // Extract data from callback
            String orderCommentIdStr = result.get("order_comment_id").toString();
            UUID orderCommentId = UUID.fromString(orderCommentIdStr);
            String status = result.get("status").toString();
            
            @SuppressWarnings("unchecked")
            Map<String, String> aspects = (Map<String, String>) result.get("aspects");

            // Process the result
            absaService.processAnalysisResult(orderCommentId, aspects, status);

            log.info("Successfully processed ABSA result for comment {}", orderCommentId);
            return ResponseEntity.ok("Received");

        } catch (Exception e) {
            log.error("Error processing ABSA callback: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ==================== TRIGGER BATCH ANALYSIS ====================

    @PostMapping("/trigger-batch")
    @PreAuthorize("hasAnyRole('PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'SYSTEM_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(
            summary = "Trigger batch ABSA analysis",
            description = "Manually trigger batch analysis for pending comments. " +
                    "Forces the ABSA system to process comments immediately instead of waiting for threshold."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Batch analysis triggered successfully"),
            @ApiResponse(responseCode = "500", description = "Failed to trigger batch analysis")
    })
    public ResponseEntity<String> triggerBatchAnalysis() {
        log.info("Manual trigger of batch ABSA analysis requested");

        return absaService.triggerBatchAnalysis()
                .map(response -> ResponseEntity.ok("Batch analysis triggered successfully"))
                .onErrorReturn(ResponseEntity.internalServerError().body("Failed to trigger batch analysis"))
                .block();
    }

    // ==================== GET ANALYSIS RESULT ====================

    @GetMapping("/results/{orderCommentId}")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'SYSTEM_ADMIN', 'CUSTOMER')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(
            summary = "Get ABSA analysis result",
            description = "Retrieve sentiment analysis result for a specific order comment."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Analysis result retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ABSAResultResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Order comment not found")
    })
    public ResponseEntity<ABSAResultResponse> getAnalysisResult(@PathVariable UUID orderCommentId) {
        log.info("Fetching ABSA result for comment {}", orderCommentId);
        ABSAResultResponse result = absaService.getAnalysisResult(orderCommentId);
        return ResponseEntity.ok(result);
    }
}
