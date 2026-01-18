package org.f3.postalmanagement.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.response.absa.ABSAResultResponse;
import org.f3.postalmanagement.entity.order.OrderComment;
import org.f3.postalmanagement.exception.NotFoundException;
import org.f3.postalmanagement.repository.OrderCommentRepository;
import org.f3.postalmanagement.service.IABSAService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Implementation of ABSA Service.
 */
@Service
@Slf4j
public class ABSAServiceImpl implements IABSAService {

    private final WebClient webClient;
    private final OrderCommentRepository orderCommentRepository;
    private final String callbackUrl;

    public ABSAServiceImpl(
            @Value("${absa.api.url}") String absaApiUrl,
            @Value("${absa.callback.url}") String callbackUrl,
            OrderCommentRepository orderCommentRepository) {
        this.webClient = WebClient.builder()
                .baseUrl(absaApiUrl)
                .build();
        this.callbackUrl = callbackUrl;
        this.orderCommentRepository = orderCommentRepository;
    }

    @Override
    @Transactional
    public Mono<String> sendCommentForAnalysis(OrderComment orderComment) {
        log.info("Sending comment {} to ABSA for analysis", orderComment.getId());
        log.debug("Comment text: {}", orderComment.getCommentText());

        // Update status to processing
        orderComment.setAbsaStatus("processing");
        orderCommentRepository.save(orderComment);

        // Prepare request
        Map<String, Object> request = new HashMap<>();
        request.put("id", orderComment.getId().toString());
        request.put("comment_text", orderComment.getCommentText());
        request.put("callback_url", callbackUrl);

        log.debug("ABSA request payload: {}", request);
        log.debug("Calling ABSA API: POST /api/comments");

        // Send to ABSA API
        return webClient.post()
                .uri("/api/comments")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .doOnSuccess(response -> log.info("Successfully sent comment {} to ABSA. Response: {}", orderComment.getId(), response))
                .doOnError(error -> {
                    log.error("Failed to send comment {} to ABSA: {}", orderComment.getId(), error.getMessage(), error);
                    orderComment.setAbsaStatus("error");
                    orderCommentRepository.save(orderComment);
                });
    }

    @Override
    @Transactional
    public void processAnalysisResult(UUID orderCommentId, Map<String, String> aspects, String status) {
        log.info("Processing ABSA result for comment {}: status={}", orderCommentId, status);

        OrderComment orderComment = orderCommentRepository.findById(orderCommentId)
                .orElseThrow(() -> new NotFoundException("Order comment not found with id: " + orderCommentId));

        orderComment.setAbsaStatus(status);
        orderComment.setAbsaAnalyzedAt(LocalDateTime.now());

        if ("success".equals(status) && aspects != null) {
            // Map aspect values: -1 -> not_mentioned, 0 -> negative, 1 -> neutral, 2 -> positive
            orderComment.setAbsaTimeAspect(mapAspectValue(aspects.get("time")));
            orderComment.setAbsaStaffAspect(mapAspectValue(aspects.get("staff")));
            orderComment.setAbsaQualityAspect(mapAspectValue(aspects.get("quality")));
            orderComment.setAbsaPriceAspect(mapAspectValue(aspects.get("price")));

            log.info("ABSA analysis completed for comment {}: time={}, staff={}, quality={}, price={}",
                    orderCommentId,
                    orderComment.getAbsaTimeAspect(),
                    orderComment.getAbsaStaffAspect(),
                    orderComment.getAbsaQualityAspect(),
                    orderComment.getAbsaPriceAspect());
        }

        orderCommentRepository.save(orderComment);
    }

    @Override
    public ABSAResultResponse getAnalysisResult(UUID orderCommentId) {
        OrderComment orderComment = orderCommentRepository.findById(orderCommentId)
                .orElseThrow(() -> new NotFoundException("Order comment not found with id: " + orderCommentId));

        Map<String, String> aspects = new HashMap<>();
        if (orderComment.getAbsaTimeAspect() != null) {
            aspects.put("time", orderComment.getAbsaTimeAspect());
            aspects.put("staff", orderComment.getAbsaStaffAspect());
            aspects.put("quality", orderComment.getAbsaQualityAspect());
            aspects.put("price", orderComment.getAbsaPriceAspect());
        }

        return ABSAResultResponse.builder()
                .orderCommentId(orderCommentId)
                .status(orderComment.getAbsaStatus() != null ? orderComment.getAbsaStatus() : "pending")
                .aspects(aspects.isEmpty() ? null : aspects)
                .timestamp(orderComment.getAbsaAnalyzedAt())
                .build();
    }

    @Override
    public Mono<String> triggerBatchAnalysis() {
        log.info("Triggering batch ABSA analysis via /api/batch/fill");

        Map<String, String> body = new HashMap<>();
        body.put("filler_text", "FILLER_IGNORE");

        return webClient.post()
                .uri("/api/batch/fill")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .doOnSuccess(response -> log.info("Successfully triggered batch ABSA analysis. Response: {}", response))
                .doOnError(error -> log.error("Failed to trigger batch ABSA analysis: {}", error.getMessage(), error));
    }

    /**
     * Map aspect value from numeric to string representation.
     * -1 or "not_mentioned" -> "not_mentioned"
     * 0 or "negative" -> "negative"
     * 1 or "neutral" -> "neutral"
     * 2 or "positive" -> "positive"
     */
    private String mapAspectValue(String value) {
        if (value == null) {
            return "not_mentioned";
        }

        // If already string format, return as is
        if (value.matches("not_mentioned|negative|neutral|positive")) {
            return value;
        }

        // Map numeric values
        return switch (value) {
            case "-1" -> "not_mentioned";
            case "0" -> "negative";
            case "1" -> "neutral";
            case "2" -> "positive";
            default -> "not_mentioned";
        };
    }
}
