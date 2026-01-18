package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.employee.hub.RegisterHubAdminRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.dto.response.office.OfficeResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.springframework.data.domain.Pageable;

public interface IHubAdminService {

    /**
     * Register a new HUB admin.
     * - SYSTEM_ADMIN can register for any HUB
     * - HUB_ADMIN can only register for their own region's HUB
     *
     * @param request the registration request
     * @param currentAccount the account of the user making the request
     * @return the registered employee response
     */
    EmployeeResponse registerHubAdmin(RegisterHubAdminRequest request, Account currentAccount);

    /**
     * Get all province offices (PROVINCE_WAREHOUSE and PROVINCE_POST) in the HUB admin's region.
     *
     * @param search optional search term for office name or email
     * @param pageable pagination parameters
     * @param currentAccount the account of the user making the request
     * @return paginated office response
     */
    PageResponse<OfficeResponse> getProvinceOfficesByRegion(String search, Pageable pageable, Account currentAccount);
}
