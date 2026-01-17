import { useState, useEffect, useCallback, useRef } from "react";
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
} from "lucide-react";
import {
  PageHeader,
  Card,
  LoadingSpinner,
  Alert,
  Button,
  PaginationControls,
} from "../../components/ui";

export function ProvincesPage() {
  const [regions, setRegions] = useState<RegionResponse[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  // --- PROVINCE STATE ---
  const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
  const [allProvincesCache, setAllProvincesCache] = useState<ProvinceResponse[]>([]);
  const [provincePage, setProvincePage] = useState(0);
  const [provinceTotalPages, setProvinceTotalPages] = useState(0);
  const [provinceTotalElements, setProvinceTotalElements] = useState(0);

  // Global Search (Provinces)
  const [searchTerm, setSearchTerm] = useState("");

  // --- WARD STATE (Nested) ---
  const [expandedProvinceCode, setExpandedProvinceCode] = useState<string | null>(null);
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [wardPage, setWardPage] = useState(0);
  const [wardTotalPages, setWardTotalPages] = useState(0);
  const [wardTotalElements, setWardTotalElements] = useState(0);

  // Nested Search (Wards)
  const [wardSearchTerm, setWardSearchTerm] = useState("");

  // --- LOADER STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [error, setError] = useState("");

  const [provincePageSize, setProvincePageSize] = useState(10);
  const [wardPageSize, setWardPageSize] = useState(12);

  // Abort Controllers
  const abortControllerRef = useRef<AbortController | null>(null);
  const wardAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const updateSizes = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;

      const pRows = Math.max(5, Math.floor((height - 500) / 80));
      setProvincePageSize(pRows);

      let cols = 2;
      if (width >= 1024) cols = 4;
      else if (width >= 768) cols = 3;

      const wRows = Math.max(3, Math.floor((height * 0.4) / 60));
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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError("");

      try {
        // Use client-side filtering only when a region filter is applied
        const useClientSide = selectedRegion !== null;

        if (useClientSide) {
          // Client-side mode (Region Filter)
          let sourceData = allProvincesCache;

          if (sourceData.length === 0) {
            const response = await administrativeService.getProvincesByRegion(
              selectedRegion,
              controller.signal
            );

            if (response.success) {
              sourceData = response.data;
              setAllProvincesCache(sourceData);
            } else {
              setError(response.message || "Không thể tải danh sách tỉnh thành");
              if (abortControllerRef.current === controller) setIsLoading(false);
              return;
            }
          }

          // Apply search filter on client side
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

          if (abortControllerRef.current === controller) {
            setProvinces(pagedData);
            setProvinceTotalElements(filtered.length);
            setProvinceTotalPages(Math.ceil(filtered.length / provincePageSize));
          }
        } else {
          // Server-side mode (with search handled by backend)
          const response = await administrativeService.getAllProvincesPaginated(
            page,
            provincePageSize,
            search.trim() || undefined,
            controller.signal
          );

          if (response.success) {
            if (abortControllerRef.current === controller) {
              setProvinces(response.data.content);
              setProvinceTotalPages(response.data.totalPages);
              setProvinceTotalElements(response.data.totalElements);
            }
          } else {
            setError(response.message || "Không thể tải danh sách tỉnh thành");
          }
        }
      } catch (err: unknown) {
        if ((err as any).name === "CanceledError" || (err as any).code === "ERR_CANCELED") {
          return;
        }
        setError("Tải dữ liệu tỉnh thành thất bại");
      } finally {
        if (abortControllerRef.current === controller) {
          setIsLoading(false);
        }
      }
    },
    [allProvincesCache, selectedRegion, provincePageSize]
  );

  // --- DATA LOADING: WARDS ---

  const loadWardsData = useCallback(
    async (page: number, search: string, provinceCode: string) => {
      if (wardAbortControllerRef.current) {
        wardAbortControllerRef.current.abort();
      }
      const controller = new AbortController();
      wardAbortControllerRef.current = controller;

      setIsLoadingWards(true);
      try {
        // Always use server-side pagination and search for wards
        const response = await administrativeService.getWardsByProvincePaginated(
          provinceCode,
          page,
          wardPageSize,
          search.trim() || undefined,
          controller.signal
        );

        if (response.success) {
          if (wardAbortControllerRef.current === controller) {
            setWards(response.data.content);
            setWardTotalPages(response.data.totalPages);
            setWardTotalElements(response.data.totalElements);
          }
        } else {
          console.error(response.message || "Không thể tải danh sách phường xã");
        }
      } catch (err: unknown) {
        if ((err as any).name === "CanceledError" || (err as any).code === "ERR_CANCELED") {
          return;
        }
      } finally {
        if (wardAbortControllerRef.current === controller) {
          setIsLoadingWards(false);
        }
      }
    },
    [wardPageSize]
  );

  // --- EFFECTS ---

  // Load Provinces on page/size change
  useEffect(() => {
    loadProvincesData(provincePage, searchTerm);
  }, [provincePage, provincePageSize, selectedRegion, allProvincesCache.length]);

  // Region change - reset and reload
  useEffect(() => {
    setProvincePage(0);
    setSearchTerm("");
    setAllProvincesCache([]);
  }, [selectedRegion]);

  // Debounce PROVINCE Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setProvincePage(0);
      loadProvincesData(0, searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Wards on page/size change
  useEffect(() => {
    if (expandedProvinceCode) {
      loadWardsData(wardPage, wardSearchTerm, expandedProvinceCode);
    }
  }, [wardPage, wardPageSize]);

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
    setExpandedProvinceCode(null);
  };

  const handleProvinceExpand = (provinceCode: string) => {
    if (expandedProvinceCode === provinceCode) {
      setExpandedProvinceCode(null);
    } else {
      setExpandedProvinceCode(provinceCode);
      setWardPage(0);
      setWardSearchTerm("");
      setWards([]);
      loadWardsData(0, "", provinceCode);
    }
  };

  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  return (
    <div className="min-h-screen">
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