package org.f3.postalmanagement.dto.response.office;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@Schema(description = "Response containing ward office pair details (WARD_WAREHOUSE + WARD_POST)")
public class WardOfficePairResponse {

    @Schema(description = "Office Pair ID")
    private UUID officePairId;

    @Schema(description = "Ward Warehouse details")
    private OfficeInfo warehouse;

    @Schema(description = "Ward Post Office details")
    private OfficeInfo postOffice;

    @Schema(description = "Province code")
    private String provinceCode;

    @Schema(description = "Province name")
    private String provinceName;

    @Schema(description = "Administrative region name")
    private String regionName;

    @Schema(description = "List of assigned wards")
    private List<WardInfo> assignedWards;

    @Schema(description = "Created at timestamp")
    private LocalDateTime createdAt;

    @Data
    @Builder
    @Schema(description = "Office information")
    public static class OfficeInfo {
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

        @Schema(description = "Parent office ID")
        private UUID parentOfficeId;

        @Schema(description = "Parent office name")
        private String parentOfficeName;
    }

    @Data
    @Builder
    @Schema(description = "Ward information")
    public static class WardInfo {
        @Schema(description = "Ward code")
        private String wardCode;

        @Schema(description = "Ward name")
        private String wardName;
    }
}
