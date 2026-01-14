import { useState, useEffect } from "react";
import { provinceAdminService } from "../services/provinceAdminService";
import type { WardOfficePairResponse, WardAssignmentInfo } from "../models";
import { Building2, MapPin, Users, Loader2, Plus } from "lucide-react";

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Province Administration
        </h1>
        <p className="mt-1 text-gray-600">Manage ward offices and employees</p>
      </div>

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

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
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
                <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                  No ward offices found
                </div>
              ) : (
                <div className="grid gap-4">
                  {offices.map((office) => (
                    <div
                      key={office.officePairId}
                      className="bg-white rounded-xl shadow-sm p-6"
                    >
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
                    </div>
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
                <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                  No ward data available
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ward
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned To
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {wardStatus.map((ward) => (
                        <tr key={ward.wardCode}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {ward.wardName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ward.wardCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                ward.assigned
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {ward.assigned ? "Assigned" : "Unassigned"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ward.wardPostName || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === "employees" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Employee Management</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <button className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow">
                  <Users className="h-8 w-8 text-primary-500 mb-2" />
                  <h3 className="font-semibold text-gray-900">
                    Create Province Admin
                  </h3>
                  <p className="text-sm text-gray-500">
                    Add new province administrator
                  </p>
                </button>

                <button className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow">
                  <Users className="h-8 w-8 text-green-500 mb-2" />
                  <h3 className="font-semibold text-gray-900">
                    Create Ward Manager
                  </h3>
                  <p className="text-sm text-gray-500">Add new ward manager</p>
                </button>

                <button className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow">
                  <Users className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="font-semibold text-gray-900">Create Staff</h3>
                  <p className="text-sm text-gray-500">Add new staff member</p>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
