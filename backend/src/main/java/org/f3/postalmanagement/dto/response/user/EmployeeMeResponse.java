package org.f3.postalmanagement.dto.response.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
@Schema(description = "Employee user information response")
public class EmployeeMeResponse {

    @Schema(description = "Account ID")
    private UUID id;

    @Schema(description = "Username (phone number)")
    private String username;

    @Schema(description = "Email address")
    private String email;

    @Schema(description = "Role")
    private String role;

    @Schema(description = "Account active status")
    private boolean isActive;

    @Schema(description = "Full name")
    private String fullName;

    @Schema(description = "Phone number")
    private String phoneNumber;

    @Schema(description = "Office information")
    private OfficeInfo office;

    @Data
    @Builder
    @Schema(description = "Office information")
    public static class OfficeInfo {
        
        @Schema(description = "Office ID")
        private UUID id;
        
        @Schema(description = "Office name")
        private String name;
        
        @Schema(description = "Office email")
        private String email;
        
        @Schema(description = "Office phone number")
        private String phoneNumber;
        
        @Schema(description = "Office address")
        private String address;
        
        @Schema(description = "Office type")
        private String type;
        
        @Schema(description = "Region information")
        private RegionInfo region;
        
        @Schema(description = "Province information")
        private ProvinceInfo province;
    }

    @Data
    @Builder
    @Schema(description = "Region information")
    public static class RegionInfo {
        
        @Schema(description = "Region ID")
        private Integer id;
        
        @Schema(description = "Region name")
        private String name;
    }

    @Data
    @Builder
    @Schema(description = "Province information")
    public static class ProvinceInfo {
        
        @Schema(description = "Province code")
        private String code;
        
        @Schema(description = "Province name")
        private String name;
    }
}
