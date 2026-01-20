package org.f3.postalmanagement.entity.order;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.f3.postalmanagement.entity.BaseEntity;
import org.f3.postalmanagement.entity.actor.Customer;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.administrative.Ward;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OrderStatus;
import org.f3.postalmanagement.enums.PackageType;
import org.f3.postalmanagement.enums.ServiceType;
import org.f3.postalmanagement.entity.administrative.Province;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a shipping order/parcel in the system.
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@SQLDelete(sql = "UPDATE orders SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Order extends BaseEntity {

    /**
     * Unique tracking number for the order.
     * Format: VN + YY + 9 digits (e.g., VN23123456789) -> 13 chars
     */
    @Column(name = "tracking_number", nullable = false, unique = true, length = 15)
    private String trackingNumber;


// ...
    // ==================== SENDER INFORMATION ====================
    
    /**
     * Sender customer (required - must exist in database, but may not have account)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_customer_id", nullable = false)
    private Customer senderCustomer;

    /**
     * Sender's full name (snapshot at time of order creation)
     */
    @Column(name = "sender_name", nullable = false)
    private String senderName;

    /**
     * Sender's phone number (snapshot at time of order creation)
     */
    @Column(name = "sender_phone", nullable = false, length = 15)
    private String senderPhone;

    /**
     * Sender's address (snapshot at time of order creation)
     */
    @Column(name = "sender_address_line1", nullable = false)
    private String senderAddressLine1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_ward_code")
    private Ward senderWard;

    /**
     * Sender's latitude coordinate (for map display)
     */
    @Column(name = "sender_latitude")
    private Double senderLatitude;

    /**
     * Sender's longitude coordinate (for map display)
     */
    @Column(name = "sender_longitude")
    private Double senderLongitude;

    // ==================== RECEIVER INFORMATION ====================

    /**
     * Receiver customer (required - must exist in database, but may not have account)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_customer_id", nullable = false)
    private Customer receiverCustomer;

    /**
     * Receiver's full name (snapshot at time of order creation)
     */
    @Column(name = "receiver_name", nullable = false)
    private String receiverName;

    /**
     * Receiver's phone number (snapshot at time of order creation)
     */
    @Column(name = "receiver_phone", nullable = false, length = 15)
    private String receiverPhone;

    /**
     * Receiver's full address (snapshot at time of order creation)
     */
    @Column(name = "receiver_address_line1", nullable = false)
    private String receiverAddressLine1;

    /**
     * Destination/Receiver ward for routing (Province is derivable from ward)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_ward_code", referencedColumnName = "code")
    private Ward receiverWard;

    /**
     * Receiver's latitude coordinate (for map display)
     */
    @Column(name = "receiver_latitude")
    private Double receiverLatitude;

    /**
     * Receiver's longitude coordinate (for map display)
     */
    @Column(name = "receiver_longitude")
    private Double receiverLongitude;

    // ==================== PACKAGE INFORMATION ====================

    /**
     * Type of package (FRAGILE, BOX, DOCUMENT, etc.)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "package_type", nullable = false)
    private PackageType packageType;

    /**
     * Description of package contents
     */
    @Column(name = "package_description")
    private String packageDescription;

    /**
     * Actual weight in kilograms
     */
    @Column(name = "weight_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal weightKg;

    /**
     * Length in centimeters
     */
    @Column(name = "length_cm", precision = 10, scale = 2)
    private BigDecimal lengthCm;

    /**
     * Width in centimeters
     */
    @Column(name = "width_cm", precision = 10, scale = 2)
    private BigDecimal widthCm;

    /**
     * Height in centimeters
     */
    @Column(name = "height_cm", precision = 10, scale = 2)
    private BigDecimal heightCm;

    /**
     * Volumetric weight (L x W x H / 5000)
     */
    @Column(name = "volumetric_weight_kg", precision = 10, scale = 2)
    private BigDecimal volumetricWeightKg;

    /**
     * Chargeable weight = max(actual weight, volumetric weight)
     */
    @Column(name = "chargeable_weight_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal chargeableWeightKg;

    // ==================== SERVICE & PRICING ====================

    /**
     * Selected service type (EXPRESS, STANDARD, ECONOMY)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false)
    private ServiceType serviceType;

    /**
     * Base shipping fee
     */
    @Column(name = "shipping_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal shippingFee;

    /**
     * Cash on Delivery amount (0 if not COD)
     */
    @Column(name = "cod_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal codAmount = BigDecimal.ZERO;

    /**
     * Declared value for insurance
     */
    @Column(name = "declared_value", precision = 15, scale = 2)
    private BigDecimal declaredValue;

    /**
     * Insurance fee
     */
    @Column(name = "insurance_fee", precision = 15, scale = 2)
    private BigDecimal insuranceFee = BigDecimal.ZERO;

    /**
     * Total amount = shipping fee + insurance fee
     */
    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    // ==================== SLA & TIMING ====================

    /**
     * Estimated delivery date based on service type
     */
    @Column(name = "estimated_delivery_date")
    private LocalDateTime estimatedDeliveryDate;

    /**
     * Actual delivery date/time
     */
    @Column(name = "actual_delivery_date")
    private LocalDateTime actualDeliveryDate;

    // ==================== STATUS & LOCATION ====================

    /**
     * Current status of the order
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status = OrderStatus.CREATED;

    /**
     * Office where the order was created
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_office_id", nullable = false)
    private Office originOffice;

    /**
     * Current location (office) of the package
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_office_id")
    private Office currentOffice;

    /**
     * Destination office for delivery
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_office_id")
    private Office destinationOffice;

    /**
     * Staff who created the order
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_employee_id", nullable = true)
    private Employee createdByEmployee;

    /**
     * Shipper assigned for delivery (last-mile)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_shipper_id")
    private Employee assignedShipper;

    // ==================== BATCH CONSOLIDATION ====================

    /**
     * The batch package this order belongs to (for consolidated shipping)
     * Note: Deprecated in favor of consolidation_route_id (kept for backward compatibility)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_package_id")
    private BatchPackage batchPackage;

    // ==================== HIERARCHICAL CONSOLIDATION ====================

    /**
     * The consolidation route this order is assigned to (WARD → PROVINCE level).
     * Fixed assignment at order creation time based on origin ward.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_consolidation_route_id")
    private org.f3.postalmanagement.entity.unit.ConsolidationRoute assignedConsolidationRoute;

    /**
     * When was this order consolidated at the province warehouse?
     * Set when order moves from consolidation route to province warehouse.
     */
    @Column(name = "consolidated_at")
    private LocalDateTime consolidatedAt;

    /**
     * When was this order transferred from province to hub?
     * Set when order moves from province warehouse to hub via transfer route.
     */
    @Column(name = "transferred_to_hub_at")
    private LocalDateTime transferredToHubAt;

    // ==================== NOTES ====================

    /**
     * Special instructions for delivery
     */
    @Column(name = "delivery_instructions")
    private String deliveryInstructions;

    /**
     * Internal notes
     */
    @Column(name = "internal_notes")
    private String internalNotes;

    // ==================== TRACKING HISTORY ====================

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<OrderStatusHistory> statusHistory = new ArrayList<>();

    /**
     * Add a status history entry
     */
    public void addStatusHistory(OrderStatusHistory history) {
        statusHistory.add(history);
        history.setOrder(this);
    }

    // ==================== COMMENT ====================

    /**
     * Single comment on this order for communication and notes
     */
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private OrderComment comment;

    /**
     * Set the comment for this order
     */
    public void setComment(OrderComment comment) {
        this.comment = comment;
        if (comment != null) {
            comment.setOrder(this);
        }
    }

    
}
