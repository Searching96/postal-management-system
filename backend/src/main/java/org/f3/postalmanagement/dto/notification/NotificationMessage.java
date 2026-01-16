package org.f3.postalmanagement.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.f3.postalmanagement.enums.NotificationType;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Base notification message for RabbitMQ and WebSocket delivery.
 * Contains common fields for all notification types.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage implements Serializable {

    private UUID id;
    private NotificationType type;
    private String title;
    private String message;
    private Object data;
    private LocalDateTime timestamp;
    
    // Target information
    private UUID targetOfficeId;
    private String targetOfficeName;
    private UUID targetUserId;
    private String targetUserRole;
    
    // Source information  
    private UUID sourceUserId;
    private String sourceUserName;
    
    // Order context (if applicable)
    private UUID orderId;
    private String trackingNumber;
    
    private boolean read;
    private String priority; // LOW, NORMAL, HIGH, URGENT

    public static NotificationMessage createNewOrderNotification(
            UUID orderId, 
            String trackingNumber,
            UUID officeId, 
            String officeName,
            String customerName,
            String pickupAddress
    ) {
        return NotificationMessage.builder()
                .id(UUID.randomUUID())
                .type(NotificationType.NEW_PICKUP_ORDER)
                .title("New Pickup Order")
                .message("New order " + trackingNumber + " from " + customerName + " requires pickup at: " + pickupAddress)
                .orderId(orderId)
                .trackingNumber(trackingNumber)
                .targetOfficeId(officeId)
                .targetOfficeName(officeName)
                .timestamp(LocalDateTime.now())
                .read(false)
                .priority("HIGH")
                .build();
    }

    public static NotificationMessage createShipperAssignmentNotification(
            UUID orderId,
            String trackingNumber,
            UUID shipperId,
            String shipperName,
            String customerName,
            String pickupAddress,
            String assignedByName
    ) {
        return NotificationMessage.builder()
                .id(UUID.randomUUID())
                .type(NotificationType.ORDER_ASSIGNED)
                .title("New Pickup Assignment")
                .message("You have been assigned to pickup order " + trackingNumber + " from " + customerName)
                .orderId(orderId)
                .trackingNumber(trackingNumber)
                .targetUserId(shipperId)
                .sourceUserName(assignedByName)
                .data(new PickupDetails(customerName, pickupAddress))
                .timestamp(LocalDateTime.now())
                .read(false)
                .priority("HIGH")
                .build();
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PickupDetails implements Serializable {
        private String customerName;
        private String pickupAddress;
    }
}
