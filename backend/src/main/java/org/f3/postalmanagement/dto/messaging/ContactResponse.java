package org.f3.postalmanagement.dto.messaging;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ContactResponse {
    private UUID id;
    private String name;
    private String phoneNumber;
    private String role;
    private String unitName; // Hub/Province/Ward name
    private long unreadCount;
    private String lastMessage;
    private String sentAt; // formatted timestamp of last message
}
