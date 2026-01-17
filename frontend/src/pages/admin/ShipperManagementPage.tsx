import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Search, Pencil, Trash2, Phone, Mail } from "lucide-react";
import {
    Card,
    Button,
    Input,
    Table,
    Badge,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Label,
    PageHeader,
    FormSelect
} from "../../components/ui";
import { shipperService, CreateShipperRequest } from "../../services/ShipperService";
import type { EmployeeResponse } from "../../models";
import { toast } from "sonner"; // Assuming sonner or similar toast lib is used

export function ShipperManagementPage() {
    const [shippers, setShippers] = useState<EmployeeResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedShipper, setSelectedShipper] = useState<EmployeeResponse | null>(null);

    // Fetch shippers
    const fetchShippers = async () => {
        setIsLoading(true);
        try {
            const res = await shipperService.getShippers({ page, search: searchTerm });
            if (res.success) {
                setShippers(res.data.content);
                setTotalPages(res.data.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch shippers", error);
            toast.error("Không thể tải danh sách shipper");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchShippers();
    }, [page, searchTerm]);

    // Handle Create
    const handleCreate = async (data: CreateShipperRequest) => {
        try {
            await shipperService.createShipper(data);
            toast.success("Thêm shipper thành công");
            setIsCreateOpen(false);
            fetchShippers();
        } catch (error) {
            console.error(error);
            toast.error("Thêm shipper thất bại");
        }
    };

    // Handle Edit - Placeholder/Basic implementation
    const handleUpdate = async (data: any) => {
        if (!selectedShipper) return;
        try {
            await shipperService.updateShipper(selectedShipper.employeeId, data);
            toast.success("Cập nhật shipper thành công");
            setIsEditOpen(false);
            fetchShippers();
        } catch (error) {
            console.error(error);
            toast.error("Cập nhật thất bại");
        }
    }

    // Handle Delete
    const handleDelete = async () => {
        if (!selectedShipper) return;
        try {
            await shipperService.deleteShipper(selectedShipper.employeeId);
            toast.success("Xóa shipper thành công");
            setIsDeleteOpen(false);
            fetchShippers();
        } catch (error) {
            console.error(error);
            toast.error("Xóa shipper thất bại");
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Quản lý Shipper" description="Danh sách và phân công nhân viên giao nhận" />

            {/* Toolbar */}
            <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm shipper..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm Shipper
                </Button>
            </div>

            {/* Table */}
            <Card>
                <Table>
                    <thead>
                        <tr>
                            <th className="text-left py-3 px-4">Thông tin</th>
                            <th className="text-left py-3 px-4">Liên hệ</th>
                            <th className="text-center py-3 px-4">Trạng thái</th>
                            <th className="text-right py-3 px-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="text-center py-8">Đang tải...</td></tr>
                        ) : shippers.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-8 text-gray-500">Chưa có dữ liệu</td></tr>
                        ) : (
                            shippers.map((shipper) => (
                                <tr key={shipper.employeeId} className="border-t">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                                {shipper.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{shipper.fullName}</p>
                                                <p className="text-xs text-gray-500">ID: {shipper.employeeId.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Phone className="h-3 w-3 mr-2" /> {shipper.phoneNumber}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="h-3 w-3 mr-2" /> {shipper.email || "—"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Badge variant="success">
                                            Hoạt động
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => { setSelectedShipper(shipper); setIsEditOpen(true); }}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => { setSelectedShipper(shipper); setIsDeleteOpen(true); }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                        >
                            Trước
                        </Button>
                        <span className="flex items-center px-4 text-sm font-medium">
                            Trang {page + 1} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(page + 1)}
                        >
                            Sau
                        </Button>
                    </div>
                )}
            </Card>

            {/* Create Dialog */}
            <CreateShipperDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSubmit={handleCreate} />

            {/* Edit Dialog - Reusing Create for simplicity or creating separate */}
            {selectedShipper && (
                <EditShipperDialog
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    shipper={selectedShipper}
                    onSubmit={handleUpdate}
                />
            )}

            {/* Delete Confirmation */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        Bạn có chắc chắn muốn xóa shipper <strong>{selectedShipper?.fullName}</strong>?
                        Hành động này không thể hoàn tác.
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
                        <Button variant="danger" onClick={handleDelete}>Xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function CreateShipperDialog({ open, onOpenChange, onSubmit }: { open: boolean, onOpenChange: (open: boolean) => void, onSubmit: (data: any) => void }) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<CreateShipperRequest>();
    const [offices, setOffices] = useState<{ id: string; name: string }[]>([]);
    const [isLoadingOffices, setIsLoadingOffices] = useState(false);
    const selectedOfficeId = watch("officeId") || "";

    useEffect(() => {
        if (open) {
            fetchOffices();
        }
    }, [open]);

    const fetchOffices = async () => {
        setIsLoadingOffices(true);
        try {
            const res = await shipperService.getAvailableOffices();
            if (res.success) {
                setOffices(res.data.map((o: any) => ({ id: o.officeId, name: o.name })));
            }
        } catch (error) {
            console.error("Failed to fetch offices", error);
        } finally {
            setIsLoadingOffices(false);
        }
    };

    const submitHandler = (data: CreateShipperRequest) => {
        onSubmit(data);
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Thêm Shipper Mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(submitHandler)}>
                    <div className="space-y-4 px-6 pb-4">
                        <div className="space-y-2">
                            <Label>Họ và tên</Label>
                            <Input {...register("fullName", { required: true })} placeholder="Nguyễn Văn A" />
                        </div>
                        <div className="space-y-2">
                            <Label>Số điện thoại</Label>
                            <Input {...register("phoneNumber", { required: true })} placeholder="0901234567" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input {...register("email", { required: true })} type="email" placeholder="shipper@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Mật khẩu</Label>
                            <Input type="password" {...register("password", { required: true })} defaultValue="123456" />
                        </div>
                        <FormSelect
                            label="Đơn vị công tác"
                            required
                            value={selectedOfficeId}
                            onChange={(val) => setValue("officeId", val as string)}
                            disabled={isLoadingOffices}
                            options={[
                                { value: "", label: isLoadingOffices ? "Đang tải..." : "-- Chọn đơn vị --" },
                                ...offices.map(office => ({ value: office.id, label: office.name }))
                            ]}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                        <Button type="submit">Lưu</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditShipperDialog({ open, onOpenChange, shipper, onSubmit }: { open: boolean, onOpenChange: (open: boolean) => void, shipper: EmployeeResponse, onSubmit: (data: any) => void }) {
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            fullName: shipper.fullName,
            phoneNumber: shipper.phoneNumber,
            email: shipper.email,
            status: "ACTIVE"
        }
    });
    const selectedStatus = watch("status") || "ACTIVE";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cập nhật Shipper</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 px-6 pb-4">
                        <div className="space-y-2">
                            <Label>Họ và tên</Label>
                            <Input {...register("fullName")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Số điện thoại</Label>
                            <Input {...register("phoneNumber")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input {...register("email")} />
                        </div>
                        <FormSelect
                            label="Trạng thái"
                            value={selectedStatus}
                            onChange={(val) => setValue("status", val as string)}
                            options={[
                                { value: "ACTIVE", label: "Hoạt động" },
                                { value: "INACTIVE", label: "Ngưng hoạt động" }
                            ]}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                        <Button type="submit">Cập nhật</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
