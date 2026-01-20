package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.order.Order;
import org.f3.postalmanagement.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
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
           "(:status IS NULL OR o.status = :status) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(o.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.senderName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.receiverName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.senderPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.receiverPhone) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByOriginOfficeIdWithSearch(@Param("officeId") UUID officeId, 
                                                @Param("search") String search, 
                                                @Param("status") OrderStatus status,
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
    @Query("SELECT o FROM Order o WHERE o.originOffice.ward.province.code = :provinceCode AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(o.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.senderName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.receiverName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByOriginOfficeProvinceCodeWithSearch(@Param("provinceCode") String provinceCode,
                                                          @Param("search") String search,
                                                          Pageable pageable);

    /**
     * Find pending pickup orders (created by customer online, awaiting shipper assignment)
     */
    @Query("SELECT o FROM Order o WHERE o.originOffice.id = :officeId AND " +
           "o.status = org.f3.postalmanagement.enums.OrderStatus.PENDING_PICKUP AND " +
           "o.assignedShipper IS NULL " +
           "ORDER BY o.createdAt ASC")
    Page<Order> findPendingPickupOrdersByOfficeId(@Param("officeId") UUID officeId, Pageable pageable);

    /**
     * Find orders assigned to shipper for pickup
     */
    @Query("SELECT o FROM Order o WHERE o.assignedShipper.id = :shipperId AND " +
           "o.status = org.f3.postalmanagement.enums.OrderStatus.PENDING_PICKUP " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findAssignedPickupOrders(@Param("shipperId") UUID shipperId, Pageable pageable);

    /**
     * Find unbatched orders at an office that are ready for batching
     */
    @Query("SELECT o FROM Order o WHERE o.originOffice.id = :originOfficeId AND " +
           "o.batchPackage IS NULL AND " +
           "o.status IN :statuses AND " +
           "(:destinationOfficeId IS NULL OR o.destinationOffice.id = :destinationOfficeId) " +
           "ORDER BY o.chargeableWeightKg DESC")
    java.util.List<Order> findUnbatchedOrders(@Param("originOfficeId") UUID originOfficeId,
                                               @Param("destinationOfficeId") UUID destinationOfficeId,
                                               @Param("statuses") java.util.List<OrderStatus> statuses);

    /**
     * Count unbatched orders for a destination
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.originOffice.id = :originOfficeId AND " +
           "o.batchPackage IS NULL AND " +
           "o.destinationOffice.id = :destinationOfficeId AND " +
           "o.status IN :statuses")
    long countUnbatchedOrdersForDestination(@Param("originOfficeId") UUID originOfficeId,
                                             @Param("destinationOfficeId") UUID destinationOfficeId,
                                             @Param("statuses") java.util.List<OrderStatus> statuses);
    /**
     * Find orders assigned to a shipper for delivery (last mile)
     */
    @Query("SELECT o FROM Order o WHERE o.assignedShipper.account = :account AND " +
           "o.status = :status " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByAssignedShipperAccountAndStatus(@Param("account") org.f3.postalmanagement.entity.actor.Account account,
                                                       @Param("status") OrderStatus status,
                                                       Pageable pageable);

    /**
     * Find orders assigned to a shipper for delivery (last mile) with search
     */
    @Query("SELECT o FROM Order o WHERE o.assignedShipper.account = :account AND " +
           "o.status = :status AND " +
           "(LOWER(o.trackingNumber) LIKE LOWER(:search) OR " +
           "LOWER(o.receiverName) LIKE LOWER(:search) OR " +
           "LOWER(o.receiverPhone) LIKE LOWER(:search) OR " +
           "LOWER(o.receiverAddressLine1) LIKE LOWER(:search)) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByAssignedShipperAccountAndStatusWithSearch(@Param("account") org.f3.postalmanagement.entity.actor.Account account,
                                                                 @Param("status") OrderStatus status,
                                                                 @Param("search") String search,
                                                                 Pageable pageable);

    /**
     * Find orders assigned to shipper for pickup (PENDING_PICKUP) with search
     */
    @Query("SELECT o FROM Order o WHERE o.assignedShipper.id = :shipperId AND " +
           "o.status = org.f3.postalmanagement.enums.OrderStatus.PENDING_PICKUP AND " +
           "(LOWER(o.trackingNumber) LIKE LOWER(:search) OR " +
           "LOWER(o.senderName) LIKE LOWER(:search) OR " +
           "LOWER(o.senderPhone) LIKE LOWER(:search) OR " +
           "LOWER(o.senderAddressLine1) LIKE LOWER(:search)) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findAssignedPickupOrdersWithSearch(@Param("shipperId") UUID shipperId,
                                                   @Param("search") String search,
                                                   Pageable pageable);

    /**
     * Find orders assigned to a consolidation route.
     */
    @Query("SELECT o FROM Order o WHERE o.assignedConsolidationRoute.id = :routeId " +
           "ORDER BY o.createdAt ASC")
    List<Order> findByAssignedConsolidationRouteId(@Param("routeId") UUID routeId);

    /**
     * Find incoming deliveries for a customer (where they are the receiver)
     */
    @Query("SELECT o FROM Order o WHERE o.receiverPhone = :receiverPhone AND " +
           "o.status IN :statuses " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByReceiverPhoneAndStatusIn(@Param("receiverPhone") String receiverPhone,
                                                @Param("statuses") java.util.List<OrderStatus> statuses,
                                                Pageable pageable);
}
