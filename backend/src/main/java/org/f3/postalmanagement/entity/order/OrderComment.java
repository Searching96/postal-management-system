package org.f3.postalmanagement.entity.order;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.entity.actor.Account;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

/**
 * Represents a comment on an order.
 * Can be added by staff members or customers for communication about the order.
 */
@Entity
@Table(name = "order_comments")
@Getter
@Setter
@SQLDelete(sql = "UPDATE order_comments SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class OrderComment extends BaseEntity {

    /**
     * The order this comment belongs to
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    /**
     * Account that created this comment
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_account_id", nullable = false)
    private Account createdBy;

    /**
     * Comment text content
     */
    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    private String commentText;

    /**
     * ABSA analysis status: pending, processing, success, error
     */
    @Column(name = "absa_status", length = 20)
    private String absaStatus;

    /**
     * ABSA time aspect sentiment: not_mentioned, negative, neutral, positive
     */
    @Column(name = "absa_time_aspect", length = 20)
    private String absaTimeAspect;

    /**
     * ABSA staff aspect sentiment: not_mentioned, negative, neutral, positive
     */
    @Column(name = "absa_staff_aspect", length = 20)
    private String absaStaffAspect;

    /**
     * ABSA quality aspect sentiment: not_mentioned, negative, neutral, positive
     */
    @Column(name = "absa_quality_aspect", length = 20)
    private String absaQualityAspect;

    /**
     * ABSA price aspect sentiment: not_mentioned, negative, neutral, positive
     */
    @Column(name = "absa_price_aspect", length = 20)
    private String absaPriceAspect;

    /**
     * When ABSA analysis was completed
     */
    @Column(name = "absa_analyzed_at")
    private LocalDateTime absaAnalyzedAt;
}
