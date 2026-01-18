package org.f3.postalmanagement.dto.messaging;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class MessageResponse {
    private UUID id;
    private UUID senderId;
    private String senderName;
    private UUID receiverId;
    private String receiverName;
    private String content;
    private Instant sentAt;

    @JsonProperty("isRead")
    private boolean read;

    @JsonProperty("isMe")
    private boolean me; // Helper for frontend to know alignment
}
