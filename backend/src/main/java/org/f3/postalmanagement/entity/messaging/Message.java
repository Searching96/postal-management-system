package org.f3.postalmanagement.entity.messaging;

import jakarta.persistence.*;
import lombok.*;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.entity.actor.Account;

import java.time.Instant;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Account sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private Account receiver;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @PrePersist
    public void prePersist() {
        if (sentAt == null) {
            sentAt = Instant.now();
        }
    }
}
