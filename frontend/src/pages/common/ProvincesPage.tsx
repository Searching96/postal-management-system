import { useState, useEffect } from "react";
import { administrativeService } from "../../services/administrativeService";
import type { ProvinceResponse, WardResponse } from "../../models";
import { MapPin, Search, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader, Card, LoadingSpinner, Alert } from "../../components/ui";

export function ProvincesPage() {
  const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      setIsLoading(true);
      const response = await administrativeService.getAllProvinces();
      if (response.success) {
        setProvinces(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to fetch provinces");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWards = async (provinceCode: string) => {
    try {
      setIsLoadingWards(true);
      const response = await administrativeService.getWardsByProvince(
        provinceCode
      );
      if (response.success) {
        setWards(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch wards:", err);
    } finally {
      setIsLoadingWards(false);
    }
  };

  const handleProvinceClick = (provinceCode: string) => {
    if (selectedProvince === provinceCode) {
      setSelectedProvince(null);
      setWards([]);
    } else {
      setSelectedProvince(provinceCode);
      fetchWards(provinceCode);
    }
  };

  const filteredProvinces = provinces.filter(
    (province) =>
      province.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      province.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  return (
    <div>
      <PageHeader
        title="Provinces & Wards"
        description="Browse administrative units"
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search provinces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Provinces List */}
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredProvinces.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No provinces found
            </div>
          ) : (
            filteredProvinces.map((province) => (
              <div key={province.code}>
                <button
                  onClick={() => handleProvinceClick(province.code)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary-500 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {province.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {province.code} • {province.administrativeRegionName}
                      </p>
                    </div>
                  </div>
                  {selectedProvince === province.code ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {/* Wards expansion */}
                {selectedProvince === province.code && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    {isLoadingWards ? (
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-gray-500">
                          Loading wards...
                        </span>
                      </div>
                    ) : wards.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No wards found
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {wards.map((ward) => (
                          <div
                            key={ward.code}
                            className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm"
                          >
                            <p className="font-medium text-gray-900">
                              {ward.name}
                            </p>
                            <p className="text-xs text-gray-500">{ward.code}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
