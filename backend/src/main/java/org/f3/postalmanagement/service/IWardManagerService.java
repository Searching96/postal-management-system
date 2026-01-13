package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.employee.CreateWardEmployeeRequest;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.entity.actor.Account;

public interface IWardManagerService {

    /**
     * Create a new employee by Ward Manager.
     * The employee will be created in the same office as the Ward Manager.
     * 
     * PO_WARD_MANAGER can create:
     * - PO_WARD_MANAGER (to manage the same WARD_POST)
     * - PO_STAFF (to work in the same WARD_POST)
     * 
     * WH_WARD_MANAGER can create:
     * - WH_WARD_MANAGER (to manage the same WARD_WAREHOUSE)
     * - WH_STAFF (to work in the same WARD_WAREHOUSE)
     *
     * @param request the employee creation request
     * @param currentAccount the account of the user making the request
     * @return the created employee response
     */
    EmployeeResponse createEmployee(CreateWardEmployeeRequest request, Account currentAccount);
}
