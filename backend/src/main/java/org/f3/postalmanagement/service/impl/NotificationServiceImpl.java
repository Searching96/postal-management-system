package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.config.RabbitMQConfig;
import org.f3.postalmanagement.dto.notification.NotificationMessage;
import org.f3.postalmanagement.service.INotificationService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Implementation of notification service using RabbitMQ for message queuing
 * and WebSocket (STOMP) for real-time delivery to clients.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements INotificationService {

    private final RabbitTemplate rabbitTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void notifyOfficeNewPickupOrder(UUID officeId, String officeName, NotificationMessage message) {
        log.info("Sending new pickup order notification to office: {} ({})", officeName, officeId);
        
        // Send to RabbitMQ for persistence and processing
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.ORDER_EXCHANGE,
                RabbitMQConfig.NEW_ORDER_ROUTING_KEY,
                message
        );
        
        // Also send directly via WebSocket to connected staff at this office
        String destination = "/topic/office/" + officeId + "/orders";
        messagingTemplate.convertAndSend(destination, message);
        
        log.debug("Notification sent to destination: {}", destination);
    }

    @Override
    public void notifyShipperAssignment(UUID shipperId, NotificationMessage message) {
        log.info("Sending assignment notification to shipper: {}", shipperId);
        
        // Send to RabbitMQ for persistence
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.ORDER_EXCHANGE,
                RabbitMQConfig.ORDER_ASSIGNED_ROUTING_KEY,
                message
        );
        
        // Send directly to specific shipper via WebSocket
        // Using user-specific destination: /user/{userId}/queue/assignments
        messagingTemplate.convertAndSendToUser(
                shipperId.toString(),
                "/queue/assignments",
                message
        );
        
        log.debug("Assignment notification sent to shipper: {}", shipperId);
    }

    @Override
    public void notifyUser(UUID userId, NotificationMessage message) {
        log.info("Sending notification to user: {}", userId);
        
        // Send to user-specific queue
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                message
        );
    }

    @Override
    public void notifyOffice(UUID officeId, NotificationMessage message) {
        log.info("Sending notification to office: {}", officeId);
        
        // Broadcast to all staff at this office
        String destination = "/topic/office/" + officeId + "/notifications";
        messagingTemplate.convertAndSend(destination, message);
    }

    @Override
    public void broadcastSystemNotification(NotificationMessage message) {
        log.info("Broadcasting system notification: {}", message.getTitle());
        
        // Broadcast to all connected users
        messagingTemplate.convertAndSend("/topic/system", message);
    }
}
