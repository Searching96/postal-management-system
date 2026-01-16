package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.administrative.ProvinceResponse;
import org.f3.postalmanagement.dto.response.administrative.RegionResponse;
import org.f3.postalmanagement.dto.response.administrative.WardResponse;
import org.f3.postalmanagement.entity.administrative.AdministrativeRegion;
import org.f3.postalmanagement.entity.administrative.Province;
import org.f3.postalmanagement.entity.administrative.Ward;
import org.f3.postalmanagement.repository.AdRegionRepository;
import org.f3.postalmanagement.repository.ProvinceRepository;
import org.f3.postalmanagement.repository.WardRepository;
import org.f3.postalmanagement.service.IAdministrativeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Collator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdministrativeServiceImpl implements IAdministrativeService {

    private final ProvinceRepository provinceRepository;
    private final WardRepository wardRepository;
    private final AdRegionRepository adRegionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RegionResponse> getAllRegions() {
        List<AdministrativeRegion> regions = adRegionRepository.findAll();
        log.info("Fetched all {} administrative regions", regions.size());
        
        return regions.stream()
                .sorted((r1, r2) -> r1.getId().compareTo(r2.getId()))
                .map(this::mapToRegionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProvinceResponse> getProvincesByRegion(Integer regionId) {
        // Validate region exists
        if (!adRegionRepository.existsById(regionId)) {
            log.error("Administrative region not found with ID: {}", regionId);
            throw new IllegalArgumentException("Administrative region not found with ID: " + regionId);
        }
        
        List<Province> provinces = provinceRepository.findByAdministrativeRegion_Id(regionId);
        log.info("Fetched {} provinces for region ID: {}", provinces.size(), regionId);
        
        Collator vietnameseCollator = Collator.getInstance(new Locale("vi", "VN"));
        return provinces.stream()
                .sorted((p1, p2) -> vietnameseCollator.compare(p1.getName(), p2.getName()))
                .map(this::mapToProvinceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProvinceResponse> getAllProvinces() {
        List<Province> provinces = provinceRepository.findAll();
        log.info("Fetched all {} provinces", provinces.size());
        
        Collator vietnameseCollator = Collator.getInstance(new Locale("vi", "VN"));
        return provinces.stream()
                .sorted((p1, p2) -> vietnameseCollator.compare(p1.getName(), p2.getName()))
                .map(this::mapToProvinceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProvinceResponse> getAllProvincesPaginated(String search, Pageable pageable) {
        Page<Province> provincePage = provinceRepository.searchByNameOrCode(search, pageable);
        
        Page<ProvinceResponse> responsePage = provincePage.map(this::mapToProvinceResponse);
        log.info("Fetched page {} of provinces with search '{}' (total: {})", pageable.getPageNumber(), search, provincePage.getTotalElements());
        
        return mapToPageResponse(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WardResponse> getWardsByProvince(String provinceCode) {
        // Validate province exists
        if (!provinceRepository.existsById(provinceCode)) {
            log.error("Province not found with code: {}", provinceCode);
            throw new IllegalArgumentException("Province not found with code: " + provinceCode);
        }
        
        List<Ward> wards = wardRepository.findByProvince_Code(provinceCode);
        log.info("Fetched {} wards for province code: {}", wards.size(), provinceCode);
        
        Collator vietnameseCollator = Collator.getInstance(new Locale("vi", "VN"));
        return wards.stream()
                .sorted((w1, w2) -> vietnameseCollator.compare(w1.getName(), w2.getName()))
                .map(this::mapToWardResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WardResponse> getWardsByProvincePaginated(String provinceCode, String search, Pageable pageable) {
        // Validate province exists
        if (!provinceRepository.existsById(provinceCode)) {
            log.error("Province not found with code: {}", provinceCode);
            throw new IllegalArgumentException("Province not found with code: " + provinceCode);
        }
        
        Page<Ward> wardPage = wardRepository.searchByProvinceCodeAndNameOrCode(provinceCode, search, pageable);
        
        Page<WardResponse> responsePage = wardPage.map(this::mapToWardResponse);
        log.info("Fetched page {} of wards for province code: {} with search '{}' (total: {})", pageable.getPageNumber(), provinceCode, search, wardPage.getTotalElements());
        
        return mapToPageResponse(responsePage);
    }

    private RegionResponse mapToRegionResponse(AdministrativeRegion region) {
        return RegionResponse.builder()
                .id(region.getId())
                .name(region.getName())
                .build();
    }

    private ProvinceResponse mapToProvinceResponse(Province province) {
        return ProvinceResponse.builder()
                .code(province.getCode())
                .name(province.getName())
                .administrativeRegionName(province.getAdministrativeRegion() != null ? 
                        province.getAdministrativeRegion().getName() : null)
                .build();
    }

    private WardResponse mapToWardResponse(Ward ward) {
        String wardName = ward.getName();
        if (ward.getAdministrativeUnit() != null && ward.getAdministrativeUnit().getName() != null) {
            wardName = ward.getAdministrativeUnit().getName() + " " + ward.getName();
        }
        
        return WardResponse.builder()
                .code(ward.getCode())
                .name(wardName)
                .provinceName(ward.getProvince() != null ? 
                        ward.getProvince().getName() : null)
                .build();
    }

    private <T> PageResponse<T> mapToPageResponse(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
