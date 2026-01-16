import { useState, useEffect, useCallback } from "react";
import { administrativeService } from "../../services/administrativeService";
import type {
  RegionResponse,
  ProvinceResponse,
  WardResponse,
} from "../../models";
import {
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  PageHeader,
  Card,
  LoadingSpinner,
  Alert,
  Button,
} from "../../components/ui";

export function ProvincesPage() {
  const [regions, setRegions] = useState<RegionResponse[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  // --- PROVINCE STATE ---
  const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
  const [allProvincesCache, setAllProvincesCache] = useState<ProvinceResponse[]>(
    []
  );
  const [provincePage, setProvincePage] = useState(0);
  const [provinceTotalPages, setProvinceTotalPages] = useState(0);
  const [provinceTotalElements, setProvinceTotalElements] = useState(0);

  // Global Search (Provinces)
  const [searchTerm, setSearchTerm] = useState("");

  // --- WARD STATE (Nested) ---
  const [expandedProvinceCode, setExpandedProvinceCode] = useState<string | null>(
    null
  );
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [allWardsCache, setAllWardsCache] = useState<WardResponse[]>([]);
  const [wardPage, setWardPage] = useState(0);
  const [wardTotalPages, setWardTotalPages] = useState(0);
  const [wardTotalElements, setWardTotalElements] = useState(0);

  // Nested Search (Wards)
  const [wardSearchTerm, setWardSearchTerm] = useState("");

  // --- LOADER STATE ---
  const [isLoading, setIsLoading] = useState(true); // Province list loader
  const [isLoadingWards, setIsLoadingWards] = useState(false); // Ward nested loader
  const [error, setError] = useState("");

  const [provincePageSize, setProvincePageSize] = useState(10);
  const [wardPageSize, setWardPageSize] = useState(12);

  useEffect(() => {
    const updateSizes = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;

      // Province list (single column)
      // Header (~200px) + Controls (~200px) + Pagination (~100px) = ~500px offset
      // Row height ~80px
      const pRows = Math.max(5, Math.floor((height - 500) / 80));
      setProvincePageSize(pRows);

      // Ward grid (multi column)
      // Search box (~60px) + Pagination (~60px) = ~120px offset within province row
      // Grid item height ~60px
      let cols = 2;
      if (width >= 1024) cols = 4;
      else if (width >= 768) cols = 3;

      const wRows = Math.max(3, Math.floor((height * 0.4) / 60)); // Wards occupy a portion of the screen
      setWardPageSize(cols * wRows);
    };

    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, []);

  useEffect(() => {
    fetchRegions();
  }, []);

  // --- DATA LOADING: PROVINCES ---

  const loadProvincesData = useCallback(
    async (page: number, search: string) => {
      setIsLoading(true);
      setError("");

      try {
        const useClientSide =
          search.trim().length > 0 || selectedRegion !== null;

        if (useClientSide) {
          // Client-side mode (Search or Region Filter)
          let sourceData = allProvincesCache;

          if (sourceData.length === 0) {
            let response;
            if (selectedRegion !== null) {
              response = await administrativeService.getProvincesByRegion(
                selectedRegion
              );
            } else {
              response = await administrativeService.getAllProvinces();
            }

            if (response.success) {
              sourceData = response.data;
              setAllProvincesCache(sourceData);
            } else {
              setError(response.message || "Không thể tải danh sách tỉnh thành");
              setIsLoading(false);
              return;
            }
          }

          let filtered = sourceData;
          if (search.trim()) {
            const lowerSearch = search.toLowerCase();
            filtered = sourceData.filter(
              (p) =>
                p.name.toLowerCase().includes(lowerSearch) ||
                p.code.toLowerCase().includes(lowerSearch)
            );
          }

          const start = page * provincePageSize;
          const pagedData = filtered.slice(start, start + provincePageSize);

          setProvinces(pagedData);
          setProvinceTotalElements(filtered.length);
          setProvinceTotalPages(Math.ceil(filtered.length / provincePageSize));
        } else {
          // Server-side mode
          const response = await administrativeService.getAllProvincesPaginated(
            page,
            provincePageSize
          );
          if (response.success) {
            setProvinces(response.data.content);
            setProvinceTotalPages(response.data.totalPages);
            setProvinceTotalElements(response.data.totalElements);
          } else {
            setError(response.message || "Không thể tải danh sách tỉnh thành");
          }
        }
      } catch (err) {
        setError("Tải dữ liệu tỉnh thành thất bại");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [allProvincesCache, selectedRegion, provincePageSize]
  );

  // --- DATA LOADING: WARDS ---

  const loadWardsData = useCallback(
    async (page: number, search: string, provinceCode: string) => {
      setIsLoadingWards(true);
      try {
        const useClientSide = search.trim().length > 0;

        if (useClientSide) {
          // Client-side mode (Search in Wards)
          let sourceData = allWardsCache;

          if (sourceData.length === 0) {
            const response = await administrativeService.getWardsByProvince(
              provinceCode
            );
            if (response.success) {
              sourceData = response.data;
              setAllWardsCache(sourceData);
            } else {
              console.error(response.message || "Không thể tải danh sách phường xã");
              setIsLoadingWards(false);
              return;
            }
          }

          const lowerSearch = search.toLowerCase();
          const filtered = sourceData.filter(
            (w) =>
              w.name.toLowerCase().includes(lowerSearch) ||
              w.code.toLowerCase().includes(lowerSearch)
          );

          const start = page * wardPageSize;
          const pagedData = filtered.slice(start, start + wardPageSize);

          setWards(pagedData);
          setWardTotalElements(filtered.length);
          setWardTotalPages(Math.ceil(filtered.length / wardPageSize));
        } else {
          // Server-side mode (Pagination for Wards)
          const response =
            await administrativeService.getWardsByProvincePaginated(
              provinceCode,
              page,
              wardPageSize
            );
          if (response.success) {
            setWards(response.data.content);
            setWardTotalPages(response.data.totalPages);
            setWardTotalElements(response.data.totalElements);
          } else {
            console.error(response.message || "Không thể tải danh sách phường xã");
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách phường xã", err);
      } finally {
        setIsLoadingWards(false);
      }
    },
    [allWardsCache, wardPageSize]
  );

  // --- EFFECTS ---

  // 1. Load Provinces (Initial + Page Change + Search Debounce)
  useEffect(() => {
    loadProvincesData(provincePage, searchTerm);
  }, [provincePage, provincePageSize]); // Trigger on page change or size change

  // Region change logic
  useEffect(() => {
    loadProvincesData(0, searchTerm); // Reload on region change (page reset handled in handler)
  }, [selectedRegion]);

  // Debounce PROVINCE Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setProvincePage(0);
      loadProvincesData(0, searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Load Wards (Initial + Ward Page Change + Ward Size Change)
  useEffect(() => {
    if (expandedProvinceCode) {
      loadWardsData(wardPage, wardSearchTerm, expandedProvinceCode);
    }
  }, [wardPage, wardPageSize]); // Trigger on ward page change or size change

  // Debounce WARD Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (expandedProvinceCode) {
        setWardPage(0);
        loadWardsData(0, wardSearchTerm, expandedProvinceCode);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [wardSearchTerm]);

  // --- HANDLERS ---

  const fetchRegions = async () => {
    const response = await administrativeService.getAllRegions();
    if (response.success) setRegions(response.data);
  };

  const handleRegionFilterChange = (regionId: number | null) => {
    setSelectedRegion(regionId);
    setAllProvincesCache([]); // Invalidate cache
    setProvincePage(0);
    setExpandedProvinceCode(null); // Collapse any open province
  };

  const handleProvinceExpand = (provinceCode: string) => {
    if (expandedProvinceCode === provinceCode) {
      // Collapse
      setExpandedProvinceCode(null);
    } else {
      // Expand
      setExpandedProvinceCode(provinceCode);
      // Reset Ward State
      setWardPage(0);
      setWardSearchTerm("");
      setAllWardsCache([]);
      setWards([]);
      // Load initial wards
      loadWardsData(0, "", provinceCode);
    }
  };

  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  return (
    <div>
      <PageHeader
        title="Tỉnh thành & Phường xã"
        description="Tra cứu đơn vị hành chính"
      />

      {/* Top Controls */}
      <div className="mb-6 space-y-4">
        {/* Region Filter */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Lọc theo Vùng:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleRegionFilterChange(null)}
              className={`px-4 py-2 rounded-lg border transition-colors ${selectedRegion === null
                ? "bg-primary-500 text-white border-primary-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              Tất cả các Vùng
            </button>
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => handleRegionFilterChange(region.id)}
                className={`px-4 py-2 rounded-lg border transition-colors ${selectedRegion === region.id
                  ? "bg-primary-500 text-white border-primary-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>

        {/* Global Search Bar (Provinces) */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tỉnh thành..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* CONTENT AREA */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {provinces.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Không tìm thấy tỉnh thành nào
              </div>
            ) : (
              provinces.map((province) => (
                <div key={province.code}>
                  <button
                    onClick={() => handleProvinceExpand(province.code)}
                    className={`w-full px-6 py-4 flex items-center justify-between transition-colors text-left ${expandedProvinceCode === province.code
                      ? "bg-gray-50"
                      : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center">
                      <MapPin
                        className={`h-5 w-5 mr-3 ${expandedProvinceCode === province.code
                          ? "text-primary-600"
                          : "text-primary-500"
                          }`}
                      />
                      <div>
                        <p
                          className={`font-medium ${expandedProvinceCode === province.code
                            ? "text-primary-700"
                            : "text-gray-900"
                            }`}
                        >
                          {province.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Mã: {province.code} • {province.administrativeRegionName}
                        </p>
                      </div>
                    </div>
                    {expandedProvinceCode === province.code ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {/* NESTED WARD AREA */}
                  {expandedProvinceCode === province.code && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-b border-gray-100 shadow-inner">
                      {/* Nested Search */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={`Tìm kiếm phường xã tại ${province.name}...`}
                          value={wardSearchTerm}
                          onChange={(e) => setWardSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white"
                        />
                      </div>

                      {/* Ward List */}
                      {isLoadingWards ? (
                        <div className="flex justify-center py-4">
                          <LoadingSpinner size="sm" />
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {wards.length === 0 ? (
                              <div className="col-span-full text-center text-gray-500 text-sm py-2">
                                Không tìm thấy phường xã nào
                              </div>
                            ) : (
                              wards.map((ward) => (
                                <div
                                  key={ward.code}
                                  className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm"
                                >
                                  <p className="font-medium text-gray-900">
                                    {ward.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {ward.code}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Ward Pagination */}
                          {wards.length > 0 && (
                            <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
                              <span>
                                Trang {wardPage + 1} / {wardTotalPages} (
                                {wardTotalElements} kết quả)
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  onClick={() => setWardPage((p) => p - 1)}
                                  disabled={wardPage === 0}
                                  className="py-1 px-2 h-7 text-xs"
                                >
                                  Trước
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setWardPage((p) => p + 1)}
                                  disabled={wardPage >= wardTotalPages - 1}
                                  className="py-1 px-2 h-7 text-xs"
                                >
                                  Sau
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Province Pagination */}
            {provinces.length > 0 && (
              <PaginationControls
                page={provincePage}
                totalPages={provinceTotalPages}
                totalElements={provinceTotalElements}
                pageSize={provincePageSize}
                onPageChange={setProvincePage}
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

// Sub-component for Pagination to reuse code
function PaginationControls({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  return (
    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
      <span className="text-sm text-gray-700">
        Đang hiển thị <span className="font-medium">{page * pageSize + 1}</span> đến{" "}
        <span className="font-medium">
          {Math.min((page + 1) * pageSize, totalElements)}
        </span>{" "}
        trong tổng số <span className="font-medium">{totalElements}</span> kết quả
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="py-1 px-3 text-sm h-9"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Trước
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="py-1 px-3 text-sm h-9"
        >
          Sau
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
