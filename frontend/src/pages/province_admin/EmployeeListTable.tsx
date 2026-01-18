
import { useState, useEffect } from "react";
import { provinceAdminService } from "../../services/provinceAdminService";
import type { EmployeeResponse, UpdateStaffRequest } from "../../models";
import {
    Card,
    CardSkeleton,
    Button,
    Modal,
    FormInput,
    ConfirmationModal,
    Alert,
    PaginationControls,
} from "../../components/ui";
import {
    Users,
    Search,
    Phone,
    Mail,
    Building2,
    Pencil,
    Trash2,
} from "lucide-react";
import { getRoleLabel } from "../../lib/utils";

export function EmployeeListTable() {
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [pageSize, setPageSize] = useState(10);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<EmployeeResponse | null>(null);
    const [editFormData, setEditFormData] = useState<UpdateStaffRequest>({});
    const [editError, setEditError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Confirmation State
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deletingEmployee, setDeletingEmployee] = useState<EmployeeResponse | null>(null);

    // Success/Error Messages
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Dynamic page size calculation based on screen height
    useEffect(() => {
        const updatePageSize = () => {
            const height = window.innerHeight;
            const availableHeight = height - 440;
            const rows = Math.max(5, Math.floor(availableHeight / 72));
            setPageSize(rows);
        };

        updatePageSize();
        window.addEventListener("resize", updatePageSize);
        return () => window.removeEventListener("resize", updatePageSize);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEmployees();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, searchTerm, pageSize]);

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const response = await provinceAdminService.getEmployees({
                page: page,
                size: pageSize,
                search: searchTerm.trim()
            });
            if (response.success) {
                setEmployees(response.data.content);
                setTotalPages(response.data.totalPages);
                setTotalElements(response.data.totalElements);
            }
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- EDIT HANDLERS ---
    const handleEditClick = (employee: EmployeeResponse) => {
        setEditingEmployee(employee);
        setEditFormData({
            fullName: employee.fullName,
            phoneNumber: employee.phoneNumber,
            email: employee.email,
            active: true, // Default to active
        });
        setEditError("");
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmployee) return;

        setIsSubmitting(true);
        setEditError("");

        try {
            const response = await provinceAdminService.updateEmployee(editingEmployee.employeeId, editFormData);
            if (response.success) {
                setSuccessMessage("Cập nhật thông tin nhân viên thành công!");
                setIsEditModalOpen(false);
                setEditingEmployee(null);
                fetchEmployees();
            } else {
                // Handle validation errors with field-specific messages
                if (response.errorCode === "VALIDATION_ERROR" && response.data) {
                    const errorData = response.data as unknown as Record<string, string>;
                    const errorMessages = Object.values(errorData).join(", ");
                    setEditError(errorMessages || response.message || "Lỗi xác thực dữ liệu");
                } else {
                    setEditError(response.message || "Lỗi khi cập nhật nhân viên");
                }
            }
        } catch (err: unknown) {
            const errorData = (err as any).response?.data;
            if (errorData?.errorCode === "VALIDATION_ERROR" && errorData?.data) {
                const errorMessages = Object.values(errorData.data as Record<string, string>).join(", ");
                setEditError(errorMessages || errorData.message || "Lỗi xác thực dữ liệu");
            } else {
                setEditError(errorData?.message || (err as Error).message || "Lỗi kết nối máy chủ");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- DELETE HANDLERS ---
    const handleDeleteClick = (employee: EmployeeResponse) => {
        setDeletingEmployee(employee);
        setIsDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingEmployee) return;

        setIsSubmitting(true);
        try {
            const response = await provinceAdminService.deleteEmployee(deletingEmployee.employeeId);
            if (response.success) {
                setSuccessMessage("Đã xóa nhân viên thành công!");
                fetchEmployees();
            } else {
                setErrorMessage(response.message || "Lỗi khi xóa nhân viên");
            }
        } catch (err: unknown) {
            setErrorMessage((err as any).response?.data?.message || "Lỗi kết nối máy chủ");
        } finally {
            setIsSubmitting(false);
            setIsDeleteConfirmOpen(false);
            setDeletingEmployee(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Success/Error Alerts */}
            {successMessage && (
                <Alert type="success" onClose={() => setSuccessMessage("")}>
                    {successMessage}
                </Alert>
            )}
            {errorMessage && (
                <Alert type="error" onClose={() => setErrorMessage("")}>
                    {errorMessage}
                </Alert>
            )}

            {/* Search Bar */}
            <div className="flex justify-end">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm nhân viên..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => {
                            setPage(0);
                            setSearchTerm(e.target.value);
                        }}
                    />
                </div>
            </div>

            {isLoading && employees.length === 0 ? (
                <div className="grid gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : employees.length === 0 ? (
                <Card className="p-12 text-center text-gray-500 bg-gray-50 border-dashed">
                    <Users className="w-12 h-12 mb-4 mx-auto opacity-20" />
                    <p>{searchTerm ? "Không tìm thấy nhân viên nào phù hợp." : "Chưa có nhân viên nào."}</p>
                </Card>
            ) : (
                <>
                    <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Nhân viên
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Liên hệ
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Vai trò
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Đơn vị
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map((employee) => (
                                    <tr key={employee.employeeId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                                    {employee.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{employee.fullName}</div>
                                                    <div className="text-xs text-gray-500">ID: {employee.employeeId.substring(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-sm text-gray-600 gap-2">
                                                    <Mail className="w-3 h-3 text-gray-400" /> {employee.email}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 gap-2">
                                                    <Phone className="w-3 h-3 text-gray-400" /> {employee.phoneNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${employee.role === 'PROVINCE_ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                    employee.role === 'WARD_MANAGER' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-green-100 text-green-800'}`}>
                                                {getRoleLabel(employee.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                {employee.officeName || "—"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditClick(employee)}
                                                    className="h-10 w-10 p-0 text-gray-500 hover:text-primary-600 hover:bg-primary-50"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Pencil className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(employee)}
                                                    className="h-10 w-10 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <PaginationControls
                            page={page}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            pageSize={pageSize}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}

            {/* Edit Employee Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingEmployee(null);
                }}
                title="Chỉnh sửa thông tin nhân viên"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    {editError && (
                        <Alert type="error" onClose={() => setEditError("")}>
                            {editError}
                        </Alert>
                    )}

                    <FormInput
                        label="Họ và tên"
                        value={editFormData.fullName || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                        required
                    />

                    <FormInput
                        label="Email"
                        type="email"
                        value={editFormData.email || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        required
                    />

                    <FormInput
                        label="Số điện thoại"
                        value={editFormData.phoneNumber || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                        required
                        pattern="[0-9]{10}"
                        title="Số điện thoại phải có 10 chữ số"
                    />

                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="active-status"
                            checked={editFormData.active || false}
                            onChange={(e) => setEditFormData({ ...editFormData, active: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="active-status" className="text-sm text-gray-700">
                            Tài khoản đang hoạt động
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => {
                    setIsDeleteConfirmOpen(false);
                    setDeletingEmployee(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Xác nhận xóa nhân viên"
                message={`Bạn có chắc chắn muốn xóa nhân viên "${deletingEmployee?.fullName}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                variant="danger"
                isLoading={isSubmitting}
            />
        </div>
    );
}
