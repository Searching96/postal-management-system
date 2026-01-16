package org.f3.postalmanagement.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.ApiResponse;
import org.f3.postalmanagement.service.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

/**
 * Controller for handling file uploads (avatars, delivery evidence, etc.)
 */
@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@Slf4j
public class UploadController {

    private final StorageService storageService;

    /**
     * Upload avatar for the currently authenticated user
     */
    @PostMapping("/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            log.info("Uploading avatar for user: {}", authentication.getName());

            // Get user ID from authentication (adjust based on your UserPrincipal implementation)
            UUID userId = getUserIdFromAuth(authentication);

            String avatarUrl = storageService.uploadAvatar(userId, file);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(Map.of("avatarUrl", avatarUrl)));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid file upload: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading avatar", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload avatar"));
        }
    }

    /**
     * Upload delivery/pickup evidence image for an order
     */
    @PostMapping("/orders/{orderId}/evidence")
    @PreAuthorize("hasAnyRole('STAFF', 'SHIPPER', 'WARD_MANAGER', 'PROVINCE_ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadEvidence(
            @PathVariable UUID orderId,
            @RequestParam("type") String evidenceType,  // e.g., "pickup", "delivery"
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            log.info("Uploading {} evidence for order: {} by user: {}", 
                    evidenceType, orderId, authentication.getName());

            // Validate evidence type
            if (!isValidEvidenceType(evidenceType)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid evidence type. Allowed: pickup, delivery"));
            }

            String evidenceUrl = storageService.uploadEvidence(orderId, evidenceType, file);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(Map.of(
                            "evidenceUrl", evidenceUrl,
                            "evidenceType", evidenceType
                    )));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid file upload: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading evidence", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload evidence"));
        }
    }

    /**
     * Upload a general attachment
     */
    @PostMapping("/attachments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAttachment(
            @RequestParam("category") String category,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            log.info("Uploading attachment in category: {} by user: {}", 
                    category, authentication.getName());

            String attachmentUrl = storageService.uploadAttachment(category, file);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(Map.of(
                            "attachmentUrl", attachmentUrl,
                            "category", category
                    )));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid file upload: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading attachment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload attachment"));
        }
    }

    // ==================== PRIVATE HELPERS ====================

    private UUID getUserIdFromAuth(Authentication authentication) {
        // This should be adapted based on your UserPrincipal implementation
        // For now, using the authentication name as a fallback
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.f3.postalmanagement.security.UserPrincipal userPrincipal) {
            return userPrincipal.getId();
        }
        // Fallback: generate deterministic UUID from username
        return UUID.nameUUIDFromBytes(authentication.getName().getBytes());
    }

    private boolean isValidEvidenceType(String type) {
        return type != null && (type.equalsIgnoreCase("pickup") || type.equalsIgnoreCase("delivery"));
    }
}
