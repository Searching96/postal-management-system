package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.office.OfficeStatusUpdateRequest;
import org.f3.postalmanagement.dto.response.office.OfficeResponse;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.exception.NotFoundException;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.f3.postalmanagement.service.IOfficeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OfficeServiceImpl implements IOfficeService {

    private final OfficeRepository officeRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<OfficeResponse> searchOffices(String query, String type, Pageable pageable) {
        Page<Office> offices;

        // If type filter is provided, use it
        if (type != null && !type.isBlank()) {
            try {
                OfficeType officeType = OfficeType.valueOf(type);
                if (query == null || query.isBlank()) {
                    offices = officeRepository.findByOfficeType(officeType, pageable);
                } else {
                    offices = officeRepository.searchOfficesByTypeAndQuery(query, officeType, pageable);
                }
            } catch (IllegalArgumentException e) {
                // Invalid type provided, return empty
                return Page.empty(pageable);
            }
        } else {
            // No type filter
            if (query == null || query.isBlank()) {
                offices = officeRepository.findAll(pageable);
            } else {
                offices = officeRepository.searchOffices(query, pageable);
            }
        }
        return offices.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OfficeResponse getOfficeDetails(UUID id) {
        Office office = officeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Office not found"));
        return mapToResponse(office);
    }

    @Override
    @Transactional
    public OfficeResponse updateOfficeStatus(UUID id, OfficeStatusUpdateRequest request) {
        Office office = officeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Office not found"));

        if (request.getIsAcceptingOrders() != null) {
            office.setIsAcceptingOrders(request.getIsAcceptingOrders());
        }

        if (request.getWorkingHours() != null && !request.getWorkingHours().isBlank()) {
            office.setWorkingHours(request.getWorkingHours());
        }

        Office saved = officeRepository.save(office);
        return mapToResponse(saved);
    }

    private OfficeResponse mapToResponse(Office office) {
        boolean isOpen = calculateOpenStatus(office);
        
        return OfficeResponse.builder()
                .officeId(office.getId())
                .officeName(office.getOfficeName())
                .officeEmail(office.getOfficeEmail())
                .officePhoneNumber(office.getOfficePhoneNumber())
                .officeAddressLine1(office.getOfficeAddressLine1())
                .wardCode(office.getWard() != null ? office.getWard().getCode() : null)
                .wardName(office.getWard() != null ? office.getWard().getName() : null)
                .officeType(office.getOfficeType().name())
                .provinceCode(office.getProvince() != null ? office.getProvince().getCode() : null)
                .provinceName(office.getProvince() != null ? office.getProvince().getName() : null)
                .regionName(office.getRegion() != null ? office.getRegion().getName() : null)
                .parentOfficeId(office.getParent() != null ? office.getParent().getId() : null)
                .parentOfficeName(office.getParent() != null ? office.getParent().getOfficeName() : null)
                .capacity(office.getCapacity())
                .isAcceptingOrders(office.getIsAcceptingOrders())
                .workingHours(office.getWorkingHours())
                .isOpen(isOpen)
                .build();
    }

    private boolean calculateOpenStatus(Office office) {
        if (Boolean.FALSE.equals(office.getIsAcceptingOrders())) {
            return false;
        }

        try {
            String workingHours = office.getWorkingHours();
            if (workingHours == null || workingHours.isBlank()) {
                workingHours = "07:00-17:00"; // Default fallback
            }
            
            String[] parts = workingHours.split("-");
            if (parts.length != 2) return false;

            LocalTime start = LocalTime.parse(parts[0]);
            LocalTime end = LocalTime.parse(parts[1]);
            LocalTime now = LocalTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));

            return !now.isBefore(start) && !now.isAfter(end);
        } catch (Exception e) {
            return false; // Fail safe
        }
    }
}
