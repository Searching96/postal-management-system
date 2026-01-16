package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.employee.CreateShipperRequest;
import org.f3.postalmanagement.dto.request.employee.UpdateStaffRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service for managing shippers.
 * Only HUB_ADMIN, WH_PROVINCE_ADMIN, and WH_WARD_MANAGER can manage shippers.
 */
public interface IShipperService {

    /**
     * Create a new shipper for a warehouse.
     *
     * @param request the shipper creation request
     * @param currentAccount the account of the user making the request
     * @return the created employee response
     */
    EmployeeResponse createShipper(CreateShipperRequest request, Account currentAccount);

    /**
     * Get all shippers accessible by the current user with pagination and search.
     *
     * @param search optional search term for name, phone, or email
     * @param pageable pagination parameters
     * @param currentAccount the account of the user making the request
     * @return paginated employee response
     */
    PageResponse<EmployeeResponse> getShippers(String search, Pageable pageable, Account currentAccount);

    /**
     * Get a shipper by ID.
     *
     * @param shipperId the shipper ID
     * @param currentAccount the account of the user making the request
     * @return the employee response
     */
    EmployeeResponse getShipperById(UUID shipperId, Account currentAccount);

    /**
     * Update a shipper by ID.
     *
     * @param shipperId the shipper ID
     * @param request the update request
     * @param currentAccount the account of the user making the request
     * @return the updated employee response
     */
    EmployeeResponse updateShipper(UUID shipperId, UpdateStaffRequest request, Account currentAccount);

    /**
     * Delete a shipper by ID (soft delete).
     *
     * @param shipperId the shipper ID
     * @param currentAccount the account of the user making the request
     */
    void deleteShipper(UUID shipperId, Account currentAccount);
}
