package org.f3.postalmanagement.entity.tracking;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.entity.actor.Employee;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Stores shipper's current GPS location for real-time tracking.
 * Only one active location per shipper (upserted on each update).
 */
@Entity
@Table(name = "shipper_locations", indexes = {
    @Index(name = "idx_shipper_location_shipper", columnList = "shipper_id"),
    @Index(name = "idx_shipper_location_timestamp", columnList = "timestamp")
})
@Getter
@Setter
public class ShipperLocation extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipper_id", nullable = false, unique = true)
    private Employee shipper;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    /**
     * GPS accuracy in meters
     */
    @Column(name = "accuracy")
    private Double accuracy;

    /**
     * Direction of movement in degrees (0-360)
     */
    @Column(name = "heading")
    private Double heading;

    /**
     * Speed in km/h
     */
    @Column(name = "speed")
    private Double speed;

    /**
     * When this location was recorded by the device
     */
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    /**
     * Whether shipper is currently on a delivery session
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /**
     * Comma-separated list of order IDs currently being delivered
     */
    @Column(name = "active_order_ids", length = 1000)
    private String activeOrderIds;
}
