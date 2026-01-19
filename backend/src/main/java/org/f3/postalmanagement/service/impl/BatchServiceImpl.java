package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.batch.AddOrdersToBatchRequest;
import org.f3.postalmanagement.dto.request.batch.AutoBatchRequest;
import org.f3.postalmanagement.dto.request.batch.CreateBatchRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.batch.AutoBatchResultResponse;
import org.f3.postalmanagement.dto.response.batch.BatchPackageResponse;
import org.f3.postalmanagement.dto.response.batch.BatchableDestinationsResponse;
import org.f3.postalmanagement.dto.response.order.OrderSummaryResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.order.BatchPackage;
import org.f3.postalmanagement.entity.order.Order;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.BatchStatus;
import org.f3.postalmanagement.enums.OrderStatus;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.exception.BadRequestException;
import org.f3.postalmanagement.exception.ForbiddenException;
import org.f3.postalmanagement.exception.NotFoundException;
import org.f3.postalmanagement.repository.BatchPackageRepository;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.f3.postalmanagement.repository.OrderRepository;
import org.f3.postalmanagement.service.IBatchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of batch service with optimization algorithms
 * for consolidating orders into efficient batch packages.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BatchServiceImpl implements IBatchService {

    private final BatchPackageRepository batchPackageRepository;
    private final OrderRepository orderRepository;
    private final OfficeRepository officeRepository;
    private final EmployeeRepository employeeRepository;

    private static final DateTimeFormatter BATCH_CODE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    // ==================== BATCH CREATION ====================

    @Override
    public BatchPackageResponse createBatch(CreateBatchRequest request, Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);
        Office originOffice = employee.getOffice();

        Office destinationOffice = officeRepository.findById(request.getDestinationOfficeId())
                .orElseThrow(() -> new NotFoundException("Destination office not found"));

        if (originOffice.getId().equals(destinationOffice.getId())) {
            throw new BadRequestException("Origin and destination office cannot be the same");
        }

        BatchPackage batch = new BatchPackage();
        batch.setBatchCode(generateBatchCode(originOffice, destinationOffice));
        batch.setOriginOffice(originOffice);
        batch.setDestinationOffice(destinationOffice);
        batch.setMaxWeightKg(request.getMaxWeightKg());
        batch.setMaxVolumeCm3(request.getMaxVolumeCm3());
        batch.setMaxOrderCount(request.getMaxOrderCount());
        batch.setCreatedByEmployee(employee);
        batch.setNotes(request.getNotes());
        batch.setStatus(BatchStatus.OPEN);

        batch = batchPackageRepository.save(batch);
        log.info("Created batch {} from {} to {}", batch.getBatchCode(),
                originOffice.getOfficeName(), destinationOffice.getOfficeName());

        return mapToBatchResponse(batch, false);
    }

    @Override
    public AutoBatchResultResponse autoBatchOrders(AutoBatchRequest request, Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);
        Office originOffice = employee.getOffice();

        List<UUID> skippedOrderIds = new ArrayList<>();
        List<String> skipReasons = new ArrayList<>();
        Map<UUID, BatchPackage> updatedBatches = new LinkedHashMap<>();
        int newBatchesCreated = 0;
        int existingBatchesUsed = 0;

        // Get unbatched orders at this office
        List<Order> unbatchedOrders = getUnbatchedOrders(originOffice.getId(), request.getDestinationOfficeId());

        if (unbatchedOrders.isEmpty()) {
            return AutoBatchResultResponse.builder()
                    .totalOrdersProcessed(0)
                    .ordersAddedToBatches(0)
                    .ordersSkipped(0)
                    .existingBatchesUsed(0)
                    .newBatchesCreated(0)
                    .batches(Collections.emptyList())
                    .skippedOrderIds(Collections.emptyList())
                    .skipReasons(Collections.emptyList())
                    .build();
        }

        // Group orders by destination office
        Map<UUID, List<Order>> ordersByDestination = unbatchedOrders.stream()
                .filter(o -> o.getDestinationOffice() != null)
                .collect(Collectors.groupingBy(o -> o.getDestinationOffice().getId()));

        // Process each destination
        for (Map.Entry<UUID, List<Order>> entry : ordersByDestination.entrySet()) {
            UUID destinationId = entry.getKey();
            List<Order> orders = entry.getValue();

            // Sort orders by weight (descending) for better bin packing - First Fit Decreasing
            orders.sort((a, b) -> b.getChargeableWeightKg().compareTo(a.getChargeableWeightKg()));

            // Get or create batches for this destination
            List<BatchPackage> availableBatches = batchPackageRepository.findOpenBatchesForRoute(
                    originOffice.getId(), destinationId, Arrays.asList(BatchStatus.OPEN, BatchStatus.PROCESSING));

            for (Order order : orders) {
                // Skip orders that exceed the max batch weight
                if (order.getChargeableWeightKg().compareTo(request.getMaxWeightPerBatch()) > 0) {
                    skippedOrderIds.add(order.getId());
                    skipReasons.add("Order " + order.getTrackingNumber() + " exceeds max batch weight");
                    continue;
                }

                BatchPackage targetBatch = null;

                // First Fit Decreasing Algorithm: Find the first batch that can fit this order
                for (BatchPackage batch : availableBatches) {
                    if (canFitOrder(batch, order, request)) {
                        targetBatch = batch;
                        if (!updatedBatches.containsKey(batch.getId())) {
                            existingBatchesUsed++;
                        }
                        break;
                    }
                }

                // If no existing batch can fit, create a new one
                if (targetBatch == null && request.isCreateNewBatches()) {
                    Office destOffice = officeRepository.findById(destinationId)
                            .orElseThrow(() -> new NotFoundException("Destination office not found"));

                    targetBatch = createNewBatch(originOffice, destOffice, request, employee);
                    availableBatches.add(targetBatch);
                    newBatchesCreated++;
                }

                // Add order to batch
                if (targetBatch != null) {
                    addOrderToBatch(targetBatch, order);
                    updatedBatches.put(targetBatch.getId(), targetBatch);
                } else {
                    skippedOrderIds.add(order.getId());
                    skipReasons.add("No available batch for order " + order.getTrackingNumber());
                }
            }
        }

        // Save all updated batches
        batchPackageRepository.saveAll(updatedBatches.values());
        orderRepository.saveAll(unbatchedOrders.stream()
                .filter(o -> o.getBatchPackage() != null)
                .collect(Collectors.toList()));

        // Build result
        List<AutoBatchResultResponse.BatchSummary> batchSummaries = updatedBatches.values().stream()
                .map(b -> AutoBatchResultResponse.BatchSummary.builder()
                        .id(b.getId())
                        .batchCode(b.getBatchCode())
                        .destinationOfficeName(b.getDestinationOffice().getOfficeName())
                        .orderCount(b.getCurrentOrderCount())
                        .isNew(b.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(1)))
                        .build())
                .collect(Collectors.toList());

        int ordersAdded = unbatchedOrders.size() - skippedOrderIds.size();
        log.info("Auto-batched {} orders into {} batches ({} new, {} existing) at office {}",
                ordersAdded, updatedBatches.size(), newBatchesCreated, existingBatchesUsed,
                originOffice.getOfficeName());

        return AutoBatchResultResponse.builder()
                .totalOrdersProcessed(unbatchedOrders.size())
                .ordersAddedToBatches(ordersAdded)
                .ordersSkipped(skippedOrderIds.size())
                .existingBatchesUsed(existingBatchesUsed)
                .newBatchesCreated(newBatchesCreated)
                .batches(batchSummaries)
                .skippedOrderIds(skippedOrderIds)
                .skipReasons(skipReasons)
                .build();
    }

    // ==================== BATCH OPERATIONS ====================

    @Override
    public BatchPackageResponse addOrdersToBatch(AddOrdersToBatchRequest request, Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);
        
        BatchPackage batch = batchPackageRepository.findById(request.getBatchId())
                .orElseThrow(() -> new NotFoundException("Batch not found"));

        validateBatchAccess(batch, employee, true);

        if (batch.getStatus() != BatchStatus.OPEN && batch.getStatus() != BatchStatus.PROCESSING) {
            throw new BadRequestException("Cannot add orders to a " + batch.getStatus() + " batch");
        }

        List<Order> orders = orderRepository.findAllById(request.getOrderIds());
        if (orders.size() != request.getOrderIds().size()) {
            throw new NotFoundException("Some orders were not found");
        }

        for (Order order : orders) {
            // Validate order can be added
            if (order.getBatchPackage() != null) {
                throw new BadRequestException("Order " + order.getTrackingNumber() + " is already in a batch");
            }
            if (!order.getDestinationOffice().getId().equals(batch.getDestinationOffice().getId())) {
                throw new BadRequestException("Order " + order.getTrackingNumber() +
                        " has different destination than batch");
            }
            if (!order.getOriginOffice().getId().equals(batch.getOriginOffice().getId())) {
                throw new BadRequestException("Order " + order.getTrackingNumber() +
                        " is from different origin office");
            }
            if (!canFitOrderInBatch(batch, order)) {
                throw new BadRequestException("Order " + order.getTrackingNumber() +
                        " exceeds batch capacity");
            }

            addOrderToBatch(batch, order);
        }

        batch.setStatus(BatchStatus.PROCESSING);
        batch = batchPackageRepository.save(batch);
        orderRepository.saveAll(orders);

        log.info("Added {} orders to batch {}", orders.size(), batch.getBatchCode());
        return mapToBatchResponse(batch, true);
    }

    @Override
    public BatchPackageResponse removeOrderFromBatch(UUID batchId, UUID orderId, Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);

        BatchPackage batch = batchPackageRepository.findById(batchId)
                .orElseThrow(() -> new NotFoundException("Batch not found"));

        validateBatchAccess(batch, employee, true);

        if (batch.getStatus() != BatchStatus.OPEN && batch.getStatus() != BatchStatus.PROCESSING) {
            throw new BadRequestException("Cannot remove orders from a " + batch.getStatus() + " batch");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (order.getBatchPackage() == null || !order.getBatchPackage().getId().equals(batchId)) {
            throw new BadRequestException("Order is not in this batch");
        }

        removeOrderFromBatchInternal(batch, order);
        order.setStatus(OrderStatus.AT_ORIGIN_OFFICE);

        batchPackageRepository.save(batch);
        orderRepository.save(order);

        log.info("Removed order {} from batch {}", order.getTrackingNumber(), batch.getBatchCode());
        return mapToBatchResponse(batch, true);
    }

    @Override
    public BatchPackageResponse sealBatch(UUID batchId, Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);

        BatchPackage batch = batchPackageRepository.findById(batchId)
                .orElseThrow(() -> new NotFoundException("Batch not found"));

        validateBatchAccess(batch, employee, true);

        if (batch.getStatus() != BatchStatus.OPEN && batch.getStatus() != BatchStatus.PROCESSING) {
            throw new BadRequestException("Can only seal OPEN or PROCESSING batches");
        }

        if (batch.getCurrentOrderCount() == 0) {
            throw new BadRequestException("Cannot seal an empty batch");
        }

        batch.setStatus(BatchStatus.SEALED);
        batch.setSealedAt(LocalDateTime.now());
        batch.setSealedByEmployee(employee);

        // Update all orders status
        for (Order order : batch.getOrders()) {
            order.setStatus(OrderStatus.SORTED_AT_ORIGIN);
        }

        batch = batchPackageRepository.save(batch);
        orderRepository.saveAll(batch.getOrders());
        log.info("Sealed batch {} with {} orders", batch.getBatchCode(), batch.getCurrentOrderCount());

        return mapToBatchResponse(batch, false);
    }

    @Override
    public BatchPackageResponse markBatchInTransit(UUID batchId, Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);

        BatchPackage batch = batchPackageRepository.findById(batchId)
                .orElseThrow(() -> new NotFoundException("Batch not found"));

        validateBatchAccess(batch, employee, true);

        if (batch.getStatus() != BatchStatus.SEALED) {
            throw new BadRequestException("Can only mark SEALED batches as in transit");
        }

        batch.setStatus(BatchStatus.IN_TRANSIT);
        batch.setDepartedAt(LocalDateTime.now());

        // Update all orders status
        for (Order order : batch.getOrders()) {
            order.setStatus(OrderStatus.IN_TRANSIT_TO_HUB);
        }

        batch = batchPackageRepository.save(batch);
        orderRepository.saveAll(batch.getOrders());
        log.info("Batch {} departed for {}", batch.getBatchCode(),
                batch.getDestinationOffice().getOfficeName());

        return mapToBatchResponse(batch, false);
    }

    @Override
    public BatchPackageResponse markBatchArrived(UUID batchId, Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);

        BatchPackage batch = batchPackageRepository.findById(batchId)
                .orElseThrow(() -> new NotFoundException("Batch not found"));

        // For arrival, the destination office staff should be able to mark it
        if (!batch.getDestinationOffice().getId().equals(employee.getOffice().getId())) {
            throw new ForbiddenException("Only destination office staff can mark batch as arrived");
        }

        if (batch.getStatus() != BatchStatus.IN_TRANSIT) {
            throw new BadRequestException("Can only mark IN_TRANSIT batches as arrived");
        }

        batch.setStatus(BatchStatus.ARRIVED);
        batch.setArrivedAt(LocalDateTime.now());

        // Update all orders - they are now at destination office
        for (Order order : batch.getOrders()) {
            order.setCurrentOffice(batch.getDestinationOffice());
            order.setStatus(OrderStatus.AT_DESTINATION_OFFICE);
        }

        batch = batchPackageRepository.save(batch);
        orderRepository.saveAll(batch.getOrders());
        log.info("Batch {} arrived at {}", batch.getBatchCode(),
                batch.getDestinationOffice().getOfficeName());

        return mapToBatchResponse(batch, false);
    }

    @Override
    public BatchPackageResponse distributeBatch(UUID batchId, Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);

        BatchPackage batch = batchPackageRepository.findById(batchId)
                .orElseThrow(() -> new NotFoundException("Batch not found"));

        if (!batch.getDestinationOffice().getId().equals(employee.getOffice().getId())) {
            throw new ForbiddenException("Only destination office staff can distribute batch");
        }

        if (batch.getStatus() != BatchStatus.ARRIVED) {
            throw new BadRequestException("Can only distribute ARRIVED batches");
        }

        batch.setStatus(BatchStatus.DISTRIBUTED);

        // Remove orders from batch and mark as out for delivery
        for (Order order : batch.getOrders()) {
            order.setBatchPackage(null);
            order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        }

        batch = batchPackageRepository.save(batch);
        orderRepository.saveAll(batch.getOrders());
        log.info("Batch {} distributed at {}", batch.getBatchCode(),
                batch.getDestinationOffice().getOfficeName());

        return mapToBatchResponse(batch, false);
    }

    @Override
    public BatchPackageResponse cancelBatch(UUID batchId, Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);

        BatchPackage batch = batchPackageRepository.findById(batchId)
                .orElseThrow(() -> new NotFoundException("Batch not found"));

        validateBatchAccess(batch, employee, true);

        if (batch.getStatus() == BatchStatus.IN_TRANSIT ||
            batch.getStatus() == BatchStatus.ARRIVED ||
            batch.getStatus() == BatchStatus.DISTRIBUTED) {
            throw new BadRequestException("Cannot cancel a batch that is already in transit or delivered");
        }

        batch.setStatus(BatchStatus.CANCELLED);

        // Release all orders back to unbatched state
        for (Order order : batch.getOrders()) {
            order.setBatchPackage(null);
            order.setStatus(OrderStatus.AT_ORIGIN_OFFICE);
        }
        batch.setCurrentOrderCount(0);
        batch.setCurrentWeightKg(BigDecimal.ZERO);
        batch.setCurrentVolumeCm3(BigDecimal.ZERO);

        batch = batchPackageRepository.save(batch);
        orderRepository.saveAll(batch.getOrders());
        log.info("Cancelled batch {}", batch.getBatchCode());

        return mapToBatchResponse(batch, false);
    }

    // ==================== BATCH QUERIES ====================

    @Override
    @Transactional(readOnly = true)
    public BatchPackageResponse getBatchById(UUID batchId, boolean includeOrders, Account currentAccount) {
        getEmployeeFromAccount(currentAccount); // Verify access

        BatchPackage batch = batchPackageRepository.findById(batchId)
                .orElseThrow(() -> new NotFoundException("Batch not found"));

        return mapToBatchResponse(batch, includeOrders);
    }

    @Override
    @Transactional(readOnly = true)
    public BatchPackageResponse getBatchByCode(String batchCode, boolean includeOrders, Account currentAccount) {
        getEmployeeFromAccount(currentAccount); // Verify access

        BatchPackage batch = batchPackageRepository.findByBatchCode(batchCode)
                .orElseThrow(() -> new NotFoundException("Batch not found"));

        return mapToBatchResponse(batch, includeOrders);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BatchPackageResponse> getBatchesByOriginOffice(BatchStatus status, Pageable pageable, 
                                                                        Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);
        UUID officeId = employee.getOffice().getId();

        Page<BatchPackage> page;
        if (status != null) {
            page = batchPackageRepository.findByOriginOfficeIdAndStatus(officeId, status, pageable);
        } else {
            page = batchPackageRepository.findByOriginOfficeId(officeId, pageable);
        }

        return mapToPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BatchPackageResponse> getIncomingBatches(BatchStatus status, Pageable pageable, 
                                                                  Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);
        UUID officeId = employee.getOffice().getId();

        Page<BatchPackage> page = batchPackageRepository.findByDestinationOfficeId(officeId, pageable);

        // Filter by status if provided
        if (status != null) {
            List<BatchPackageResponse> filtered = page.getContent().stream()
                    .filter(b -> b.getStatus() == status)
                    .map(b -> mapToBatchResponse(b, false))
                    .collect(Collectors.toList());

            return PageResponse.<BatchPackageResponse>builder()
                    .content(filtered)
                    .pageNumber(page.getNumber())
                    .pageSize(page.getSize())
                    .totalElements(filtered.size())
                    .totalPages(1)
                    .first(true)
                    .last(true)
                    .hasNext(false)
                    .hasPrevious(false)
                    .build();
        }

        return mapToPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public BatchableDestinationsResponse getDestinationsWithUnbatchedOrders(Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);
        UUID officeId = employee.getOffice().getId();

        List<Office> destinations = batchPackageRepository.findDestinationsWithUnbatchedOrders(officeId);

        List<BatchableDestinationsResponse.DestinationInfo> destinationInfos = destinations.stream()
                .map(dest -> {
                    List<Order> unbatched = getUnbatchedOrders(officeId, dest.getId());
                    BigDecimal totalWeight = unbatched.stream()
                            .map(Order::getChargeableWeightKg)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    long openBatchCount = batchPackageRepository.countByOriginOfficeIdAndStatus(
                            officeId, BatchStatus.OPEN);

                    return BatchableDestinationsResponse.DestinationInfo.builder()
                            .officeId(dest.getId())
                            .officeName(dest.getOfficeName())
                            .province(dest.getProvince() != null ? dest.getProvince().getName() : null)
                            .unbatchedOrderCount((long) unbatched.size())
                            .totalWeight(totalWeight)
                            .openBatchCount(openBatchCount)
                            .build();
                })
                .collect(Collectors.toList());

        return BatchableDestinationsResponse.builder()
                .originOfficeId(officeId)
                .destinations(destinationInfos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BatchPackageResponse> getOpenBatches(Pageable pageable, Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);
        UUID officeId = employee.getOffice().getId();

        Page<BatchPackage> page = batchPackageRepository.findByOriginOfficeIdAndStatus(
                officeId, BatchStatus.OPEN, pageable);

        return mapToPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> getUnbatchedOrders(UUID destinationOfficeId, Account currentAccount) {
        Employee employee = getEmployeeFromAccount(currentAccount);
        UUID originOfficeId = employee.getOffice().getId();

        List<Order> unbatched = getUnbatchedOrders(originOfficeId, destinationOfficeId);
        
        return unbatched.stream()
                .map(this::mapToOrderSummary)
                .collect(Collectors.toList());
    }

    // ==================== HELPER METHODS ====================

    private Employee getEmployeeFromAccount(Account account) {
        if (account.getRole() == Role.CUSTOMER) {
            throw new ForbiddenException("Customers cannot access batch operations");
        }
        return employeeRepository.findById(account.getId())
                .orElseThrow(() -> new NotFoundException("Employee not found"));
    }

    private void validateBatchAccess(BatchPackage batch, Employee employee, boolean requireOrigin) {
        if (requireOrigin && !batch.getOriginOffice().getId().equals(employee.getOffice().getId())) {
            throw new ForbiddenException("You don't have access to this batch");
        }
    }

    private String generateBatchCode(Office origin, Office destination) {
        String timestamp = LocalDateTime.now().format(BATCH_CODE_FORMATTER);
        String originCode = origin.getId().toString().substring(0, 4).toUpperCase();
        String destCode = destination.getId().toString().substring(0, 4).toUpperCase();
        return String.format("BATCH-%s-%s-%s", originCode, destCode, timestamp);
    }

    private List<Order> getUnbatchedOrders(UUID originOfficeId, UUID destinationOfficeId) {
        // Get orders that are at origin, not batched, and ready for transit
        List<OrderStatus> validStatuses = Arrays.asList(
                OrderStatus.AT_ORIGIN_OFFICE,
                OrderStatus.SORTED_AT_ORIGIN
        );

        return orderRepository.findUnbatchedOrders(originOfficeId, destinationOfficeId, validStatuses);
    }

    private boolean canFitOrder(BatchPackage batch, Order order, AutoBatchRequest request) {
        // Check weight capacity
        BigDecimal newWeight = batch.getCurrentWeightKg().add(order.getChargeableWeightKg());
        if (newWeight.compareTo(batch.getMaxWeightKg()) > 0) {
            return false;
        }

        // Check order count
        if (batch.getMaxOrderCount() != null && batch.getCurrentOrderCount() >= batch.getMaxOrderCount()) {
            return false;
        }

        // Check volume if applicable
        if (batch.getMaxVolumeCm3() != null && order.getLengthCm() != null) {
            BigDecimal orderVolume = calculateVolume(order);
            if (orderVolume != null) {
                BigDecimal newVolume = batch.getCurrentVolumeCm3().add(orderVolume);
                if (newVolume.compareTo(batch.getMaxVolumeCm3()) > 0) {
                    return false;
                }
            }
        }

        return true;
    }

    private boolean canFitOrderInBatch(BatchPackage batch, Order order) {
        BigDecimal newWeight = batch.getCurrentWeightKg().add(order.getChargeableWeightKg());
        if (newWeight.compareTo(batch.getMaxWeightKg()) > 0) {
            return false;
        }
        if (batch.getMaxOrderCount() != null && batch.getCurrentOrderCount() >= batch.getMaxOrderCount()) {
            return false;
        }
        return true;
    }

    private BatchPackage createNewBatch(Office origin, Office destination, AutoBatchRequest request, Employee employee) {
        BatchPackage batch = new BatchPackage();
        batch.setBatchCode(generateBatchCode(origin, destination));
        batch.setOriginOffice(origin);
        batch.setDestinationOffice(destination);
        batch.setMaxWeightKg(request.getMaxWeightPerBatch());
        batch.setMaxVolumeCm3(request.getMaxVolumePerBatch());
        batch.setMaxOrderCount(request.getMaxOrdersPerBatch());
        batch.setCreatedByEmployee(employee);
        batch.setStatus(BatchStatus.OPEN);

        return batchPackageRepository.save(batch);
    }

    private void addOrderToBatch(BatchPackage batch, Order order) {
        order.setBatchPackage(batch);
        
        // Update batch counters
        batch.setCurrentOrderCount(batch.getCurrentOrderCount() + 1);
        batch.setCurrentWeightKg(batch.getCurrentWeightKg().add(order.getChargeableWeightKg()));

        // Update volume if available
        BigDecimal orderVolume = calculateVolume(order);
        if (orderVolume != null && batch.getCurrentVolumeCm3() != null) {
            batch.setCurrentVolumeCm3(batch.getCurrentVolumeCm3().add(orderVolume));
        }
    }

    private void removeOrderFromBatchInternal(BatchPackage batch, Order order) {
        order.setBatchPackage(null);

        // Update batch counters
        batch.setCurrentOrderCount(batch.getCurrentOrderCount() - 1);
        batch.setCurrentWeightKg(batch.getCurrentWeightKg().subtract(order.getChargeableWeightKg()));

        // Update volume if available
        BigDecimal orderVolume = calculateVolume(order);
        if (orderVolume != null && batch.getCurrentVolumeCm3() != null) {
            batch.setCurrentVolumeCm3(batch.getCurrentVolumeCm3().subtract(orderVolume));
        }
    }

    private BigDecimal calculateVolume(Order order) {
        if (order.getLengthCm() != null && order.getWidthCm() != null && order.getHeightCm() != null) {
            return order.getLengthCm()
                    .multiply(order.getWidthCm())
                    .multiply(order.getHeightCm());
        }
        return null;
    }

    private BatchPackageResponse mapToBatchResponse(BatchPackage batch, boolean includeOrders) {
        BatchPackageResponse.BatchPackageResponseBuilder builder = BatchPackageResponse.builder()
                .id(batch.getId())
                .batchCode(batch.getBatchCode())
                .status(batch.getStatus())
                .originOffice(BatchPackageResponse.OfficeInfo.builder()
                        .id(batch.getOriginOffice().getId())
                        .name(batch.getOriginOffice().getOfficeName())
                        .addressLine1(batch.getOriginOffice().getOfficeAddressLine1())
                        .province(batch.getOriginOffice().getProvince() != null ?
                                batch.getOriginOffice().getProvince().getName() : null)
                        .build())
                .destinationOffice(BatchPackageResponse.OfficeInfo.builder()
                        .id(batch.getDestinationOffice().getId())
                        .name(batch.getDestinationOffice().getOfficeName())
                        .addressLine1(batch.getDestinationOffice().getOfficeAddressLine1())
                        .province(batch.getDestinationOffice().getProvince() != null ?
                                batch.getDestinationOffice().getProvince().getName() : null)
                        .build())
                .maxWeightKg(batch.getMaxWeightKg())
                .maxVolumeCm3(batch.getMaxVolumeCm3())
                .maxOrderCount(batch.getMaxOrderCount())
                .currentWeightKg(batch.getCurrentWeightKg())
                .currentVolumeCm3(batch.getCurrentVolumeCm3())
                .currentOrderCount(batch.getCurrentOrderCount())
                .remainingWeightKg(batch.getRemainingWeightCapacity())
                .weightFillPercentage(batch.getWeightFillPercentage())
                .orderCountFillPercentage(batch.getOrderCountFillPercentage())
                .createdAt(batch.getCreatedAt())
                .sealedAt(batch.getSealedAt())
                .departedAt(batch.getDepartedAt())
                .arrivedAt(batch.getArrivedAt())
                .notes(batch.getNotes());

        if (batch.getCreatedByEmployee() != null) {
            builder.createdByEmployeeName(batch.getCreatedByEmployee().getFullName());
        }
        if (batch.getSealedByEmployee() != null) {
            builder.sealedByEmployeeName(batch.getSealedByEmployee().getFullName());
        }

        if (includeOrders && batch.getOrders() != null) {
            List<OrderSummaryResponse> orderSummaries = batch.getOrders().stream()
                    .map(this::mapToOrderSummary)
                    .collect(Collectors.toList());
            builder.orders(orderSummaries);
        }

        return builder.build();
    }

    private OrderSummaryResponse mapToOrderSummary(Order order) {
        BigDecimal volume = calculateVolume(order);

        return OrderSummaryResponse.builder()
                .id(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .status(order.getStatus())
                .senderName(order.getSenderName())
                .receiverName(order.getReceiverName())
                .receiverAddressLine1(order.getReceiverAddressLine1())
                .packageType(order.getPackageType())
                .serviceType(order.getServiceType())
                .chargeableWeightKg(order.getChargeableWeightKg())
                .volumeCm3(volume)
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .estimatedDeliveryDate(order.getEstimatedDeliveryDate())
                .build();
    }

    private PageResponse<BatchPackageResponse> mapToPageResponse(Page<BatchPackage> page) {
        List<BatchPackageResponse> content = page.getContent().stream()
                .map(b -> mapToBatchResponse(b, false))
                .collect(Collectors.toList());

        return PageResponse.<BatchPackageResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
