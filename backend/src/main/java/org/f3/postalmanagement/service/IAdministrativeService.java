package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.administrative.ProvinceResponse;
import org.f3.postalmanagement.dto.response.administrative.RegionResponse;
import org.f3.postalmanagement.dto.response.administrative.WardResponse;
import org.f3.postalmanagement.dto.response.office.OfficeResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IAdministrativeService {

    /**
     * Get all administrative regions
     * @return list of all regions
     */
    List<RegionResponse> getAllRegions();

    /**
     * Get all provinces in a specific region
     * @param regionId the region ID
     * @return list of provinces
     */
    List<ProvinceResponse> getProvincesByRegion(Integer regionId);

    /**
     * Get all provinces
     * @return list of all provinces
     */
    List<ProvinceResponse> getAllProvinces();

    /**
     * Get all provinces with pagination
     * @param search optional search term for name or code
     * @param pageable pagination parameters
     * @return paginated provinces
     */
    PageResponse<ProvinceResponse> getAllProvincesPaginated(String search, Pageable pageable);

    /**
     * Get all wards in a specific province
     * @param provinceCode the province code
     * @return list of wards
     */
    List<WardResponse> getWardsByProvince(String provinceCode);

    /**
     * Get wards in a province with pagination
     * @param provinceCode the province code
     * @param search optional search term for name or code
     * @param pageable pagination parameters
     * @return paginated wards
     */
    PageResponse<WardResponse> getWardsByProvincePaginated(String provinceCode, String search, Pageable pageable);

    /**
     * Get all post offices in a specific province
     * @param provinceCode the province code
     * @return list of post offices
     */
    List<OfficeResponse> getPostOfficesByProvince(String provinceCode);
}
