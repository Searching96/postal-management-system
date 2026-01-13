package org.f3.postalmanagement.dto.request.employee;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import org.f3.postalmanagement.enums.Role;

import java.util.UUID;

@Data
@Schema(description = "Request to create a new employee by Province Admin")
public class CreateProvinceEmployeeRequest {

    @NotBlank(message = "Full name is required")
    @Schema(
            description = "Full name of the employee",
            example = "Nguyen Van A",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Invalid phone number format (must be 10 digits)"
    )
    @Schema(
            description = "Phone number (used as username)",
            example = "0901234567",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Schema(
            description = "Password (at least 6 characters)",
            example = "123456",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(
            description = "Email address",
            example = "employee@f3postal.com",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String email;

    @NotNull(message = "Role is required")
    @Schema(
            description = "Role of the employee. " +
                    "PO_PROVINCE_ADMIN can create: PO_PROVINCE_ADMIN (for PROVINCE_POST) or PO_WARD_MANAGER (for WARD_POST). " +
                    "WH_PROVINCE_ADMIN can create: WH_PROVINCE_ADMIN (for PROVINCE_WAREHOUSE) or WH_WARD_MANAGER (for WARD_WAREHOUSE).",
            example = "PO_WARD_MANAGER",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Role role;

    @NotNull(message = "Office ID is required")
    @Schema(
            description = "ID of the office where the employee will work",
            example = "550e8400-e29b-41d4-a716-446655440000",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private UUID officeId;
}
