import { useState } from "react";
import { MessageSquare, Phone, User, Package, AlertCircle, Check } from "lucide-react";
import {
    Card,
    Table,
    PageHeader,
    Badge
} from "../../components/ui";

// Mock data types matching user request
interface Complaint {
    id: string;
    trackingNumber: string;
    senderName: string;
    senderPhone: string;
    creatorName: string;
    creatorPhone: string;
    shipperName: string | null;
    shipperPhone: string | null;
    status: string;
    description: string;
    createdAt: string;
}

// Mock data
const MOCK_COMPLAINTS: Complaint[] = [
    {
        id: "1",
        trackingNumber: "VN000123456",
        senderName: "Nguyễn Văn A",
        senderPhone: "0901234567",
        creatorName: "Trần Thị Hồng",
        creatorPhone: "0993334444",
        shipperName: "Shipper Thủ Đức 1",
        shipperPhone: "0940100001",
        status: "PENDING",
        description: "Giao hàng trễ quá 3 ngày so với cam kết",
        createdAt: "2026-01-19T10:30:00"
    },
    {
        id: "2",
        trackingNumber: "VN000987654",
        senderName: "Phạm Thị B",
        senderPhone: "0918765432",
        creatorName: "Nguyễn Văn Hải",
        creatorPhone: "0991112222",
        shipperName: null, // Null shipper info as requested
        shipperPhone: null,
        status: "RESOLVED",
        description: "Kiện hàng bị móp méo khi nhận tại bưu cục",
        createdAt: "2026-01-18T14:15:00"
    }
];

export function ComplaintPage() {
    const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);

    const pendingComplaints = complaints.filter(c => c.status === "PENDING");
    const otherComplaints = complaints.filter(c => c.status !== "PENDING");

    const handleResolve = (id: string) => {
        setComplaints(prev => prev.map(c =>
            c.id === id ? { ...c, status: "RESOLVED" } : c
        ));
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, "warning" | "success" | "secondary"> = {
            PENDING: "warning",
            RESOLVED: "success",
            REJECTED: "secondary"
        };
        const labels: Record<string, string> = {
            PENDING: "Chờ xử lý",
            RESOLVED: "Đã giải quyết",
            REJECTED: "Đã từ chối"
        };

        return (
            <Badge variant={styles[status] || "secondary"}>
                {labels[status] || status}
            </Badge>
        );
    };

    const ComplaintTable = ({ data, showActions = false }: { data: Complaint[], showActions?: boolean }) => (
        <div className="overflow-x-auto">
            <Table>
                <thead>
                    <tr>
                        <th className="py-3 px-4 text-left">Mã đơn hàng</th>
                        <th className="py-3 px-4 text-left">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                Người gửi
                            </div>
                        </th>
                        <th className="py-3 px-4 text-left">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                Nhân viên tạo
                            </div>
                        </th>
                        <th className="py-3 px-4 text-left">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                Bưu tá
                            </div>
                        </th>
                        <th className="py-3 px-4 text-left">Nội dung</th>
                        <th className="py-3 px-4 text-center">Trạng thái</th>
                        {showActions && <th className="py-3 px-4 text-right">Thao tác</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={showActions ? 7 : 6} className="text-center py-8 text-gray-500">
                                <div className="flex flex-col items-center justify-center p-4">
                                    <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                                    <p>Không có khiếu nại nào</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((complaint) => (
                            <tr key={complaint.id} className="border-t hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2 font-medium text-primary-600">
                                        <Package className="h-4 w-4" />
                                        {complaint.trackingNumber}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {complaint.senderName}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {complaint.senderPhone}
                                        </p>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {complaint.creatorName}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {complaint.creatorPhone}
                                        </p>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    {complaint.shipperName ? (
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {complaint.shipperName}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {complaint.shipperPhone}
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Chưa cập nhật
                                        </span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <p className="text-sm text-gray-700 max-w-xs truncate" title={complaint.description}>
                                        {complaint.description}
                                    </p>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    {getStatusBadge(complaint.status)}
                                </td>
                                {showActions && (
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={() => handleResolve(complaint.id)}
                                            className="p-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                            title="Đánh dấu đã giải quyết"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="Danh sách khiếu nại"
                description="Quản lý các khiếu nại từ khách hàng"
            />

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
                    Chờ xử lý
                    <Badge variant="warning" className="ml-2">{pendingComplaints.length}</Badge>
                </h2>
                <Card>
                    <ComplaintTable data={pendingComplaints} showActions={true} />
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                    Lịch sử giải quyết
                    <Badge variant="secondary" className="ml-2">{otherComplaints.length}</Badge>
                </h2>
                <Card>
                    <ComplaintTable data={otherComplaints} />
                </Card>
            </div>
        </div>
    );
}
