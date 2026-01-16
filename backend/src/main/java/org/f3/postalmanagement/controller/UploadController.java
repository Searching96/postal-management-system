package org.f3.postalmanagement.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.ApiResponse;
import org.f3.postalmanagement.entity.actor.CustomUserDetails;
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

            UUID userId = getUserIdFromAuth(authentication);

            String avatarUrl = storageService.uploadAvatar(userId, file);

            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                    .success(true)
                    .data(Map.of("avatarUrl", avatarUrl))
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid file upload: {}", e.getMessage());
            
            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error uploading avatar", e);
            
            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                    .success(false)
                    .message("Failed to upload avatar")
                    .build();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Upload delivery/pickup evidence image for an order
     */
    @PostMapping("/orders/{orderId}/evidence")
    @PreAuthorize("hasAnyRole('STAFF', 'SHIPPER', 'WARD_MANAGER', 'PROVINCE_ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadEvidence(
            @PathVariable UUID orderId,
            @RequestParam("type") String evidenceType,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            log.info("Uploading {} evidence for order: {} by user: {}", 
                    evidenceType, orderId, authentication.getName());

            if (!isValidEvidenceType(evidenceType)) {
                ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("Invalid evidence type. Allowed: pickup, delivery")
                        .build();
                
                return ResponseEntity.badRequest().body(response);
            }

            String evidenceUrl = storageService.uploadEvidence(orderId, evidenceType, file);

            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                    .success(true)
                    .data(Map.of(
                            "evidenceUrl", evidenceUrl,
                            "evidenceType", evidenceType
                    ))
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid file upload: {}", e.getMessage());
            
            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error uploading evidence", e);
            
            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                    .success(false)
                    .message("Failed to upload evidence")
                    .build();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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

            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                    .success(true)
                    .data(Map.of(
                            "attachmentUrl", attachmentUrl,
                            "category", category
                    ))
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid file upload: {}", e.getMessage());
            
            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Error uploading attachment", e);
            
            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                    .success(false)
                    .message("Failed to upload attachment")
                    .build();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ==================== PRIVATE HELPERS ====================

    private UUID getUserIdFromAuth(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails customUserDetails) {
            return customUserDetails.getAccount().getId();
        }
        // Fallback: generate deterministic UUID from username
        return UUID.nameUUIDFromBytes(authentication.getName().getBytes());
    }

    private boolean isValidEvidenceType(String type) {
        return type != null && (type.equalsIgnoreCase("pickup") || type.equalsIgnoreCase("delivery"));
    }
}