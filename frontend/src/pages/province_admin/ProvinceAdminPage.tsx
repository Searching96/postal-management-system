import { useState, useEffect, useRef } from "react";
import { provinceAdminService } from "../../services/provinceAdminService";
import { administrativeService } from "../../services/administrativeService";
import { userService } from "../../services/userService";
import type {
  WardOfficePairResponse,
  WardAssignmentInfo,
  CreateWardOfficeRequest,
  ProvinceResponse,
  EmployeeMeResponse
} from "../../models";
import {
  Building2,
  MapPin,
  Users,
  Plus,
  Phone,
  Mail,
  Search,
  User as UserIcon,
  Lock as LockIcon,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import {
  PageHeader,
  Card,
  Alert,
  FormSelect,
  ConfirmationModal,
  CardSkeleton,
  Button,
  Modal,
  FormInput,
  AddressSelector,
} from "../../components/ui";
import { PaginationControls } from "../../components/ui";
import { getRoleLabel } from "../../lib/utils";
import { EmployeeListTable } from "./EmployeeListTable";

export function ProvinceAdminPage() {
  const [activeTab, setActiveTab] = useState<"offices" | "wards" | "employees">("offices");
  const [offices, setOffices] = useState<WardOfficePairResponse[]>([]);
  const [wardStatus, setWardStatus] = useState<WardAssignmentInfo[]>([]);
  const [wardPage, setWardPage] = useState(0);
  const [wardPageSize, setWardPageSize] = useState(12);
  const [wardTotalPages, setWardTotalPages] = useState(0);
  const [wardTotalElements, setWardTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
  const [currentAdminProvince, setCurrentAdminProvince] = useState<{ code: string; name: string } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Modal States
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  // Selected for assignment
  const [selectedOfficePair, setSelectedOfficePair] = useState<string>("");
  const [selectedWards, setSelectedWards] = useState<string[]>([]);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [statusFilter, setStatusFilter] = useState<"all" | "assigned" | "unassigned">("all");

  // Confirmation State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({ title: "", message: "", action: async () => { } });

  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Determine columns (matching tailwind sm, lg, xl breakpoints)
      let cols = 1;
      if (width >= 1280) cols = 4;
      else if (width >= 1024) cols = 3;
      else if (width >= 640) cols = 2;

      // Calculate rows based on available vertical space
      // Header (~250px) + Tabs (~60px) + Controls (~80px) + Pagination (~100px) = ~500px offset
      // Card height is approx 180px
      const availableHeight = height - 500;
      const rows = Math.max(2, Math.floor(availableHeight / 180));

      const pageSize = cols * rows;
      setItemsPerPage(pageSize);
      setWardPageSize(pageSize);
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => {
    fetchData();
    fetchProvinces();
    fetchAdminProfile();
  }, [activeTab, wardPage, wardPageSize, searchTerm, statusFilter]);

  useEffect(() => {
    setWardPage(0);
    setModalSearchTerm(""); // Reset modal search on tab change
  }, [activeTab, searchTerm, statusFilter]);


  const paginatedOffices = offices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalOfficePages = Math.ceil(offices.length / itemsPerPage);

  const [allWards, setAllWards] = useState<WardAssignmentInfo[]>([]);

  const openAssignModal = async (pairId?: string) => {
    setIsLoading(true);
    try {
      // For assign modal, we always fetch ALL wards (status=all) for correct pre-selection
      const response = await provinceAdminService.getWardAssignmentStatusPaginated(
        currentAdminProvince?.code,
        0,
        9999, // large enough to get all
        "",
        "all"
      );
      if (response.success) {
        setAllWards(response.data.content ?? []); // Store full list for modal

        setSelectedOfficePair(pairId || "");
        const pair = pairId ? offices.find((o) => o.officePairId === pairId) : null;

        const alreadyAssigned = response.data.content
          .filter((w: WardAssignmentInfo) => pair && w.assignedPostOfficeId === pair.postOffice.officeId)
          .map((w: WardAssignmentInfo) => w.wardCode);

        // If specific pre-selected wards are passed, use them instead (e.g. from Ward Card "Assign" button)
        // Note: The UI logic might need `selectedWards` to be merged if we support multi-select from different sources, 
        // but typically "Assign" button implies starting fresh or adding to current.
        // For now, let's say if we didn't pass a specific pairId (meaning we just opened the modal generally), 
        // we might rely on the user picking a pair to see assignments. 
        // BUT if we click "Assign" on a ward, we want that ward selected.

        // Wait, the original logic was: openAssignModal(pairId).
        // If we want to assign a specific ward, we might need a different signature or logic.
        // Let's modify the signature in the component scope or state handling.

        // Actually, let's keep the existing logic: if pairId is provided, we select the pair.
        // The selection of wards happens via state `selectedWards`.
        // We will handle "Assign" button click by setting `selectedWards` directly before calling/opening modal.

        // So here we only reset if we are switching pairs, or if we want to sync with backend.
        // If `selectedWards` was set by the "Assign" button (which calls this function or sets state then opens), 
        // we should be careful not to overwrite it if no pairId is passed or if we want to preserve it.

        // However, `openAssignModal` is currently used by the Card's "Phân Phối" button which passes a pairId.
        // The new "Assign" button on Ward Card will likely call this with NO pairId, but `selectedWards` set.

        if (pairId) {
          setSelectedWards(alreadyAssigned);
        }
        // If no pairId (general open or from Ward Assign button), we don't overwrite selectedWards here 
        // (assuming they might be set before calling this, or we want them empty).
        // But wait, `fetchData` might have refreshed `offices` etc.

        setIsAssignModalOpen(true);
      }
    } catch (err) {
      setError("Không thể tải danh sách phường xã");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminProfile = async () => {
    try {
      const response = await userService.fetchMe();
      if (response.success && response.data.role !== "CUSTOMER") {
        const adminProfile = response.data as EmployeeMeResponse;
        if (adminProfile.office?.province) {
          setCurrentAdminProvince({
            code: adminProfile.office.province.code,
            name: adminProfile.office.province.name
          });
          // Also set initial province in form
          setOfficeFormData(prev => ({
            ...prev,
            provinceCode: adminProfile.office.province?.code || ""
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin profile", err);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await administrativeService.getAllProvinces();
      if (response.success) setProvinces(response.data);
    } catch (err) {
      console.error("Failed to fetch provinces");
    }
  };

  const fetchData = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError("");

    try {
      if (activeTab === "offices") {
        const response = await provinceAdminService.getWardOfficePairs(controller.signal);
        if (response.success && abortControllerRef.current === controller) {
          setOffices(response.data);
        }
      } else if (activeTab === "wards") {
        const response = await provinceAdminService.getWardAssignmentStatusPaginated(
          currentAdminProvince?.code,
          wardPage,
          wardPageSize,
          searchTerm,
          statusFilter,
          controller.signal
        );
        if (response.success && abortControllerRef.current === controller) {
          setWardStatus(response.data.content ?? []);
          setWardTotalPages(response.data.totalPages ?? 0);
          setWardTotalElements(response.data.totalElements ?? 0);
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { name?: string; code?: string; response?: { status?: number } };
      if (axiosErr.name === "CanceledError" || axiosErr.code === "ERR_CANCELED") return;
      if (abortControllerRef.current === controller) {
        setError("Không thể tải dữ liệu");
      }
    } finally {
      if (abortControllerRef.current === controller) setIsLoading(false);
    }
  };

  // --- CREATE OFFICE PAIR ---
  const [officeFormData, setOfficeFormData] = useState<CreateWardOfficeRequest>({
    warehouseName: "",
    warehouseEmail: "",
    warehousePhoneNumber: "",
    warehouseAddress: "",
    warehouseCapacity: 1000,
    postOfficeName: "",
    postOfficeEmail: "",
    postOfficePhoneNumber: "",
    postOfficeAddress: "",
    provinceCode: "",
  });

  const [officeErrors, setOfficeErrors] = useState<Record<string, string>>({});

  const validateOfficeForm = () => {
    const errors: Record<string, string> = {};
    const phoneRegex = /^[0-9]{10,11}$/;

    if (!officeFormData.provinceCode) errors.provinceCode = "Vui lòng chọn Tỉnh/Thành quản lý";

    // Warehouse
    if (!officeFormData.warehouseName) errors.warehouseName = "Tên kho không được để trống";
    if (!officeFormData.warehouseEmail) errors.warehouseEmail = "Email không được để trống";
    if (!phoneRegex.test(officeFormData.warehousePhoneNumber)) {
      errors.warehousePhoneNumber = "Số điện thoại kho phải từ 10-11 chữ số";
    }
    if (!officeFormData.warehouseAddress || officeFormData.warehouseAddress.split(", ").length < 2) {
      errors.warehouseAddress = "Vui lòng chọn đầy đủ địa chỉ kho (Phường/Xã và Số nhà)";
    }
    if (!officeFormData.warehouseCapacity || officeFormData.warehouseCapacity <= 0) {
      errors.warehouseCapacity = "Công suất kho phải lớn hơn 0";
    }

    // Post Office
    if (!officeFormData.postOfficeName) errors.postOfficeName = "Tên bưu cục không được để trống";
    if (!officeFormData.postOfficeEmail) errors.postOfficeEmail = "Email không được để trống";
    if (!phoneRegex.test(officeFormData.postOfficePhoneNumber)) {
      errors.postOfficePhoneNumber = "Số điện thoại bưu cục phải từ 10-11 chữ số";
    }
    if (!officeFormData.postOfficeAddress || officeFormData.postOfficeAddress.split(", ").length < 2) {
      errors.postOfficeAddress = "Vui lòng chọn đầy đủ địa chỉ bưu cục (Phường/Xã và Số nhà)";
    }

    setOfficeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfficeErrors({});

    if (!validateOfficeForm()) return;

    setIsLoading(true);
    try {
      const response = await provinceAdminService.createWardOfficePair(officeFormData);
      if (response.success) {
        setSuccess("Tạo bưu cục và kho thành công");
        setIsOfficeModalOpen(false);
        setOfficeFormData({
          warehouseName: "", warehouseEmail: "", warehousePhoneNumber: "", warehouseAddress: "", warehouseCapacity: 1000,
          postOfficeName: "", postOfficeEmail: "", postOfficePhoneNumber: "", postOfficeAddress: "",
          provinceCode: currentAdminProvince?.code || "",
        });
        fetchData();
      } else {
        // Handle duplicate email errors
        let errors: Record<string, string> = {};
        if (response.message?.includes("Post office email already exists")) {
          errors.postOfficeEmail = response.message;
        }
        if (response.message?.includes("Warehouse email already exists")) {
          errors.warehouseEmail = response.message;
        }
        if (Object.keys(errors).length > 0) {
          setOfficeErrors(errors);
          setError("");
        } else if (response.errorCode === "VALIDATION_ERROR" && response.data) {
          setOfficeErrors(response.data as unknown as Record<string, string>);
          setError("Thông tin nhập vào không hợp lệ. Vui lòng kiểm tra lại.");
        } else {
          setError(response.message || "Lỗi khi tạo bưu cục");
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errorCode?: string; data?: Record<string, string> } } };
      const errorData = axiosErr.response?.data;
      let errors: Record<string, string> = {};
      if (errorData?.message?.includes("Post office email already exists")) {
        errors.postOfficeEmail = errorData.message;
      }
      if (errorData?.message?.includes("Warehouse email already exists")) {
        errors.warehouseEmail = errorData.message;
      }
      if (Object.keys(errors).length > 0) {
        setOfficeErrors(errors);
        setError("");
      } else if (errorData?.errorCode === "VALIDATION_ERROR" && errorData.data) {
        setOfficeErrors(errorData.data);
        setError("Lỗi xác thực từ máy chủ");
      } else {
        setError("Lỗi kết nối đến máy chủ");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignWards = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficePair) return;

    setConfirmConfig({
      title: "Xác nhận phân bổ",
      message: `Bạn có chắc chắn muốn cập nhật phân bổ cho ${selectedWards.length} phường/xã vào cặp bưu cục này không?`,
      action: async () => {
        setIsLoading(true);
        try {
          const response = await provinceAdminService.assignWardsToOfficePair({
            officePairId: selectedOfficePair,
            wardCodes: selectedWards,
          });
          if (response.success) {
            setSuccess("Gán phường/xã thành công");
            setIsAssignModalOpen(false);
            setSelectedWards([]);
            fetchData(); // Refresh the list
          } else {
            setError(response.message);
          }
        } catch (err) {
          setError("Lỗi khi gán phường/xã");
        } finally {
          setIsLoading(false);
          setIsConfirmOpen(false);
        }
      },
    });
    setIsConfirmOpen(true);
  };

  // --- CREATE EMPLOYEE ---
  const [employeeRole, setEmployeeRole] = useState<"WARD_MANAGER" | "STAFF" | "PROVINCE_ADMIN">("STAFF");
  const [employeeFormData, setEmployeeFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    officeId: ""
  });

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear any previous errors
    try {
      let response;
      if (employeeRole === "WARD_MANAGER") {
        response = await provinceAdminService.createWardManager(employeeFormData);
      } else if (employeeRole === "STAFF") {
        response = await provinceAdminService.createStaff(employeeFormData);
      } else {
        response = await provinceAdminService.createProvinceAdmin({
          fullName: employeeFormData.fullName,
          phoneNumber: employeeFormData.phoneNumber,
          email: employeeFormData.email,
          password: employeeFormData.password
        });
      }

      if (response.success) {
        setSuccess("Tạo nhân viên thành công");
        setIsEmployeeModalOpen(false);
        setEmployeeFormData({ fullName: "", phoneNumber: "", email: "", password: "", officeId: "" });
      } else {
        // Handle validation errors
        if (response.errorCode === "VALIDATION_ERROR" && response.data) {
          const errorData = response.data as unknown as Record<string, string>;
          const errorMessages = Object.values(errorData).join(", ");
          setError(errorMessages || response.message || "Lỗi xác thực dữ liệu");
        } else {
          setError(response.message || "Lỗi khi tạo nhân viên");
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errorCode?: string; data?: Record<string, string> } }; message?: string };
      const errorData = axiosErr.response?.data;
      if (errorData?.errorCode === "VALIDATION_ERROR" && errorData?.data) {
        const errorMessages = Object.values(errorData.data).join(", ");
        setError(errorMessages || errorData.message || "Lỗi xác thực dữ liệu");
      } else {
        setError(errorData?.message || axiosErr.message || "Lỗi khi tạo nhân viên");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "offices", label: "Cặp Bưu Cục & Kho", icon: Building2 },
    { id: "wards", label: "Phân bổ Phường/Xã", icon: MapPin },
    { id: "employees", label: "Nhân Sự Tỉnh", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản trị Tỉnh"
        description={currentAdminProvince
          ? `Quản lý mạng lưới bưu cục, kho bãi và nhân sự tại tỉnh ${currentAdminProvince.name}`
          : "Quản lý mạng lưới bưu cục, kho bãi và đội ngũ nhân sự trong tỉnh"
        }
      />

      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === tab.id
              ? "bg-primary-600 text-white shadow-md shadow-primary-200"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {error && <Alert type="error" onClose={() => setError("")} className="animate-in fade-in slide-in-from-top-2">{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess("")} className="animate-in fade-in slide-in-from-top-2">{success}</Alert>}

      {/* --- WARD OFFICES TAB --- */}
      {activeTab === "offices" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Danh sách Cặp Bưu Cục</h2>
            <Button onClick={() => setIsOfficeModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Tạo Cặp Mới
            </Button>
          </div>

          {isLoading && !isOfficeModalOpen && !isAssignModalOpen ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>

              {offices.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-gray-500">
                  <Building2 className="w-12 h-12 mb-4 opacity-20" />
                  <p>Chưa có cặp bưu cục/kho nào được tạo.</p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {paginatedOffices.map((pair) => (
                    <Card key={pair.officePairId} className="group hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 overflow-hidden !p-0">
                      <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-white">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-50 rounded-lg">
                            <span className="block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-none">Cặp đơn vị Phường</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{pair.provinceName || "Vùng Quản Lý"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100">
                          <MapPin className="w-3 h-3 text-primary-600" />
                          <span className="text-[10px] font-bold text-primary-700">{(pair.assignedWards || []).length} Vùng</span>
                        </div>
                      </div>

                      <div className="p-5 space-y-4 bg-gray-50/30">
                        {/* Post Office Block */}
                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm group-hover:border-primary-200 transition-colors">
                          <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                            <MapPin className="w-4 h-4 text-primary-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bưu cục</p>
                            <h4 className="text-sm font-bold text-gray-900 truncate">{pair.postOffice.officeName}</h4>
                          </div>
                        </div>

                        {/* Warehouse Block */}
                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm group-hover:border-indigo-200 transition-colors">
                          <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kho bãi</p>
                            <h4 className="text-sm font-bold text-gray-900 truncate">{pair.warehouse.officeName}</h4>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-3 bg-white border-t border-gray-50 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {(pair.assignedWards || []).slice(0, 3).map((ward: any) => (
                            <div key={ward.wardCode} className="w-6 h-6 rounded-full bg-white border-2 border-primary-50 flex items-center justify-center text-[8px] font-bold text-primary-600 shadow-sm" title={ward.wardName}>
                              {(ward.wardName || "").substring(0, 1)}
                            </div>
                          ))}
                          {(pair.assignedWards || []).length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-400 shadow-sm">
                              +{(pair.assignedWards || []).length - 3}
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] font-bold gap-1 px-2"
                          onClick={() => openAssignModal(pair.officePairId)}
                        >
                          Phân Phối <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {totalOfficePages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-8">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalOfficePages }, (_, i) => i + 1)
                      .filter(page => {
                        return page === 1 || page === totalOfficePages || Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center gap-1">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="text-gray-300 px-1">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "primary" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`h-8 w-8 p-0 text-xs font-bold transition-all ${currentPage === page
                              ? "shadow-md shadow-primary-200"
                              : "text-gray-500 hover:text-primary-600 hover:bg-primary-50"
                              }`}
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === totalOfficePages}
                    onClick={() => setCurrentPage(prev => Math.min(totalOfficePages, prev + 1))}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "wards" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Tình trạng Phân bổ</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc mã..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  value={searchTerm}
                  onChange={e => { setWardPage(0); setSearchTerm(e.target.value); }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatusFilter(statusFilter === "assigned" ? "all" : "assigned")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 h-auto rounded-lg transition-all ${statusFilter === "assigned"
                    ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === "assigned" ? "bg-green-500 animate-pulse" : "bg-green-500/40"}`}></span>
                  Đã gán
                </Button>
                <div className="w-px h-4 bg-gray-100 mx-0.5"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatusFilter(statusFilter === "unassigned" ? "all" : "unassigned")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 h-auto rounded-lg transition-all ${statusFilter === "unassigned"
                    ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === "unassigned" ? "bg-yellow-500 animate-pulse" : "bg-yellow-500/40"}`}></span>
                  Chưa gán
                </Button>
              </div>
            </div>
          </div>

          {isLoading && !isOfficeModalOpen && !isAssignModalOpen ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: wardPageSize }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : wardStatus.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-gray-400 bg-gray-50/50 border-dashed">
              <Search className="w-12 h-12 mb-4 opacity-10" />
              <p className="font-medium">Không tìm thấy phường xã nào khớp với yêu cầu.</p>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {wardStatus.map((ward) => (
                  <Card
                    key={ward.wardCode}
                    className={`group !p-4 border-l-[6px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${ward.isAssigned ? 'border-l-green-500 bg-green-50/20' : 'border-l-yellow-500 bg-yellow-50/20'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-extrabold text-gray-900 leading-tight group-hover:text-primary-700 transition-colors" title={ward.wardName}>
                          {ward.wardName}
                        </h3>
                        <div className="mt-1">
                          <span className="text-[12px] font-bold py-0.5 px-2 bg-gray-200/50 text-gray-600 rounded-md uppercase tracking-wider font-mono">
                            {ward.wardCode}
                          </span>
                        </div>
                      </div>
                      <div className={`p-2.5 rounded-2xl transition-all duration-300 ${ward.isAssigned
                        ? 'bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white'
                        : 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white'
                        }`}>
                        {ward.isAssigned ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200/40">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold leading-none mb-2">Đơn vị quản lý</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-colors ${ward.isAssigned ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <p className={`text-[16px] font-bold truncate flex-1 ${ward.isAssigned ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                          {offices.find(o => o.postOffice.officeId === ward.assignedPostOfficeId)?.postOffice.officeName || "Chưa phân bổ"}
                        </p>
                        {!ward.isAssigned ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 px-3 text-[11px] font-bold border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300 shadow-sm"
                            onClick={() => {
                              setSelectedWards([ward.wardCode]);
                              setSelectedOfficePair("");
                              setIsAssignModalOpen(true);
                              openAssignModal();
                            }}
                          >
                            Phân bổ <ChevronRight className="w-3 h-3" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 text-gray-400 group-hover:text-primary-600 group-hover:bg-primary-50 transition-colors"
                            title="Phân bổ lại"
                            onClick={() => {
                              setSelectedWards([ward.wardCode]);
                              setSelectedOfficePair("");
                              setIsAssignModalOpen(true);
                              openAssignModal();
                            }}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {wardTotalPages > 1 && (
                <PaginationControls
                  page={wardPage}
                  totalPages={wardTotalPages}
                  totalElements={wardTotalElements}
                  pageSize={wardPageSize}
                  onPageChange={setWardPage}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* --- EMPLOYEES TAB --- */}
      {activeTab === "employees" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Quản lý Nhân sự</h2>
            <div className="flex gap-2 w-full md:w-auto">
              {/* Search could be added here later */}
              <Button onClick={() => setIsEmployeeModalOpen(true)} className="gap-2 flex-1 md:flex-none justify-center">
                <UserIcon className="h-4 w-4" /> Thêm Nhân Viên
              </Button>
            </div>
          </div>

          <EmployeeListTable />
        </div>
      )}

      {/* --- MODALS --- */}

      {/* 1. CREATE OFFICE PAIR MODAL */}
      <Modal
        isOpen={isOfficeModalOpen}
        onClose={() => setIsOfficeModalOpen(false)}
        title="Tạo Cặp Bưu Cục & Kho Mới"
      >
        <form onSubmit={handleCreateOffice} className="space-y-8">
          <div className="space-y-10">
            {/* Shared Province Selection - Only show if currentAdminProvince is not set (e.g. higher level admins) */}
            {!currentAdminProvince && (
              <div className="p-5 bg-primary-50/30 border border-primary-100 rounded-2xl" style={{ overflow: 'visible' }}>
                <FormSelect
                  label="Tỉnh / Thành phố quản lý"
                  icon={Building2}
                  required
                  value={officeFormData.provinceCode || ""}
                  onChange={val => setOfficeFormData(prev => ({ ...prev, provinceCode: val as string }))}
                  error={officeErrors.provinceCode}
                  options={[
                    { value: "", label: "-- Chọn Tỉnh/Thành --" },
                    ...provinces.map(p => ({ value: p.code, label: p.name }))
                  ]}
                />
                <p className="mt-2 text-[10px] text-primary-600 font-bold uppercase tracking-wider ml-1">
                  Lưu ý: Hai đơn vị Warehouse và Post Office sẽ được khởi tạo trong cùng một tỉnh thành
                </p>
              </div>
            )}

            {/* Warehouse Section */}
            <div className="space-y-6 p-6 bg-indigo-50/30 border border-indigo-100 rounded-3xl relative">
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                  <Building2 className="w-32 h-32 text-indigo-900" />
                </div>
              </div>

              <div className="relative flex items-center gap-3 pb-3 border-b border-indigo-100/50">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-950 leading-tight uppercase tracking-tight">Kho Phường (Ward Warehouse)</h4>
                  <p className="text-[11px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Hệ thống lưu trữ & phân phối</p>
                </div>
              </div>

              <div className="relative">
                <FormInput
                  label="Tên Kho"
                  required
                  value={officeFormData.warehouseName}
                  onChange={e => setOfficeFormData(prev => ({ ...prev, warehouseName: e.target.value }))}
                  error={officeErrors.warehouseName}
                  className="!bg-white"
                />
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-end gap-2">
                  <div className="relative w-full">
                    <FormInput
                      label="Công suất kho"
                      type="number"
                      required
                      value={officeFormData.warehouseCapacity}
                      onChange={e => setOfficeFormData(prev => ({ ...prev, warehouseCapacity: Number(e.target.value) }))}
                      error={officeErrors.warehouseCapacity}
                      className="!bg-white"
                      min={1}
                      suffix={
                        <>
                          <span className="w-px h-5 bg-gray-200 mx-2"></span>
                          <span className="text-sm font-medium text-gray-500">kiện</span>
                        </>
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Email Kho"
                  type="email"
                  required
                  value={officeFormData.warehouseEmail}
                  onChange={e => setOfficeFormData(prev => ({ ...prev, warehouseEmail: e.target.value }))}
                  error={officeErrors.warehouseEmail}
                  className="!bg-white"
                />
                <FormInput
                  label="SĐT Kho"
                  required
                  value={officeFormData.warehousePhoneNumber}
                  onChange={e => setOfficeFormData(prev => ({ ...prev, warehousePhoneNumber: e.target.value }))}
                  error={officeErrors.warehousePhoneNumber}
                  className="!bg-white"
                />
              </div>

              <div className="relative">
                <AddressSelector
                  label="Địa chỉ Kho"
                  required
                  provinceCode={officeFormData.provinceCode}
                  hideProvince
                  onAddressChange={val => setOfficeFormData(prev => ({ ...prev, warehouseAddress: val }))}
                />
                {officeErrors.warehouseAddress && (
                  <p className="text-xs font-medium text-red-500 mt-1 ml-1">{officeErrors.warehouseAddress}</p>
                )}
              </div>
            </div>

            {/* Post Office Section */}
            <div className="space-y-6 p-6 bg-primary-50/30 border border-primary-100 rounded-3xl relative">
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                  <MapPin className="w-32 h-32 text-primary-900" />
                </div>
              </div>

              <div className="relative flex items-center gap-3 pb-3 border-b border-primary-100/50">
                <div className="p-2 bg-primary-100 rounded-xl">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-bold text-primary-950 leading-tight uppercase tracking-tight">Bưu cục Phường (Post Office)</h4>
                  <p className="text-[11px] text-primary-500 font-bold uppercase tracking-widest mt-0.5">Dịch vụ bưu chính & Giao nhận</p>
                </div>
              </div>

              <div className="relative">
                <FormInput
                  label="Tên Bưu Cục"
                  required
                  value={officeFormData.postOfficeName}
                  onChange={e => setOfficeFormData(prev => ({ ...prev, postOfficeName: e.target.value }))}
                  error={officeErrors.postOfficeName}
                  className="!bg-white"
                />
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Email Bưu Cục"
                  type="email"
                  required
                  value={officeFormData.postOfficeEmail}
                  onChange={e => setOfficeFormData(prev => ({ ...prev, postOfficeEmail: e.target.value }))}
                  error={officeErrors.postOfficeEmail}
                  className="!bg-white"
                />
                <FormInput
                  label="SĐT Bưu Cục"
                  required
                  value={officeFormData.postOfficePhoneNumber}
                  onChange={e => setOfficeFormData(prev => ({ ...prev, postOfficePhoneNumber: e.target.value }))}
                  error={officeErrors.postOfficePhoneNumber}
                  className="!bg-white"
                />
              </div>

              <div className="relative">
                <AddressSelector
                  label="Địa chỉ Bưu Cục"
                  required
                  provinceCode={officeFormData.provinceCode}
                  hideProvince
                  onAddressChange={val => setOfficeFormData(prev => ({ ...prev, postOfficeAddress: val }))}
                />
                {officeErrors.postOfficeAddress && (
                  <p className="text-xs font-medium text-red-500 mt-1 ml-1">{officeErrors.postOfficeAddress}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => setIsOfficeModalOpen(false)}>Hủy</Button>
            <Button type="submit" isLoading={isLoading}>Lưu Thông Tin</Button>
          </div>
        </form>
      </Modal>

      {/* 2. ASSIGN WARDS MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Gán Phường/Xã Phụ Trách"
      >
        <form onSubmit={handleAssignWards} className="space-y-6">
          <FormSelect
            label="Chọn Cặp Bưu Cục"
            placeholder="-- Chọn một cặp --"
            required
            value={selectedOfficePair}
            onChange={val => {
              const pairId = val as string;
              const wasEmptyPair = !selectedOfficePair; // Check if we are coming from a "no pair selected" state

              setSelectedOfficePair(pairId);
              const pair = offices.find(o => o.officePairId === pairId);

              // Get wards already assigned to this pair
              const sourceWards = allWards.length > 0 ? allWards : (wardStatus ?? []);
              const pairAssignedWards = sourceWards
                .filter(w => pair && w.assignedPostOfficeId === pair.postOffice.officeId)
                .map(w => w.wardCode);

              if (wasEmptyPair) {
                // Merge existing user selection (e.g. from Assign button) with the pair's assignments
                const merged = Array.from(new Set([...selectedWards, ...pairAssignedWards]));
                setSelectedWards(merged);
              } else {
                // Standard behavior: Reset to the new pair's assignments
                setSelectedWards(pairAssignedWards);
              }
            }}
            options={offices.map(o => ({
              value: o.officePairId,
              label: `${o.postOffice.officeName} (${(o.assignedWards || []).length} đã gán)`
            }))}
            searchable
          />

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-gray-700">Chọn các Phường/Xã (Quản lý khu vực)</label>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm nhanh..."
                  className="w-full pl-8 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  value={modalSearchTerm}
                  onChange={e => setModalSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg bg-gray-50">
              {(allWards.length > 0 ? allWards : wardStatus ?? [])
                .filter(w => {
                  // Show ALL wards
                  const matchesSearch = w.wardName.toLowerCase().includes(modalSearchTerm.toLowerCase()) || w.wardCode.includes(modalSearchTerm);
                  return matchesSearch;
                })
                .sort((a, b) => {
                  // Sort by isAssigned desc (assigned first)
                  if (a.isAssigned !== b.isAssigned) return a.isAssigned ? -1 : 1;
                  return a.wardName.localeCompare(b.wardName, 'vi');
                })
                .map(ward => {
                  const pair = offices.find(o => o.officePairId === selectedOfficePair);
                  // Check if assigned to the CURRENTLY selected pair
                  const isAssignedToCurrent = ward.isAssigned && pair && ward.assignedPostOfficeId === pair.postOffice.officeId;
                  // Check if assigned to ANY OTHER pair
                  const isAssignedToOther = ward.isAssigned && (!pair || ward.assignedPostOfficeId !== pair.postOffice.officeId);

                  // Find the name of the office it's currently assigned to (if any)
                  const currentAssignedOfficeName = ward.isAssigned
                    ? offices.find(o => o.postOffice.officeId === ward.assignedPostOfficeId)?.postOffice.officeName
                    : null;

                  return (
                    <label key={ward.wardCode} className={`flex items-center gap-2 p-2 rounded border transition-colors cursor-pointer group ${selectedWards.includes(ward.wardCode)
                      ? "bg-primary-50 border-primary-200"
                      : "bg-white border-gray-100 hover:border-primary-300"
                      }`}>
                      <input
                        type="checkbox"
                        className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                        checked={selectedWards.includes(ward.wardCode)}
                        onChange={e => {
                          if (e.target.checked) setSelectedWards([...selectedWards, ward.wardCode]);
                          else setSelectedWards(selectedWards.filter(c => c !== ward.wardCode));
                        }}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-bold truncate ${selectedWards.includes(ward.wardCode) ? "text-primary-700" : "text-gray-700"}`}>
                          {ward.wardName}
                        </span>
                        {isAssignedToCurrent && (
                          <span className="text-[9px] text-primary-500 font-bold uppercase tracking-tight">Đang gán cho cặp này</span>
                        )}
                        {isAssignedToOther && (
                          <span className="text-[9px] text-orange-500 font-bold uppercase tracking-tight truncate flex items-center gap-1" title={`Đang gán cho: ${currentAssignedOfficeName}`}>
                            Đang gán: {currentAssignedOfficeName}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              {(allWards.length > 0 ? allWards : wardStatus ?? []).filter(w => w.wardName.toLowerCase().includes(modalSearchTerm.toLowerCase()) || w.wardCode.includes(modalSearchTerm)).length === 0 && (
                <div className="col-span-2 py-8 flex flex-col items-center justify-center text-gray-400">
                  <Search className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm italic">Không tìm thấy phường xã nào</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>Hủy</Button>
            <Button type="submit" isLoading={isLoading} disabled={selectedWards.length === 0}>Gán {selectedWards.length} Khu Vực</Button>
          </div>
        </form>
      </Modal>

      {/* 3. CREATE EMPLOYEE MODAL */}
      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        title="Thêm Nhân Viên Mới"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          {error && (
            <Alert type="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          <div className="flex gap-4 p-1 bg-gray-100 rounded-lg mb-6">
            {["STAFF", "WARD_MANAGER", "PROVINCE_ADMIN"].map(role => (
              <button
                type="button"
                key={role}
                onClick={() => setEmployeeRole(role as any)}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${employeeRole === role ? "bg-white text-primary-600 shadow-sm" : "text-gray-500"
                  }`}
              >
                {getRoleLabel(role)}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              label="Họ và Tên"
              icon={UserIcon}
              required
              value={employeeFormData.fullName}
              onChange={e => setEmployeeFormData({ ...employeeFormData, fullName: e.target.value })}
            />
            <FormInput
              label="Số Điện Thoại"
              icon={Phone}
              required
              value={employeeFormData.phoneNumber}
              onChange={e => setEmployeeFormData({ ...employeeFormData, phoneNumber: e.target.value })}
            />
            <FormInput
              label="Email"
              icon={Mail}
              type="email"
              required
              value={employeeFormData.email}
              onChange={e => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
            />
            <FormInput
              label="Mật Khẩu"
              icon={LockIcon}
              type="password"
              required
              value={employeeFormData.password}
              onChange={e => setEmployeeFormData({ ...employeeFormData, password: e.target.value })}
            />
          </div>

          {employeeRole !== "PROVINCE_ADMIN" && (
            <FormSelect
              label="Chọn Bưu cục / Kho công tác"
              placeholder="-- Chọn đơn vị --"
              required
              value={employeeFormData.officeId}
              onChange={val => setEmployeeFormData({ ...employeeFormData, officeId: val as string })}
              options={offices.flatMap(pair => [
                { value: pair.postOffice.officeId, label: `[Bưu cục] ${pair.postOffice.officeName}`, group: pair.postOffice.officeName },
                { value: pair.warehouse.officeId, label: `[Kho] ${pair.warehouse.officeName}`, group: pair.postOffice.officeName }
              ])}
              searchable
            />
          )}

          <div className="flex justify-end gap-3 pt-6 border-t mt-4">
            <Button variant="ghost" onClick={() => setIsEmployeeModalOpen(false)}>Hủy</Button>
            <Button type="submit" isLoading={isLoading}>Tạo Nhân Viên</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isLoading={isLoading}
      />
    </div >
  );
}