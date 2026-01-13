package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.employee.CreateProvinceEmployeeRequest;
import org.f3.postalmanagement.dto.request.office.AssignWardsRequest;
import org.f3.postalmanagement.dto.request.office.CreateWardOfficeRequest;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.dto.response.office.WardOfficePairResponse;
import org.f3.postalmanagement.entity.actor.Account;

import java.util.List;
import java.util.UUID;

public interface IProvinceAdminService {

    /**
     * Create a new employee by Province Admin or System Admin.
     * 
     * PO_PROVINCE_ADMIN can create:
     * - PO_PROVINCE_ADMIN (to manage PROVINCE_POST)
     * - PO_WARD_MANAGER (to manage WARD_POST)
     * - PO_STAFF (to work in WARD_POST)
     * 
     * WH_PROVINCE_ADMIN can create:
     * - WH_PROVINCE_ADMIN (to manage PROVINCE_WAREHOUSE)
     * - WH_WARD_MANAGER (to manage WARD_WAREHOUSE)
     * - WH_STAFF (to work in WARD_WAREHOUSE)
     * 
     * SYSTEM_ADMIN can create any role.
     *
     * @param request the employee creation request
     * @param currentAccount the account of the user making the request
     * @return the created employee response
     */
    EmployeeResponse createEmployee(CreateProvinceEmployeeRequest request, Account currentAccount);

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
     * @param provinceCode the province code (required for SYSTEM_ADMIN, optional for others)
     * @return list of wards with their assignment status
     */
    List<WardAssignmentInfo> getAvailableWardsForAssignment(Account currentAccount, String provinceCode);

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
