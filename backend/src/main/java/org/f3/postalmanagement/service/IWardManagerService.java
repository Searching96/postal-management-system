package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.employee.UpdateStaffRequest;
import org.f3.postalmanagement.dto.request.employee.ward.CreateWardManagerEmployeeRequest;
import org.f3.postalmanagement.dto.request.employee.ward.CreateWardStaffRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IWardManagerService {

    /**
     * Create a new Staff by Ward Manager.
     * The staff will be created in the same office as the Ward Manager.
     * 
     * PO_WARD_MANAGER creates PO_STAFF in the same WARD_POST.
     * WH_WARD_MANAGER creates WH_STAFF in the same WARD_WAREHOUSE.
     *
     * @param request the staff creation request
     * @param currentAccount the account of the user making the request
     * @return the created employee response
     */
    EmployeeResponse createStaff(CreateWardStaffRequest request, Account currentAccount);

    /**
     * Create a new Ward Manager by existing Ward Manager.
     * The new ward manager will be created in the same office as the current Ward Manager.
     * 
     * PO_WARD_MANAGER creates PO_WARD_MANAGER in the same WARD_POST.
     * WH_WARD_MANAGER creates WH_WARD_MANAGER in the same WARD_WAREHOUSE.
     *
     * @param request the ward manager creation request
     * @param currentAccount the account of the user making the request
     * @return the created employee response
     */
    EmployeeResponse createWardManager(CreateWardManagerEmployeeRequest request, Account currentAccount);

    /**
     * Get all staff in the current manager's office with pagination and search.
     *
     * @param search optional search term for name, phone, or email
     * @param pageable pagination parameters
     * @param currentAccount the account of the user making the request
     * @return paginated employee response
     */
    PageResponse<EmployeeResponse> getStaffByOffice(String search, Pageable pageable, Account currentAccount);

    /**
     * Get a staff by ID (must be in the same office).
     *
     * @param staffId the staff ID
     * @param currentAccount the account of the user making the request
     * @return the employee response
     */
    EmployeeResponse getStaffById(UUID staffId, Account currentAccount);

    /**
     * Update a staff by ID (must be in the same office).
     *
     * @param staffId the staff ID
     * @param request the update request
     * @param currentAccount the account of the user making the request
     * @return the updated employee response
     */
    EmployeeResponse updateStaff(UUID staffId, UpdateStaffRequest request, Account currentAccount);

    /**
     * Delete a staff by ID (must be in the same office).
     * This is a soft delete.
     *
     * @param staffId the staff ID
     * @param currentAccount the account of the user making the request
     */
    void deleteStaff(UUID staffId, Account currentAccount);
}
