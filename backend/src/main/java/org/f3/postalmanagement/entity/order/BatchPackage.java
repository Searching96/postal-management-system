package org.f3.postalmanagement.entity.order;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.BatchStatus;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a consolidated batch package containing multiple orders
 * going to the same destination.
 * 
 * The system groups orders with the same destination and consolidates them
 * into larger batch packages for efficient transportation.
 */
@Entity
@Table(name = "batch_packages", indexes = {
    @Index(name = "idx_batch_origin_destination", columnList = "origin_office_id, destination_office_id"),
    @Index(name = "idx_batch_status", columnList = "status"),
    @Index(name = "idx_batch_code", columnList = "batch_code")
})
@Getter
@Setter
@SQLDelete(sql = "UPDATE batch_packages SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class BatchPackage extends BaseEntity {

    /**
     * Unique batch code for identification.
     * Format: BATCH-{origin_office_code}-{destination_office_code}-{timestamp}
     */
    @Column(name = "batch_code", nullable = false, unique = true, length = 50)
    private String batchCode;

    /**
     * Office where the batch is created/originated
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_office_id", nullable = false)
    private Office originOffice;

    /**
     * Destination office for all orders in this batch
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_office_id", nullable = false)
    private Office destinationOffice;

    /**
     * Current status of the batch
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BatchStatus status = BatchStatus.OPEN;

    // ==================== CAPACITY & LIMITS ====================

    /**
     * Maximum weight capacity in kg for this batch container
     */
    @Column(name = "max_weight_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal maxWeightKg;

    /**
     * Maximum volume capacity in cubic cm for this batch container
     */
    @Column(name = "max_volume_cm3", precision = 15, scale = 2)
    private BigDecimal maxVolumeCm3;

    /**
     * Maximum number of orders allowed in this batch
     */
    @Column(name = "max_order_count")
    private Integer maxOrderCount;

    // ==================== CURRENT USAGE ====================

    /**
     * Current total weight of all orders in this batch
     */
    @Column(name = "current_weight_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal currentWeightKg = BigDecimal.ZERO;

    /**
     * Current total volume of all orders in this batch
     */
    @Column(name = "current_volume_cm3", precision = 15, scale = 2)
    private BigDecimal currentVolumeCm3 = BigDecimal.ZERO;

    /**
     * Current number of orders in this batch
     */
    @Column(name = "current_order_count", nullable = false)
    private Integer currentOrderCount = 0;

    // ==================== TIMING ====================

    /**
     * When the batch was sealed and ready for transit
     */
    @Column(name = "sealed_at")
    private LocalDateTime sealedAt;

    /**
     * When the batch departed from origin
     */
    @Column(name = "departed_at")
    private LocalDateTime departedAt;

    /**
     * When the batch arrived at destination
     */
    @Column(name = "arrived_at")
    private LocalDateTime arrivedAt;

    // ==================== STAFF ====================

    /**
     * Employee who created the batch
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_employee_id")
    private Employee createdByEmployee;

    /**
     * Employee who sealed the batch
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sealed_by_employee_id")
    private Employee sealedByEmployee;

    // ==================== ORDERS ====================

    /**
     * Orders contained in this batch
     */
    @OneToMany(mappedBy = "batchPackage", cascade = CascadeType.ALL)
    @OrderBy("createdAt ASC")
    private List<Order> orders = new ArrayList<>();

    // ==================== NOTES ====================

    @Column(name = "notes")
    private String notes;

    // ==================== UTILITY METHODS ====================

    /**
     * Calculate remaining weight capacity
     */
    public BigDecimal getRemainingWeightCapacity() {
        return maxWeightKg.subtract(currentWeightKg);
    }

    /**
     * Calculate remaining volume capacity
     */
    public BigDecimal getRemainingVolumeCapacity() {
        if (maxVolumeCm3 == null || currentVolumeCm3 == null) {
            return null;
        }
        return maxVolumeCm3.subtract(currentVolumeCm3);
    }

    /**
     * Check if the batch can accept more orders
     */
    public boolean canAcceptMoreOrders() {
        if (status != BatchStatus.OPEN && status != BatchStatus.PROCESSING) {
            return false;
        }
        if (maxOrderCount != null && currentOrderCount >= maxOrderCount) {
            return false;
        }
        return true;
    }

    /**
     * Calculate fill percentage by weight
     */
    public double getWeightFillPercentage() {
        if (maxWeightKg.compareTo(BigDecimal.ZERO) == 0) {
            return 100.0;
        }
        return currentWeightKg.divide(maxWeightKg, 4, java.math.RoundingMode.HALF_UP)
                              .multiply(BigDecimal.valueOf(100))
                              .doubleValue();
    }

    /**
     * Calculate fill percentage by order count
     */
    public double getOrderCountFillPercentage() {
        if (maxOrderCount == null || maxOrderCount == 0) {
            return 0.0;
        }
        return (double) currentOrderCount / maxOrderCount * 100;
    }
}
