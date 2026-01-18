package org.f3.postalmanagement.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.config.RabbitMQConfig;
import org.f3.postalmanagement.dto.notification.NotificationMessage;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * RabbitMQ message listener that forwards messages to WebSocket clients.
 * This allows for message persistence and reliable delivery even if
 * clients are temporarily disconnected.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class OrderNotificationListener {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Listen for new order notifications and forward to appropriate office staff.
     */
    @RabbitListener(queues = RabbitMQConfig.NEW_ORDER_QUEUE)
    public void handleNewOrderNotification(NotificationMessage message) {
        log.info("Received new order notification from queue: {}", message.getTrackingNumber());
        
        try {
            // Forward to all staff at the target office
            if (message.getTargetOfficeId() != null) {
                String destination = "/topic/office/" + message.getTargetOfficeId() + "/orders";
                messagingTemplate.convertAndSend(destination, message);
                log.debug("Forwarded new order notification to: {}", destination);
            }
            
            // Also store notification for later retrieval (could save to database here)
            // notificationRepository.save(toEntity(message));
            
        } catch (Exception e) {
            log.error("Error processing new order notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Listen for order assigned notifications and forward to specific shipper.
     */
    @RabbitListener(queues = RabbitMQConfig.ORDER_ASSIGNED_QUEUE)
    public void handleOrderAssignedNotification(NotificationMessage message) {
        log.info("Received order assignment notification from queue: {}", message.getTrackingNumber());
        
        try {
            // Forward to specific shipper
            if (message.getTargetUserId() != null) {
                messagingTemplate.convertAndSendToUser(
                        message.getTargetUserId().toString(),
                        "/queue/assignments",
                        message
                );
                log.debug("Forwarded assignment notification to shipper: {}", message.getTargetUserId());
            }
            
        } catch (Exception e) {
            log.error("Error processing order assignment notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Listen for staff notifications.
     */
    @RabbitListener(queues = RabbitMQConfig.STAFF_NOTIFICATION_QUEUE)
    public void handleStaffNotification(NotificationMessage message) {
        log.info("Received staff notification from queue: {}", message.getTitle());
        
        try {
            if (message.getTargetOfficeId() != null) {
                String destination = "/topic/office/" + message.getTargetOfficeId() + "/notifications";
                messagingTemplate.convertAndSend(destination, message);
            } else if (message.getTargetUserId() != null) {
                messagingTemplate.convertAndSendToUser(
                        message.getTargetUserId().toString(),
                        "/queue/notifications",
                        message
                );
            }
        } catch (Exception e) {
            log.error("Error processing staff notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Listen for shipper notifications.
     */
    @RabbitListener(queues = RabbitMQConfig.SHIPPER_NOTIFICATION_QUEUE)
    public void handleShipperNotification(NotificationMessage message) {
        log.info("Received shipper notification from queue: {}", message.getTitle());
        
        try {
            if (message.getTargetUserId() != null) {
                messagingTemplate.convertAndSendToUser(
                        message.getTargetUserId().toString(),
                        "/queue/notifications",
                        message
                );
            }
        } catch (Exception e) {
            log.error("Error processing shipper notification: {}", e.getMessage(), e);
        }
    }
}
