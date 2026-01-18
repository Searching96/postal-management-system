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
import reactor.core.publisher.Mono;

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
            log.info("=== ABSA CALLBACK RECEIVED ===");
            log.info("Raw payload: {}", result);
            log.info("Available keys: {}", result.keySet());
            
            // Extract data from callback with detailed logging
            Object orderCommentIdObj = result.get("order_comment_id");
            if (orderCommentIdObj == null) {
                orderCommentIdObj = result.get("id"); // Try alternative field name
                log.warn("Field 'order_comment_id' not found, using 'id' instead");
            }
            
            if (orderCommentIdObj == null) {
                log.error("Neither 'order_comment_id' nor 'id' field found in callback payload");
                return ResponseEntity.badRequest().body("Missing order_comment_id or id field");
            }
            
            String orderCommentIdStr = orderCommentIdObj.toString();
            UUID orderCommentId = UUID.fromString(orderCommentIdStr);
            log.info("Parsed comment ID: {}", orderCommentId);
            
            Object statusObj = result.get("status");
            String status = statusObj != null ? statusObj.toString() : "success"; // Default to success if missing
            log.info("Status: {}", status);
            
            // Try both "aspects" and "predictions" field names
            @SuppressWarnings("unchecked")
            Map<String, Object> aspects = (Map<String, Object>) result.get("aspects");
            if (aspects == null) {
                log.warn("Field 'aspects' not found, trying 'predictions' instead");
                aspects = (Map<String, Object>) result.get("predictions");
            }
            log.info("Aspects/Predictions: {}", aspects);
            
            if (aspects == null) {
                log.warn("Neither 'aspects' nor 'predictions' field found, creating empty map");
                aspects = new java.util.HashMap<>();
            }
            
            // Convert aspect values to strings if they're numeric
            Map<String, String> aspectStrings = new java.util.HashMap<>();
            for (Map.Entry<String, Object> entry : aspects.entrySet()) {
                String value = entry.getValue() != null ? entry.getValue().toString() : null;
                aspectStrings.put(entry.getKey(), value);
                log.debug("Aspect {} = {}", entry.getKey(), value);
            }

            // Process the result
            absaService.processAnalysisResult(orderCommentId, aspectStrings, status);

            log.info("Successfully processed ABSA result for comment {}", orderCommentId);
            log.info("=================================");
            return ResponseEntity.ok("Received");

        } catch (org.f3.postalmanagement.exception.NotFoundException e) {
            log.warn("ABSA callback for non-existent comment: {} - {}", 
                result.get("order_comment_id"), e.getMessage());
            return ResponseEntity.status(404).body("Comment not found: " + e.getMessage());
        } catch (Exception e) {
            log.error("=== ABSA CALLBACK ERROR ===");
            log.error("Error type: {}", e.getClass().getName());
            log.error("Error message: {}", e.getMessage());
            log.error("Stack trace:", e);
            log.error("===========================");
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ==================== TRIGGER BATCH ANALYSIS ====================

    @PostMapping("/trigger-batch")
    // @PreAuthorize("hasAnyRole('PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'SYSTEM_ADMIN')") // Temporarily disabled for testing
    // @SecurityRequirement(name = "Bearer Authentication")
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
                .map(response -> {
                    log.info("Batch trigger response: {}", response);
                    return ResponseEntity.ok(response);
                })
                .onErrorResume(error -> {
                    log.error("Failed to trigger batch analysis", error);
                    return Mono.just(ResponseEntity.internalServerError().body("Error: " + error.getMessage()));
                })
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
