package org.f3.postalmanagement.entity.order;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OrderStatus;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * Tracks the history of status changes for an order.
 * Each entry represents a status change event with location and actor.
 */
@Entity
@Table(name = "order_status_history")
@Getter
@Setter
@SQLDelete(sql = "UPDATE order_status_history SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class OrderStatusHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /**
     * The status at this point in time
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status;

    /**
     * Previous status (null for first entry)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status")
    private OrderStatus previousStatus;

    /**
     * Office where this status change occurred
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id")
    private Office office;

    /**
     * Employee who made this status change
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    /**
     * Description or notes about this status change
     */
    @Column(name = "description")
    private String description;

    /**
     * Location details (e.g., GPS coordinates, address)
     */
    @Column(name = "location_details")
    private String locationDetails;

    /**
     * Reason for status change (especially for failures/returns)
     */
    @Column(name = "reason")
    private String reason;
}
