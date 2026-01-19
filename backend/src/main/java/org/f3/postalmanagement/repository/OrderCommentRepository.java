package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.order.OrderComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for managing order comment (single comment per order).
 */
@Repository
public interface OrderCommentRepository extends JpaRepository<OrderComment, UUID> {

    /**
     * Find the comment for a specific order
     */
    Optional<OrderComment> findByOrderId(UUID orderId);
}
