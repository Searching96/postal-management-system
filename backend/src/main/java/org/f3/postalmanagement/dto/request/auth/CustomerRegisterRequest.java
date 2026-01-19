package org.f3.postalmanagement.dto.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Schema(description = "Register request (just for customer)")
public class CustomerRegisterRequest {

    @NotNull(message = "Full name is required")
    @Schema(
            description = "Full name or Company name",
            example = "John Doe / ABC Company",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String fullName;

    @NotNull(message = "Phone number is required")
    @Schema(
            description = "Phone number",
            example = "0123456789",
            requiredMode = Schema.RequiredMode.REQUIRED)
    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Invalid phone number format"
    )
    private String username;

    @NotNull(message = "Password is required")
    @Schema(
            description = "Password (at least 6 characters)",
            example = "123456 / abcdef",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    @NotNull(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(
            description = "Email address",
            example = "abc@gmail.com",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String email;

    @NotNull(message = "Address line 1 is required")
    @Schema(
            description = "Address line 1",
            example = "123, ABC Street",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String addressLine1;

    @NotNull(message = "Ward code is required")
    @Schema(
            description = "Ward code",
            example = "00001",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String wardCode;

    @NotNull(message = "Province code is required")
    @Schema(
            description = "Province code",
            example = "79",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String provinceCode;
}
