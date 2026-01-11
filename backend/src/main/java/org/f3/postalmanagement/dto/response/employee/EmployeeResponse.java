package org.f3.postalmanagement.dto.response.employee;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
@Schema(description = "Response after registering a new employee")
public class EmployeeResponse {

    @Schema(description = "Employee ID")
    private UUID employeeId;

    @Schema(description = "Full name of the employee")
    private String fullName;

    @Schema(description = "Phone number")
    private String phoneNumber;

    @Schema(description = "Email address")
    private String email;

    @Schema(description = "Role of the employee")
    private String role;

    @Schema(description = "Office name where the employee works")
    private String officeName;
}
