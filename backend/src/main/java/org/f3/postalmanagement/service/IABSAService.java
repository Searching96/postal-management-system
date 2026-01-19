package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.response.absa.ABSAResultResponse;
import org.f3.postalmanagement.entity.order.OrderComment;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.UUID;

/**
 * Service for ABSA (Aspect-Based Sentiment Analysis) integration.
 */
public interface IABSAService {

    /**
     * Send comment to ABSA API for analysis.
     * This is asynchronous - the result will be received via callback.
     *
     * @param orderComment the order comment to analyze
     * @return Mono with the API response status
     */
    Mono<String> sendCommentForAnalysis(OrderComment orderComment);

    /**
     * Process ABSA analysis result received from callback.
     * Updates the order comment with sentiment aspects.
     *
     * @param orderCommentId the order comment ID
     * @param aspects the sentiment aspects map
     * @param status the analysis status
     */
    void processAnalysisResult(UUID orderCommentId, Map<String, String> aspects, String status);

    /**
     * Get ABSA analysis result for a comment.
     *
     * @param orderCommentId the order comment ID
     * @return the ABSA result response
     */
    ABSAResultResponse getAnalysisResult(UUID orderCommentId);

    /**
     * Trigger batch analysis manually.
     * Forces the ABSA system to process pending comments.
     *
     * @return Mono with the API response
     */
    Mono<String> triggerBatchAnalysis();
}
