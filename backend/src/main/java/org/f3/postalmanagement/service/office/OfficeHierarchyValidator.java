package org.f3.postalmanagement.service.office;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.exception.ForbiddenException;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfficeHierarchyValidator {

    private final EmployeeRepository employeeRepository;
    private final OfficeRepository officeRepository;

    /**
     * Validates if user can manage the office, throwing exception if not.
     * Use this method when you want to block execution flow.
     */
    @Transactional(readOnly = true)
    public void validateCanManageOffice(Account user, UUID officeId) {
        if (!canManageOffice(user, officeId)) {
            throw new ForbiddenException("You do not have permission to manage this office");
        }
    }

    /**
     * Check if user can manage a specific office.
     * Returns boolean for conditional logic.
     */
    @Transactional(readOnly = true)
    public boolean canManageOffice(Account user, UUID officeId) {
        // SYSTEM_ADMIN can manage all offices
        if (user.getRole() == Role.SYSTEM_ADMIN) {
            return true;
        }

        // Get user's employee record
        Employee employee = employeeRepository.findById(user.getId())
                .orElseThrow(() -> new ForbiddenException("Employee not found"));

        Office userOffice = employee.getOffice();
        if (userOffice == null) {
            log.warn("User {} has no assigned office", user.getId());
            return false;
        }

        // Get target office
        Office targetOffice = officeRepository.findById(officeId)
                .orElseThrow(() -> new ForbiddenException("Office not found"));

        // HUB_ADMIN: Can manage if their office is the target or a parent
        if (user.getRole() == Role.HUB_ADMIN) {
            return canManageOfficeHierarchy(userOffice, targetOffice);
        }

        // PROVINCE_ADMIN (PO or WH): Can manage if same province
        if (user.getRole() == Role.PO_PROVINCE_ADMIN ||
            user.getRole() == Role.WH_PROVINCE_ADMIN) {
            return isInSameProvince(userOffice, targetOffice);
        }

        // WARD_MANAGER (PO or WH): Can manage if same ward
        if (user.getRole() == Role.PO_WARD_MANAGER ||
            user.getRole() == Role.WH_WARD_MANAGER) {
            return isInSameWard(userOffice, targetOffice);
        }

        return false;
    }

    // ... (Keep the rest of your existing methods: canManageProvince, canManageWard, and private helpers)
    
    @Transactional(readOnly = true)
    public boolean canManageProvince(Account user, String provinceCode) {
        if (user.getRole() == Role.SYSTEM_ADMIN) return true;

        if (user.getRole() != Role.PO_PROVINCE_ADMIN &&
            user.getRole() != Role.WH_PROVINCE_ADMIN) {
            return false;
        }

        Employee employee = employeeRepository.findById(user.getId())
                .orElseThrow(() -> new ForbiddenException("Employee not found"));

        Office userOffice = employee.getOffice();
        if (userOffice == null) return false;

        return isOfficeInProvince(userOffice, provinceCode);
    }

    @Transactional(readOnly = true)
    public boolean canManageWard(Account user, String wardCode) {
        if (user.getRole() == Role.SYSTEM_ADMIN) return true;

        if (user.getRole() != Role.PO_WARD_MANAGER &&
            user.getRole() != Role.WH_WARD_MANAGER) {
            return false;
        }

        Employee employee = employeeRepository.findById(user.getId())
                .orElseThrow(() -> new ForbiddenException("Employee not found"));

        Office userOffice = employee.getOffice();
        if (userOffice == null) return false;

        return isOfficeInWard(userOffice, wardCode);
    }

    private boolean canManageOfficeHierarchy(Office sourceOffice, Office targetOffice) {
        if (sourceOffice.getId().equals(targetOffice.getId())) {
            return true;
        }
        Office current = targetOffice.getParent();
        while (current != null) {
            if (current.getId().equals(sourceOffice.getId())) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }

    private boolean isInSameProvince(Office office1, Office office2) {
        String province1 = getProvinceCode(office1);
        String province2 = getProvinceCode(office2);
        return province1 != null && province1.equals(province2);
    }

    private boolean isInSameWard(Office office1, Office office2) {
        String ward1 = getWardCode(office1);
        String ward2 = getWardCode(office2);
        return ward1 != null && ward1.equals(ward2);
    }

    private boolean isOfficeInProvince(Office office, String provinceCode) {
        String officeProvince = getProvinceCode(office);
        return officeProvince != null && officeProvince.equals(provinceCode);
    }

    private boolean isOfficeInWard(Office office, String wardCode) {
        String officeWard = getWardCode(office);
        return officeWard != null && officeWard.equals(wardCode);
    }

    private String getProvinceCode(Office office) {
        if (office.getWard() != null && office.getWard().getProvince() != null) {
            return office.getWard().getProvince().getCode();
        }
        return null;
    }

    private String getWardCode(Office office) {
        if (office.getWard() != null) {
            return office.getWard().getCode();
        }
        return null;
    }
}