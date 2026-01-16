package org.f3.postalmanagement.dto.request.employee;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Schema(description = "Request to update an existing staff member")
public class UpdateStaffRequest {

    @Schema(
            description = "Full name of the staff",
            example = "Nguyen Van A"
    )
    private String fullName;

    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Invalid phone number format (must be 10 digits)"
    )
    @Schema(
            description = "Phone number",
            example = "0901234567"
    )
    private String phoneNumber;

    @Email(message = "Invalid email format")
    @Schema(
            description = "Email address",
            example = "staff@f3postal.com"
    )
    private String email;

    @Schema(
            description = "Whether the account is active",
            example = "true"
    )
    private Boolean active;
}
