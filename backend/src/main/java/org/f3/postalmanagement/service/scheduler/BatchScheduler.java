package org.f3.postalmanagement.service.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.batch.AutoBatchRequest;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.order.BatchPackage;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.BatchStatus;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.repository.BatchPackageRepository;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.f3.postalmanagement.service.IBatchService;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Automatically batches orders and manages batch lifecycle.
 * MVP implementation - simple scheduler for end-to-end order flow.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BatchScheduler {

    private final IBatchService batchService;
    private final BatchPackageRepository batchPackageRepository;
    private final OfficeRepository officeRepository;
    private final EmployeeRepository employeeRepository;

    /**
     * Auto-batch unbatched orders every 5 minutes (MVP setting).
     * In production, this would be more frequent or triggered by thresholds.
     */
    @Scheduled(fixedDelay = 300000, initialDelay = 60000) // 5 min delay, 1 min initial
    @Transactional
    public void autoBatchUnbatchedOrders() {
        try {
            log.debug("Starting auto-batch scheduler");

            // Get all offices (staff will be auto-created from their office)
            List<Office> offices = officeRepository.findAll();

            for (Office origin : offices) {
                // For each origin office, batch to all other offices
                for (Office destination : offices) {
                    if (origin.getId().equals(destination.getId())) {
                        continue; // Skip same origin/destination
                    }

                    try {
                        // Create auto-batch request
                        AutoBatchRequest request = new AutoBatchRequest();
                        request.setDestinationOfficeId(destination.getId());
                        request.setMaxWeightPerBatch(BigDecimal.valueOf(50.0)); // 50 kg default
                        request.setMaxOrdersPerBatch(100);
                        request.setCreateNewBatches(true);

                        // Create system account for scheduler execution
                        Account systemAccount = createSystemAccount(origin);

                        // Execute auto-batch
                        batchService.autoBatchOrders(request, systemAccount);

                    } catch (Exception e) {
                        log.warn("Auto-batch failed for route {} -> {}: {}",
                                origin.getOfficeName(), destination.getOfficeName(), e.getMessage());
                    }
                }
            }

            log.debug("Auto-batch scheduler completed successfully");

        } catch (Exception e) {
            log.error("Auto-batch scheduler failed", e);
        }
    }

    /**
     * Auto-seal batches that are old enough (3+ hours with 5+ orders).
     * Prevents batches from sitting indefinitely in OPEN state.
     */
    @Scheduled(fixedDelay = 600000, initialDelay = 120000) // 10 min delay, 2 min initial
    @Transactional
    public void autoSealReadyBatches() {
        try {
            log.debug("Starting auto-seal scheduler");

            LocalDateTime thresholdTime = LocalDateTime.now().minusHours(3);

            // Find open batches older than 3 hours with 5+ orders
            List<BatchPackage> readyBatches = batchPackageRepository
                    .findOpenBatchesOlderThan(thresholdTime);

            int sealed = 0;
            for (BatchPackage batch : readyBatches) {
                if (batch.getCurrentOrderCount() >= 5) {
                    try {
                        // Create system account for this batch's origin office
                        Account systemAccount = createSystemAccount(batch.getOriginOffice());

                        // Seal the batch
                        batchService.sealBatch(batch.getId(), systemAccount);
                        sealed++;

                    } catch (Exception e) {
                        log.warn("Failed to auto-seal batch {}: {}", batch.getBatchCode(), e.getMessage());
                    }
                }
            }

            if (sealed > 0) {
                log.info("Auto-sealed {} batches", sealed);
            }

        } catch (Exception e) {
            log.error("Auto-seal scheduler failed", e);
        }
    }

    /**
     * Creates a temporary system account for scheduler execution.
     * Uses the first employee of an office with staff role.
     */
    private Account createSystemAccount(Office office) {
        Employee employee = employeeRepository.findByOfficeId(office.getId())
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No employee found for office: " + office.getOfficeName()));

        return employee.getAccount();
    }
}
