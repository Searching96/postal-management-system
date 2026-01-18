package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.administrative.ProvinceResponse;
import org.f3.postalmanagement.dto.response.administrative.RegionResponse;
import org.f3.postalmanagement.dto.response.administrative.WardResponse;
import org.f3.postalmanagement.dto.response.office.OfficeResponse;
import org.f3.postalmanagement.dto.response.route.RouteResponse;
import org.f3.postalmanagement.entity.ApiResponse;
import org.f3.postalmanagement.service.IAdministrativeService;
import org.f3.postalmanagement.service.IRouteService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/administrative")
@RequiredArgsConstructor
@Tag(name = "Administrative Units", description = "API for managing administrative units (provinces, wards)")
public class AdministrativeController {

    private final IAdministrativeService administrativeService;
    private final IRouteService routeService;

    @GetMapping("/regions")
    @Operation(
            summary = "Get all regions",
            description = "Get all administrative regions in the system. No authentication required."
    )
    public ResponseEntity<ApiResponse<List<RegionResponse>>> getAllRegions() {
        List<RegionResponse> regions = administrativeService.getAllRegions();
        
        return ResponseEntity.ok(
                ApiResponse.<List<RegionResponse>>builder()
                        .success(true)
                        .message("All regions fetched successfully")
                        .data(regions)
                        .build()
        );
    }

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
            description = "Get all provinces with pagination and optional search by name or code. No authentication required."
    )
    public ResponseEntity<ApiResponse<PageResponse<ProvinceResponse>>> getAllProvincesPaginated(
            @Parameter(description = "Search term for province name or code")
            @RequestParam(required = false) String search,
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<ProvinceResponse> provinces = administrativeService.getAllProvincesPaginated(search, pageable);
        
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
            description = "Get wards in a specific province with pagination and optional search by name or code. No authentication required."
    )
    public ResponseEntity<ApiResponse<PageResponse<WardResponse>>> getWardsByProvincePaginated(
            @PathVariable String provinceCode,
            @Parameter(description = "Search term for ward name or code")
            @RequestParam(required = false) String search,
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<WardResponse> wards = administrativeService.getWardsByProvincePaginated(provinceCode, search, pageable);
        
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<WardResponse>>builder()
                        .success(true)
                        .message("Wards fetched successfully")
                        .data(wards)
                        .build()
        );
    }

    @GetMapping("/provinces/{provinceCode}/post-offices")
    @Operation(
            summary = "Get post offices by province",
            description = "Get all post offices (PROVINCE_POST, WARD_POST) in a specific province. No authentication required."
    )
    public ResponseEntity<ApiResponse<List<OfficeResponse>>> getPostOfficesByProvince(
            @PathVariable String provinceCode
    ) {
        List<OfficeResponse> offices = administrativeService.getPostOfficesByProvince(provinceCode);
        
        return ResponseEntity.ok(
                ApiResponse.<List<OfficeResponse>>builder()
                        .success(true)
                        .message("Post offices fetched successfully")
                        .data(offices)
                        .build()
        );
    }
    @GetMapping("/wards/{wardCode}/office")
    @Operation(
            summary = "Get post office by ward",
            description = "Get the assigned post office for a specific ward. No authentication required."
    )
    public ResponseEntity<ApiResponse<OfficeResponse>> getOfficeByWard(
            @PathVariable String wardCode
    ) {
        OfficeResponse office = administrativeService.getOfficeByWardCode(wardCode);
        
        if (office == null) {
            return ResponseEntity.ok(
                    ApiResponse.<OfficeResponse>builder()
                            .success(false)
                            .message("No post office assigned to this ward")
                            .data(null)
                            .build()
            );
        }

        return ResponseEntity.ok(
                ApiResponse.<OfficeResponse>builder()
                        .success(true)
                        .message("Assigned post office fetched successfully")
                        .data(office)
                        .build()
        );
    }

    @GetMapping("/route/calculate")
    @Operation(
            summary = "Calculate package transfer route",
            description = "Calculate the predefined transfer route for a package from origin office to destination ward. " +
                    "Returns ordered list of stops including hubs and warehouses."
    )
    public ResponseEntity<ApiResponse<RouteResponse>> calculateRoute(
            @Parameter(description = "Origin office UUID", required = true)
            @RequestParam UUID originOfficeId,
            @Parameter(description = "Destination ward code", required = true)
            @RequestParam String destinationWardCode
    ) {
        RouteResponse route = routeService.calculatePackageRoute(originOfficeId, destinationWardCode);
        
        return ResponseEntity.ok(
                ApiResponse.<RouteResponse>builder()
                        .success(true)
                        .message("Route calculated successfully")
                        .data(route)
                        .build()
        );
    }
}

