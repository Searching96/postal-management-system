package org.f3.postalmanagement.dto.response.office;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
@Schema(description = "Response containing office details")
public class OfficeResponse {

    @Schema(description = "Office ID")
    private UUID officeId;

    @Schema(description = "Office name")
    private String officeName;

    @Schema(description = "Office email")
    private String officeEmail;

    @Schema(description = "Office phone number")
    private String officePhoneNumber;

    @Schema(description = "Office address")
    private String officeAddress;

    @Schema(description = "Office type")
    private String officeType;

    @Schema(description = "Province code")
    private String provinceCode;

    @Schema(description = "Province name")
    private String provinceName;

    @Schema(description = "Administrative region name")
    private String regionName;

    @Schema(description = "Parent office ID")
    private UUID parentOfficeId;

    @Schema(description = "Parent office name")
    private String parentOfficeName;

    @Schema(description = "Capacity")
    private Integer capacity;

    @Schema(description = "Is accepting orders manually")
    private Boolean isAcceptingOrders;

    @Schema(description = "Working hours")
    private String workingHours;

    @Schema(description = "Is currently open")
    private Boolean isOpen;
}
