package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.administrative.ProvinceResponse;
import org.f3.postalmanagement.dto.response.administrative.WardResponse;
import org.f3.postalmanagement.entity.ApiResponse;
import org.f3.postalmanagement.service.IAdministrativeService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/administrative")
@RequiredArgsConstructor
@Tag(name = "Administrative Units", description = "API for managing administrative units (provinces, wards)")
public class AdministrativeController {

    private final IAdministrativeService administrativeService;

    @GetMapping("/regions/{regionId}/provinces")
    @Operation(
            summary = "Get provinces by region",
            description = "Get all provinces in a specific administrative region. No authentication required."
    )
    public ResponseEntity<ApiResponse<List<ProvinceResponse>>> getProvincesByRegion(
            @PathVariable Integer regionId
    ) {
        List<ProvinceResponse> provinces = administrativeService.getProvincesByRegion(regionId);
        
        return ResponseEntity.ok(
                ApiResponse.<List<ProvinceResponse>>builder()
                        .success(true)
                        .message("Provinces fetched successfully")
                        .data(provinces)
                        .build()
        );
    }

    @GetMapping("/provinces")
    @Operation(
            summary = "Get all provinces",
            description = "Get all provinces in the system. No authentication required."
    )
    public ResponseEntity<ApiResponse<List<ProvinceResponse>>> getAllProvinces() {
        List<ProvinceResponse> provinces = administrativeService.getAllProvinces();
        
        return ResponseEntity.ok(
                ApiResponse.<List<ProvinceResponse>>builder()
                        .success(true)
                        .message("All provinces fetched successfully")
                        .data(provinces)
                        .build()
        );
    }

    @GetMapping("/provinces/paginated")
    @Operation(
            summary = "Get all provinces (paginated)",
            description = "Get all provinces with pagination. No authentication required."
    )
    public ResponseEntity<ApiResponse<PageResponse<ProvinceResponse>>> getAllProvincesPaginated(
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<ProvinceResponse> provinces = administrativeService.getAllProvincesPaginated(pageable);
        
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<ProvinceResponse>>builder()
                        .success(true)
                        .message("All provinces fetched successfully")
                        .data(provinces)
                        .build()
        );
    }

    @GetMapping("/provinces/{provinceCode}/wards")
    @Operation(
            summary = "Get wards by province",
            description = "Get all wards in a specific province. No authentication required."
    )
    public ResponseEntity<ApiResponse<List<WardResponse>>> getWardsByProvince(
            @PathVariable String provinceCode
    ) {
        List<WardResponse> wards = administrativeService.getWardsByProvince(provinceCode);
        
        return ResponseEntity.ok(
                ApiResponse.<List<WardResponse>>builder()
                        .success(true)
                        .message("Wards fetched successfully")
                        .data(wards)
                        .build()
        );
    }

    @GetMapping("/provinces/{provinceCode}/wards/paginated")
    @Operation(
            summary = "Get wards by province (paginated)",
            description = "Get wards in a specific province with pagination. No authentication required."
    )
    public ResponseEntity<ApiResponse<PageResponse<WardResponse>>> getWardsByProvincePaginated(
            @PathVariable String provinceCode,
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<WardResponse> wards = administrativeService.getWardsByProvincePaginated(provinceCode, pageable);
        
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<WardResponse>>builder()
                        .success(true)
                        .message("Wards fetched successfully")
                        .data(wards)
                        .build()
        );
    }
}
