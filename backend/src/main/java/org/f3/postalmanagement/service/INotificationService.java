package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.notification.NotificationMessage;

import java.util.UUID;

/**
 * Service for sending real-time notifications via RabbitMQ and WebSocket.
 */
public interface INotificationService {

    /**
     * Send notification to all staff at a specific office about a new pickup order.
     */
    void notifyOfficeNewPickupOrder(UUID officeId, String officeName, NotificationMessage message);

    /**
     * Send notification to a specific shipper about an assigned order.
     */
    void notifyShipperAssignment(UUID shipperId, NotificationMessage message);

    /**
     * Send notification to a specific user by their ID.
     */
    void notifyUser(UUID userId, NotificationMessage message);

    /**
     * Send notification to all users in an office.
     */
    void notifyOffice(UUID officeId, NotificationMessage message);

    /**
     * Broadcast notification to all connected users (system-wide).
     */
    void broadcastSystemNotification(NotificationMessage message);
}
