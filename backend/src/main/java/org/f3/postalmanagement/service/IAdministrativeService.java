package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.administrative.ProvinceResponse;
import org.f3.postalmanagement.dto.response.administrative.WardResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IAdministrativeService {

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
     * @param pageable pagination parameters
     * @return paginated provinces
     */
    PageResponse<ProvinceResponse> getAllProvincesPaginated(Pageable pageable);

    /**
     * Get all wards in a specific province
     * @param provinceCode the province code
     * @return list of wards
     */
    List<WardResponse> getWardsByProvince(String provinceCode);

    /**
     * Get wards in a province with pagination
     * @param provinceCode the province code
     * @param pageable pagination parameters
     * @return paginated wards
     */
    PageResponse<WardResponse> getWardsByProvincePaginated(String provinceCode, Pageable pageable);
}
