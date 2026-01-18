package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.messaging.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.sentAt DESC")
    Page<Message> findConversation(@Param("user1") Account user1, @Param("user2") Account user2, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver = :user AND m.sender = :sender AND m.isRead = false")
    long countUnreadMessages(@Param("user") Account user, @Param("sender") Account sender);
    
    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.sender = :sender AND m.receiver = :receiver AND m.isRead = false")
    void markAsRead(@Param("sender") Account sender, @Param("receiver") Account receiver);

    // Simplified query to fetch recent messages for Java-side processing
    @Query("SELECT m FROM Message m WHERE m.sender = :user OR m.receiver = :user ORDER BY m.sentAt DESC")
    List<Message> findRecentMessagesByUser(@Param("user") Account user, Pageable pageable);
}
