package org.f3.postalmanagement.dto.request.office;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Schema(description = "Request to create a new Ward Office Pair (WARD_WAREHOUSE + WARD_POST together). Only PO_PROVINCE_ADMIN can create. Parent offices are automatically determined from the manager's province.")
public class CreateWardOfficeRequest {

    // --- Ward Warehouse fields ---
    @NotBlank(message = "Warehouse name is required")
    @Schema(
            description = "Name of the ward warehouse",
            example = "Kho Phường Bến Nghé",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String warehouseName;

    @NotBlank(message = "Warehouse email is required")
    @Email(message = "Invalid email format")
    @Schema(
            description = "Email of the warehouse",
            example = "wh.bennge@f3postal.com",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String warehouseEmail;

    @NotBlank(message = "Warehouse phone number is required")
    @Pattern(
            regexp = "^[0-9]{10,11}$",
            message = "Invalid phone number format (must be 10-11 digits)"
    )
    @Schema(
            description = "Phone number of the warehouse",
            example = "0281234567",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String warehousePhoneNumber;

    @NotBlank(message = "Warehouse address line 1 is required")
    @Schema(
            description = "Address line 1 of the warehouse",
            example = "123 Nguyễn Huệ",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String warehouseAddressLine1;

    @NotNull(message = "Warehouse capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Schema(
            description = "Capacity of the warehouse (number of packages it can hold)",
            example = "1000",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Integer warehouseCapacity;

    // --- Ward Post Office fields ---
    @NotBlank(message = "Post office name is required")
    @Schema(
            description = "Name of the ward post office",
            example = "Bưu cục Phường Bến Nghé",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String postOfficeName;

    @NotBlank(message = "Post office email is required")
    @Email(message = "Invalid email format")
    @Schema(
            description = "Email of the post office",
            example = "po.bennge@f3postal.com",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String postOfficeEmail;

    @NotBlank(message = "Post office phone number is required")
    @Pattern(
            regexp = "^[0-9]{10,11}$",
            message = "Invalid phone number format (must be 10-11 digits)"
    )
    @Schema(
            description = "Phone number of the post office",
            example = "0281234568",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String postOfficePhoneNumber;

    @NotBlank(message = "Post office address line 1 is required")
    @Schema(
            description = "Address line 1 of the post office",
            example = "125 Nguyễn Huệ",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String postOfficeAddressLine1;

    // --- Ward & Province ---
    @NotBlank(message = "Ward code is required")
    @Schema(
            description = "Ward code for both offices",
            example = "00001",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String wardCode;

    // --- Province code (required for SYSTEM_ADMIN) ---
    @Schema(
            description = "Province code. Required for SYSTEM_ADMIN, optional for province admins (uses their office's province if not provided)",
            example = "79",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    private String provinceCode;
}
