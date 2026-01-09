package org.f3.postalmanagement.dto.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Schema(description = "Register request (just for customer)")
public class CustomerRegisterRequest {

    @NotNull(message = "Full name is required")
    @Schema(description = "Full name", example = "John Doe", requiredMode = Schema.RequiredMode.REQUIRED)
    private String fullName;

    @NotNull(message = "Phone number is required")
    @Schema(description = "Phone number", example = "0123456789", requiredMode = Schema.RequiredMode.REQUIRED)
    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Invalid phone number format"
    )
    private String username;

    @NotNull(message = "Password is required")
    @Schema(description = "Password (at least 6 characters)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    @Schema(description = "Email address", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private String email;

    @NotNull(message = "Address is required")
    @Schema(description = "Address", example = "123, ABC Street, A Ward, B Province", requiredMode = Schema.RequiredMode.REQUIRED)
    private String address;
}
