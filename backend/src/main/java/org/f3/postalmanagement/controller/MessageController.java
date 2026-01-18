package org.f3.postalmanagement.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.entity.ApiResponse;
import org.f3.postalmanagement.dto.messaging.ContactResponse;
import org.f3.postalmanagement.dto.messaging.MessageResponse;
import org.f3.postalmanagement.dto.messaging.SendMessageRequest;
import org.f3.postalmanagement.service.MessageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        MessageResponse response = messageService.sendMessage(request);
        return ResponseEntity.ok(ApiResponse.<MessageResponse>builder()
                .data(response)
                .success(true)
                .build());
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> getConversation(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size); // Repository query already orders by sentAt DESC
        Page<MessageResponse> conversation = messageService.getConversation(userId, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<MessageResponse>>builder()
                .data(conversation)
                .success(true)
                .build());
    }

    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<ContactResponse>>> getRecentContacts(
            @RequestParam(defaultValue = "10") int limit) {
        List<ContactResponse> contacts = messageService.getRecentContacts(PageRequest.of(0, limit));
        return ResponseEntity.ok(ApiResponse.<List<ContactResponse>>builder()
                .data(contacts)
                .success(true)
                .build());
    }

    @GetMapping("/unit")
    public ApiResponse<List<ContactResponse>> getUnitEmployees() {
        return ApiResponse.<List<ContactResponse>>builder()
                .data(messageService.getUnitEmployees())
                .success(true)
                .build();
    }

    @PostMapping("/read/{userId}")
    public ApiResponse<Void> markAsRead(@PathVariable UUID userId) {
        messageService.markAsRead(userId);
        return ApiResponse.<Void>builder()
                .success(true)
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<List<ContactResponse>> searchUsers(@RequestParam String query) {
        return ApiResponse.<List<ContactResponse>>builder()
                .data(messageService.searchUsers(query))
                .success(true)
                .build();
    }
}
