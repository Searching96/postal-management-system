import { useState, useEffect } from "react";
import { provinceAdminService } from "../../services/provinceAdminService";
import type { WardOfficePairResponse, WardAssignmentInfo } from "../../models";
import { Building2, MapPin, Users, Plus } from "lucide-react";
import { PageHeader, Card, LoadingSpinner, Alert } from "../../components/ui";

export function ProvinceAdminPage() {
  const [activeTab, setActiveTab] = useState<"offices" | "wards" | "employees">(
    "offices"
  );
  const [offices, setOffices] = useState<WardOfficePairResponse[]>([]);
  const [wardStatus, setWardStatus] = useState<WardAssignmentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeTab === "offices") {
      fetchOffices();
    } else if (activeTab === "wards") {
      fetchWardStatus();
    }
  }, [activeTab]);

  const fetchOffices = async () => {
    try {
      setIsLoading(true);
      const response = await provinceAdminService.getWardOfficePairs();
      if (response.success) {
        setOffices(response.data);
      }
    } catch (err) {
      setError("Failed to fetch offices");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWardStatus = async () => {
    try {
      setIsLoading(true);
      const response = await provinceAdminService.getWardAssignmentStatus();
      if (response.success) {
        setWardStatus(response.data);
      }
    } catch (err) {
      setError("Failed to fetch ward status");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "offices", label: "Ward Offices", icon: Building2 },
    { id: "wards", label: "Ward Assignment", icon: MapPin },
    { id: "employees", label: "Employees", icon: Users },
  ];

  return (
    <div>
      <PageHeader
        title="Province Administration"
        description="Manage ward offices and employees"
      />

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <>
          {/* Ward Offices Tab */}
          {activeTab === "offices" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Ward Office Pairs</h2>
                <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Office Pair
                </button>
              </div>

              {offices.length === 0 ? (
                <Card className="text-center text-gray-500">
                  No ward offices found
                </Card>
              ) : (
                <div className="grid gap-4">
                  {offices.map((office) => (
                    <Card key={office.officePairId}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {office.wardPostName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Warehouse: {office.wardWarehouseName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Province: {office.provinceName}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                          {office.wards.length} wards
                        </span>
                      </div>
                      {office.wards.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {office.wards.map((ward) => (
                            <span
                              key={ward.code}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {ward.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ward Assignment Tab */}
          {activeTab === "wards" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Ward Assignment Status
              </h2>
              {wardStatus.length === 0 ? (
                <Card className="text-center text-gray-500">
                  No ward data available
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {wardStatus.map((ward) => (
                    <Card key={ward.wardCode}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {ward.wardName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {ward.wardCode}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            ward.assigned
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {ward.assigned ? "Assigned" : "Unassigned"}
                        </span>
                      </div>
                      {ward.assigned && ward.officePairId && (
                        <p className="mt-2 text-sm text-gray-500">
                          Office Pair ID: {ward.officePairId}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === "employees" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Province Employees</h2>
              <Card className="text-center text-gray-500">
                Employee management coming soon
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
