package org.f3.postalmanagement.entity.unit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * Represents a predefined transfer route between two HUBs.
 * Used to determine the path packages travel from source to destination hub.
 */
@Entity
@Table(name = "transfer_routes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"from_hub_id", "to_hub_id"})
})
@Getter
@Setter
@SQLDelete(sql = "UPDATE transfer_routes SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class TransferRoute extends BaseEntity {

    /**
     * Source hub for this route segment.
     * Must be an office with OfficeType.HUB
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_hub_id", nullable = false)
    private Office fromHub;

    /**
     * Destination hub for this route segment.
     * Must be an office with OfficeType.HUB
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_hub_id", nullable = false)
    private Office toHub;

    /**
     * Distance between hubs in kilometers (optional, for optimization).
     */
    @Column(name = "distance_km")
    private Integer distanceKm;

    /**
     * Estimated transit time in hours.
     */
    @Column(name = "transit_hours")
    private Integer transitHours;

    /**
     * Priority/order for route selection (lower = preferred).
     */
    @Column(name = "priority")
    private Integer priority = 1;

    /**
     * Whether this route is currently active.
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
