package org.f3.postalmanagement.dto.request.employee.ward;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Schema(description = "Request to create a new Ward Manager by existing Ward Manager in their office")
public class CreateWardManagerEmployeeRequest {

    @NotBlank(message = "Full name is required")
    @Schema(
            description = "Full name of the ward manager",
            example = "Nguyen Van B",
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
            example = "0901234568",
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
            example = "wardmanager@f3postal.com",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String email;
}
