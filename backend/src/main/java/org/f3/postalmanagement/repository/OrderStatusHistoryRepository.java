package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.order.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, UUID> {

    /**
     * Find all status history for an order, ordered by creation time
     */
    List<OrderStatusHistory> findByOrderIdOrderByCreatedAtAsc(UUID orderId);

    /**
     * Find latest status history entry for an order
     */
    OrderStatusHistory findFirstByOrderIdOrderByCreatedAtDesc(UUID orderId);
}
