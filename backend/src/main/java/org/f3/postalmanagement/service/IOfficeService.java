package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.office.OfficeStatusUpdateRequest;
import org.f3.postalmanagement.dto.response.office.OfficeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IOfficeService {
    Page<OfficeResponse> searchOffices(String query, Pageable pageable);
    OfficeResponse getOfficeDetails(UUID id);
    OfficeResponse updateOfficeStatus(UUID id, OfficeStatusUpdateRequest request);
}
