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
     * Format: VN + 9 digits + VN (e.g., VN123456789VN)
     */
    @Column(name = "tracking_number", nullable = false, unique = true, length = 15)
    private String trackingNumber;

    // ==================== SENDER INFORMATION ====================
    
    /**
     * Registered customer (optional - for walk-in customers without account)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_customer_id")
    private Customer senderCustomer;

    /**
     * Sender's full name (required for walk-in customers)
     */
    @Column(name = "sender_name", nullable = false)
    private String senderName;

    /**
     * Sender's phone number
     */
    @Column(name = "sender_phone", nullable = false, length = 15)
    private String senderPhone;

    /**
     * Sender's address
     */
    @Column(name = "sender_address", nullable = false)
    private String senderAddress;

    // ==================== RECEIVER INFORMATION ====================

    /**
     * Receiver's full name
     */
    @Column(name = "receiver_name", nullable = false)
    private String receiverName;

    /**
     * Receiver's phone number
     */
    @Column(name = "receiver_phone", nullable = false, length = 15)
    private String receiverPhone;

    /**
     * Receiver's full address
     */
    @Column(name = "receiver_address", nullable = false)
    private String receiverAddress;

    /**
     * Destination ward for routing
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_ward_code", referencedColumnName = "code")
    private Ward destinationWard;

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
    @JoinColumn(name = "created_by_employee_id", nullable = false)
    private Employee createdByEmployee;

    /**
     * Shipper assigned for delivery (last-mile)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_shipper_id")
    private Employee assignedShipper;

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
}
