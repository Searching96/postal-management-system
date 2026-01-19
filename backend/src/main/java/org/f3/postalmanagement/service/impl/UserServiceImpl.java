package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.response.user.CustomerMeResponse;
import org.f3.postalmanagement.dto.response.user.EmployeeMeResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Customer;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.repository.CustomerRepository;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.service.IUserService;
import org.f3.postalmanagement.utils.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public Object fetchMe() {
        Account account = SecurityUtils.getCurrentAccount();
        Role role = account.getRole();

        if (role == Role.CUSTOMER) {
            // Return customer-specific response
            Optional<Customer> customerOpt = customerRepository.findByAccount(account);
            Customer customer = customerOpt.orElseThrow(() -> 
                new IllegalStateException("Customer record not found for account: " + account.getUsername()));

            return CustomerMeResponse.builder()
                    .id(account.getId())
                    .username(account.getUsername())
                    .email(account.getEmail())
                    .role(role.name())
                    .isActive(account.isActive())
                    .fullName(customer.getFullName())
                    .phoneNumber(customer.getPhoneNumber())
                    .address(customer.getAddressLine1())
                    .subscriptionPlan(customer.getSubscriptionPlan().name())
                    .build();

        } else if (role == Role.SYSTEM_ADMIN) {
            // Return employee response for system admin (no office)
            return EmployeeMeResponse.builder()
                    .id(account.getId())
                    .username(account.getUsername())
                    .email(account.getEmail())
                    .role(role.name())
                    .isActive(account.isActive())
                    .fullName("System Administrator")
                    .phoneNumber(account.getUsername())
                    .build();

        } else {
            // Return employee-specific response with full office info
            Optional<Employee> employeeOpt = employeeRepository.findByAccount(account);
            Employee employee = employeeOpt.orElseThrow(() -> 
                new IllegalStateException("Employee record not found for account: " + account.getUsername()));

            EmployeeMeResponse.EmployeeMeResponseBuilder builder = EmployeeMeResponse.builder()
                    .id(account.getId())
                    .username(account.getUsername())
                    .email(account.getEmail())
                    .role(role.name())
                    .isActive(account.isActive())
                    .fullName(employee.getFullName())
                    .phoneNumber(employee.getPhoneNumber());

            // Build office information
            if (employee.getOffice() != null) {
                Office office = employee.getOffice();
                
                EmployeeMeResponse.OfficeInfo.OfficeInfoBuilder officeBuilder = EmployeeMeResponse.OfficeInfo.builder()
                        .id(office.getId())
                        .name(office.getOfficeName())
                        .email(office.getOfficeEmail())
                        .phoneNumber(office.getOfficePhoneNumber())
                        .address(office.getOfficeAddressLine1())
                        .type(office.getOfficeType().name());

                // Add region info
                if (office.getRegion() != null) {
                    officeBuilder.region(EmployeeMeResponse.RegionInfo.builder()
                            .id(office.getRegion().getId())
                            .name(office.getRegion().getName())
                            .build());
                }

                // Add province info
                if (office.getProvince() != null) {
                    officeBuilder.province(EmployeeMeResponse.ProvinceInfo.builder()
                            .code(office.getProvince().getCode())
                            .name(office.getProvince().getName())
                            .build());
                }

                builder.office(officeBuilder.build());
            }

            return builder.build();
        }
    }
}
