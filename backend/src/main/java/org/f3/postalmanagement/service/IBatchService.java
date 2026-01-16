package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.batch.AddOrdersToBatchRequest;
import org.f3.postalmanagement.dto.request.batch.AutoBatchRequest;
import org.f3.postalmanagement.dto.request.batch.CreateBatchRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.batch.AutoBatchResultResponse;
import org.f3.postalmanagement.dto.response.batch.BatchPackageResponse;
import org.f3.postalmanagement.dto.response.batch.BatchableDestinationsResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.enums.BatchStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service for managing batch packages and order consolidation.
 * 
 * The system groups orders with the same destination and consolidates them
 * into larger batch packages for efficient transportation using optimization algorithms.
 */
public interface IBatchService {

    // ==================== BATCH CREATION ====================

    /**
     * Create a new batch package manually.
     *
     * @param request the batch creation request
     * @param currentAccount the staff's account
     * @return the created batch
     */
    BatchPackageResponse createBatch(CreateBatchRequest request, Account currentAccount);

    /**
     * Auto-batch orders for a destination using optimization algorithm.
     * Groups orders with the same destination into batches, maximizing
     * the number of orders per batch while respecting weight/volume limits.
     *
     * @param request the auto-batch configuration
     * @param currentAccount the staff's account
     * @return result of the auto-batching operation
     */
    AutoBatchResultResponse autoBatchOrders(AutoBatchRequest request, Account currentAccount);

    // ==================== BATCH OPERATIONS ====================

    /**
     * Add orders to an existing batch manually.
     *
     * @param request the add orders request
     * @param currentAccount the staff's account
     * @return the updated batch
     */
    BatchPackageResponse addOrdersToBatch(AddOrdersToBatchRequest request, Account currentAccount);

    /**
     * Remove an order from a batch.
     *
     * @param batchId the batch ID
     * @param orderId the order ID to remove
     * @param currentAccount the staff's account
     * @return the updated batch
     */
    BatchPackageResponse removeOrderFromBatch(UUID batchId, UUID orderId, Account currentAccount);

    /**
     * Seal a batch (mark it as ready for transit).
     * No more orders can be added after sealing.
     *
     * @param batchId the batch ID
     * @param currentAccount the staff's account
     * @return the sealed batch
     */
    BatchPackageResponse sealBatch(UUID batchId, Account currentAccount);

    /**
     * Mark a batch as in transit.
     *
     * @param batchId the batch ID
     * @param currentAccount the staff's account
     * @return the updated batch
     */
    BatchPackageResponse markBatchInTransit(UUID batchId, Account currentAccount);

    /**
     * Mark a batch as arrived at destination.
     *
     * @param batchId the batch ID
     * @param currentAccount the staff's account (at destination office)
     * @return the updated batch
     */
    BatchPackageResponse markBatchArrived(UUID batchId, Account currentAccount);

    /**
     * Unpack/distribute a batch (mark all orders as ready for next step).
     *
     * @param batchId the batch ID
     * @param currentAccount the staff's account
     * @return the distributed batch
     */
    BatchPackageResponse distributeBatch(UUID batchId, Account currentAccount);

    /**
     * Cancel a batch and release all orders back to unbatched state.
     *
     * @param batchId the batch ID
     * @param currentAccount the staff's account
     * @return the cancelled batch
     */
    BatchPackageResponse cancelBatch(UUID batchId, Account currentAccount);

    // ==================== BATCH QUERIES ====================

    /**
     * Get batch details by ID.
     *
     * @param batchId the batch ID
     * @param includeOrders whether to include order list
     * @param currentAccount the staff's account
     * @return the batch details
     */
    BatchPackageResponse getBatchById(UUID batchId, boolean includeOrders, Account currentAccount);

    /**
     * Get batch by batch code.
     *
     * @param batchCode the batch code
     * @param includeOrders whether to include order list
     * @param currentAccount the staff's account
     * @return the batch details
     */
    BatchPackageResponse getBatchByCode(String batchCode, boolean includeOrders, Account currentAccount);

    /**
     * Get batches at the current staff's office (origin).
     *
     * @param status optional status filter
     * @param pageable pagination parameters
     * @param currentAccount the staff's account
     * @return paginated batch list
     */
    PageResponse<BatchPackageResponse> getBatchesByOriginOffice(BatchStatus status, Pageable pageable, Account currentAccount);

    /**
     * Get incoming batches for the current staff's office (destination).
     *
     * @param status optional status filter
     * @param pageable pagination parameters
     * @param currentAccount the staff's account
     * @return paginated batch list
     */
    PageResponse<BatchPackageResponse> getIncomingBatches(BatchStatus status, Pageable pageable, Account currentAccount);

    /**
     * Get destinations with unbatched orders (for batch planning).
     *
     * @param currentAccount the staff's account
     * @return list of destinations with pending orders
     */
    BatchableDestinationsResponse getDestinationsWithUnbatchedOrders(Account currentAccount);

    /**
     * Get open batches at the current office (for adding orders).
     *
     * @param currentAccount the staff's account
     * @return list of open batches
     */
    PageResponse<BatchPackageResponse> getOpenBatches(Pageable pageable, Account currentAccount);
}
