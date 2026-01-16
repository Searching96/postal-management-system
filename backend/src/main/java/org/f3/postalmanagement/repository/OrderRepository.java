package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.order.Order;
import org.f3.postalmanagement.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    /**
     * Find order by tracking number
     */
    Optional<Order> findByTrackingNumber(String trackingNumber);

    /**
     * Check if tracking number exists
     */
    boolean existsByTrackingNumber(String trackingNumber);

    /**
     * Find orders by sender phone
     */
    Page<Order> findBySenderPhone(String senderPhone, Pageable pageable);

    /**
     * Find orders by sender customer ID
     */
    Page<Order> findBySenderCustomerId(UUID customerId, Pageable pageable);

    /**
     * Find orders by origin office with search
     */
    @Query("SELECT o FROM Order o WHERE o.originOffice.id = :officeId AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(o.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.senderName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.receiverName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.senderPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.receiverPhone) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByOriginOfficeIdWithSearch(@Param("officeId") UUID officeId, 
                                                @Param("search") String search, 
                                                Pageable pageable);

    /**
     * Find orders by current office with search
     */
    @Query("SELECT o FROM Order o WHERE o.currentOffice.id = :officeId AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(o.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.senderName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.receiverName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByCurrentOfficeIdWithSearch(@Param("officeId") UUID officeId,
                                                 @Param("search") String search,
                                                 Pageable pageable);

    /**
     * Find orders by status and current office
     */
    Page<Order> findByStatusAndCurrentOfficeId(OrderStatus status, UUID officeId, Pageable pageable);

    /**
     * Find orders assigned to a shipper
     */
    @Query("SELECT o FROM Order o WHERE o.assignedShipper.id = :shipperId AND " +
           "o.status IN :statuses " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByAssignedShipperIdAndStatusIn(@Param("shipperId") UUID shipperId,
                                                    @Param("statuses") java.util.List<OrderStatus> statuses,
                                                    Pageable pageable);

    /**
     * Count orders by office and status
     */
    long countByOriginOfficeIdAndStatus(UUID officeId, OrderStatus status);

    /**
     * Find orders by province code (for province admin)
     */
    @Query("SELECT o FROM Order o WHERE o.originOffice.province.code = :provinceCode AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(o.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.senderName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.receiverName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByOriginOfficeProvinceCodeWithSearch(@Param("provinceCode") String provinceCode,
                                                          @Param("search") String search,
                                                          Pageable pageable);
}
