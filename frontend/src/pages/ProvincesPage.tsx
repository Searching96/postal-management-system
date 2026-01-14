import { useState, useEffect } from "react";
import { administrativeService } from "../services/administrativeService";
import type { ProvinceResponse, WardResponse } from "../models";
import { MapPin, Search, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Provinces & Wards</h1>
        <p className="mt-1 text-gray-600">Browse administrative units</p>
      </div>

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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                        <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                        <span className="ml-2 text-gray-500">
                          Loading wards...
                        </span>
                      </div>
                    ) : wards.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No wards found
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {wards.map((ward) => (
                          <div
                            key={ward.code}
                            className="bg-white p-3 rounded-lg border border-gray-200"
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
      </div>

      {/* Stats */}
      <div className="mt-6 text-sm text-gray-500">
        Showing {filteredProvinces.length} of {provinces.length} provinces
      </div>
    </div>
  );
}
