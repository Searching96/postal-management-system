package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.employee.CreateWardManagerEmployeeRequest;
import org.f3.postalmanagement.dto.request.employee.CreateWardStaffRequest;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.entity.actor.Account;

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
}
