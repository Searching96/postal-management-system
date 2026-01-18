package org.f3.postalmanagement.entity.unit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.enums.DisruptionType;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

/**
 * Tracks route disruptions with reason, duration, and impact.
 */
@Entity
@Table(name = "route_disruptions")
@Getter
@Setter
@SQLDelete(sql = "UPDATE route_disruptions SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class RouteDisruption extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transfer_route_id", nullable = false)
    private TransferRoute transferRoute;

    @Enumerated(EnumType.STRING)
    @Column(name = "disruption_type", nullable = false)
    private DisruptionType disruptionType;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "expected_end_time")
    private LocalDateTime expectedEndTime;

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "affected_batch_count")
    private Integer affectedBatchCount = 0;

    @Column(name = "affected_order_count")
    private Integer affectedOrderCount = 0;

    @Column(name = "created_by")
    private String createdBy;
}
