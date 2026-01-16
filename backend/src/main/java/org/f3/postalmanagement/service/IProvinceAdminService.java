package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.employee.UpdateStaffRequest;
import org.f3.postalmanagement.dto.request.employee.province.CreateProvinceAdminRequest;
import org.f3.postalmanagement.dto.request.employee.province.CreateStaffRequest;
import org.f3.postalmanagement.dto.request.employee.province.CreateWardManagerRequest;
import org.f3.postalmanagement.dto.request.office.AssignWardsRequest;
import org.f3.postalmanagement.dto.request.office.CreateWardOfficeRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.dto.response.office.OfficeResponse;
import org.f3.postalmanagement.dto.response.office.WardOfficePairResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface IProvinceAdminService {

    /**
     * Create a new Province Admin by another Province Admin.
     * 
     * PO_PROVINCE_ADMIN can create PO_PROVINCE_ADMIN (to manage PROVINCE_POST)
     * WH_PROVINCE_ADMIN can create WH_PROVINCE_ADMIN (to manage PROVINCE_WAREHOUSE)
     *
     * @param request the province admin creation request
     * @param currentAccount the account of the user making the request
     * @return the created employee response
     */
    EmployeeResponse createProvinceAdmin(CreateProvinceAdminRequest request, Account currentAccount);

    /**
     * Create a new Ward Manager by Province Admin.
     * 
     * PO_PROVINCE_ADMIN can create PO_WARD_MANAGER (to manage WARD_POST)
     * WH_PROVINCE_ADMIN can create WH_WARD_MANAGER (to manage WARD_WAREHOUSE)
     *
     * @param request the ward manager creation request
     * @param currentAccount the account of the user making the request
     * @return the created employee response
     */
    EmployeeResponse createWardManager(CreateWardManagerRequest request, Account currentAccount);

    /**
     * Create a new Staff by Province Admin.
     * 
     * PO_PROVINCE_ADMIN can create PO_STAFF (to work in PROVINCE_POST or WARD_POST)
     * WH_PROVINCE_ADMIN can create WH_STAFF (to work in PROVINCE_WAREHOUSE or WARD_WAREHOUSE)
     *
     * @param request the staff creation request
     * @param currentAccount the account of the user making the request
     * @return the created employee response
     */
    EmployeeResponse createStaff(CreateStaffRequest request, Account currentAccount);

    /**
     * Create a new ward office pair (WARD_WAREHOUSE + WARD_POST together).
     * Only PO_PROVINCE_ADMIN can create ward offices.
     * WH_PROVINCE_ADMIN cannot create ward offices.
     * The ward offices are created without ward assignment initially.
     *
     * @param request the office pair creation request
     * @param currentAccount the account of the user making the request
     * @return the created office pair response
     */
    WardOfficePairResponse createWardOfficePair(CreateWardOfficeRequest request, Account currentAccount);

    /**
     * Assign wards to a ward office pair.
     * Both WARD_WAREHOUSE and WARD_POST will serve the same wards.
     * Only PO_PROVINCE_ADMIN can assign wards.
     *
     * @param request the ward assignment request
     * @param currentAccount the account of the user making the request
     * @return the updated office pair response
     */
    WardOfficePairResponse assignWardsToOfficePair(AssignWardsRequest request, Account currentAccount);

    /**
     * Get all ward office pairs under the province admin's jurisdiction.
     *
     * @param currentAccount the account of the user making the request
     * @return list of ward office pairs
     */
    List<WardOfficePairResponse> getWardOfficePairs(Account currentAccount);

    /**
     * Get a specific ward office pair by office pair ID.
     *
     * @param officePairId the office pair ID
     * @param currentAccount the account of the user making the request
     * @return the office pair response
     */
    WardOfficePairResponse getWardOfficePairById(UUID officePairId, Account currentAccount);

    /**
     * Get all wards available for assignment within the province.
     *
     * @param currentAccount the account of the user making the request
     * @param provinceCode the province code (optional, uses current user's province if not provided)
     * @return list of wards with their assignment status
     */
    List<WardAssignmentInfo> getAvailableWardsForAssignment(Account currentAccount, String provinceCode);

    /**
     * Get all staff in the current admin's office with pagination and search.
     *
     * @param search optional search term for name, phone, or email
     * @param pageable pagination parameters
     * @param currentAccount the account of the user making the request
     * @return paginated employee response
     */
    PageResponse<EmployeeResponse> getStaffByOffice(String search, Pageable pageable, Account currentAccount);

    /**
     * Get a staff by ID (must be in the same office or within province jurisdiction).
     *
     * @param staffId the staff ID
     * @param currentAccount the account of the user making the request
     * @return the employee response
     */
    EmployeeResponse getStaffById(UUID staffId, Account currentAccount);

    /**
     * Update a staff by ID (must be in the same office or within province jurisdiction).
     *
     * @param staffId the staff ID
     * @param request the update request
     * @param currentAccount the account of the user making the request
     * @return the updated employee response
     */
    EmployeeResponse updateStaff(UUID staffId, UpdateStaffRequest request, Account currentAccount);

    /**
     * Delete a staff by ID (must be in the same office or within province jurisdiction).
     * This is a soft delete.
     *
     * @param staffId the staff ID
     * @param currentAccount the account of the user making the request
     */
    void deleteStaff(UUID staffId, Account currentAccount);

    /**
     * Get all ward offices (WARD_WAREHOUSE and WARD_POST) in the province with pagination and search.
     *
     * @param search optional search term for office name or email
     * @param pageable pagination parameters
     * @param currentAccount the account of the user making the request
     * @return paginated office response
     */
    PageResponse<OfficeResponse> getWardOfficesByProvince(String search, Pageable pageable, Account currentAccount);

    /**
     * DTO for ward assignment information
     */
    record WardAssignmentInfo(
            String wardCode,
            String wardName,
            boolean isAssigned,
            UUID assignedWarehouseId,
            UUID assignedPostOfficeId
    ) {}
}
