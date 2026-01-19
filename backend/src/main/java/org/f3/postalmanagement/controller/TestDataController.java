package org.f3.postalmanagement.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for getting test data information
 * Used by test scripts to get test order IDs automatically
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class TestDataController {

    private final OrderRepository orderRepository;

    /**
     * Get test order information
     * Returns the test order with tracking number VNTEST12345VN
     */
    @GetMapping("/order")
    public ResponseEntity<Map<String, Object>> getTestOrder() {
        try {
            return orderRepository.findByTrackingNumber("VNTEST12345VN")
                    .map(order -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("id", order.getId());
                        response.put("trackingNumber", order.getTrackingNumber());
                        response.put("senderName", order.getSenderName());
                        response.put("receiverName", order.getReceiverName());
                        response.put("status", order.getStatus());
                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting test order", e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("cause", e.getCause() != null ? e.getCause().getMessage() : null);
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
