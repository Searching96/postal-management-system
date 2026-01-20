import { useState } from "react";
import {
  MessageSquare,
  Phone,
  User,
  Package,
  AlertCircle,
  Check,
  Eye,
  X,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import { Card, Table, PageHeader, Badge, Button } from "../../components/ui";
import { formatDateTime } from "../../lib/utils";

// --- Types ---

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
  // Mock status history data attached to the complaint for demo purposes
  statusHistory?: StatusHistoryItem[];
}

interface StatusHistoryItem {
  status: string;
  description: string;
  location: string;
  timestamp: string;
  handlerName: string; // Mocked handler name
  handlerPhone: string; // Mocked handler phone
}

// --- Mock Data ---

const MOCK_STATUS_HISTORY: StatusHistoryItem[] = [
  {
    status: "DELIVERED",
    description: "Giao hàng thành công",
    location: "Kho Quận 9, TP.HCM",
    timestamp: "2026-01-18T14:00:00",
    handlerName: "Lê Văn Hùng",
    handlerPhone: "0979000008",
  },
  {
    status: "OUT_FOR_DELIVERY",
    description: "Đang giao hàng",
    location: "Kho Quận 9, TP.HCM",
    timestamp: "2026-01-18T08:30:00",
    handlerName: "Lê Văn Hùng",
    handlerPhone: "0979000008",
  },
  {
    status: "AT_DESTINATION_HUB",
    description: "Đã đến kho đích",
    location: "Hub Thủ Đức, TP.HCM",
    timestamp: "2026-01-17T20:15:00",
    handlerName: "Nguyễn Thị Mai",
    handlerPhone: "0987654321",
  },
  {
    status: "IN_TRANSIT",
    description: "Đang trung chuyển",
    location: "Hub Hà Nội",
    timestamp: "2026-01-16T15:00:00",
    handlerName: "Trần Văn Nam",
    handlerPhone: "0912345678",
  },
  {
    status: "CREATED",
    description: "Đơn hàng mới tạo",
    location: "Bưu cục Hoàn Kiếm, Hà Nội",
    timestamp: "2026-01-16T09:00:00",
    handlerName: "Phạm Thu Hương",
    handlerPhone: "0909090909",
  },
];

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "1",
    trackingNumber: "VN918273645",
    senderName: "Trần Nguyễn Đức Phúc",
    senderPhone: "0912345678",
    creatorName: "Trần Thị Hồng",
    creatorPhone: "0993334444",
    shipperName: "Lê Văn Hùng",
    shipperPhone: "0979000008",
    status: "PENDING",
    description: "Hàng hỏa tốc nhưng lại giao hàng trễ 3 ngày.",
    createdAt: "2026-01-19T10:30:00",
    statusHistory: MOCK_STATUS_HISTORY,
  },
  {
    id: "2",
    trackingNumber: "VN000987654",
    senderName: "Phạm Thị B",
    senderPhone: "0918765432",
    creatorName: "Nguyễn Văn Hải",
    creatorPhone: "0991112222",
    shipperName: null,
    shipperPhone: null,
    status: "RESOLVED",
    description:
      "Tôi đã gọi về tổng đài hỏi về chính sách cho vận đơn. Nhân viên trả lời vòng vo và thiếu minh bạch",
    createdAt: "2026-01-18T14:15:00",
    statusHistory: MOCK_STATUS_HISTORY,
  },
];

// --- Components ---

const HistoryModal = ({
  complaint,
  onClose,
}: {
  complaint: Complaint;
  onClose: () => void;
}) => {
  if (!complaint.statusHistory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-6 w-6 text-primary-600" />
              Lịch sử đơn hàng: {complaint.trackingNumber}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Chi tiết hành trình và người chịu trách nhiệm
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="relative pl-6 border-l-2 border-gray-100 space-y-8">
            {complaint.statusHistory.map((item, index) => (
              <div key={index} className="relative">
                {/* Timeline Dot */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-primary-200 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    {/* Updated Wrapper with flex-1 and min-w-0 for proper wrapping */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-base break-words">
                        {item.status}
                      </div>
                      <div className="text-sm text-gray-600 font-medium break-words mt-0.5">
                        {item.description}
                      </div>
                    </div>

                    {/* Timestamp (fixed width or shrink behavior) */}
                    <div className="text-sm text-gray-500 flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200 flex-shrink-0">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(item.timestamp)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t border-gray-200">
                    {/* Location Info */}
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        {" "}
                        {/* Ensure wrapping here too */}
                        <span className="block text-xs text-gray-400 uppercase font-semibold">
                          Địa điểm
                        </span>
                        <span className="break-words">{item.location}</span>
                      </div>
                    </div>

                    {/* Handler Info */}
                    <div className="flex items-start gap-2 text-gray-600">
                      <User className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        {" "}
                        {/* Ensure wrapping here too */}
                        <span className="block text-xs text-gray-400 uppercase font-semibold">
                          Người chịu trách nhiệm
                        </span>
                        <div className="font-medium text-gray-900 break-words">
                          {item.handlerName}
                        </div>
                        <div className="text-xs flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />
                          {item.handlerPhone}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export function ComplaintPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  );

  const pendingComplaints = complaints.filter((c) => c.status === "PENDING");
  const otherComplaints = complaints.filter((c) => c.status !== "PENDING");

  const handleResolve = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "RESOLVED" } : c)),
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, "warning" | "success" | "secondary"> = {
      PENDING: "warning",
      RESOLVED: "success",
      REJECTED: "secondary",
    };
    const labels: Record<string, string> = {
      PENDING: "Chờ xử lý",
      RESOLVED: "Đã giải quyết",
      REJECTED: "Đã từ chối",
    };

    return (
      <Badge variant={styles[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const ComplaintTable = ({
    data,
    showActions = false,
  }: {
    data: Complaint[];
    showActions?: boolean;
  }) => (
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
            <th className="py-3 px-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                <div className="flex flex-col items-center justify-center p-4">
                  <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                  <p>Không có khiếu nại nào</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((complaint) => (
              <tr
                key={complaint.id}
                className="border-t hover:bg-gray-50 transition-colors"
              >
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
                  <p
                    className="text-sm text-gray-700 max-w-xs truncate"
                    title={complaint.description}
                  >
                    {complaint.description}
                  </p>
                </td>
                <td className="py-3 px-4 text-center">
                  {getStatusBadge(complaint.status)}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Xem lịch sử đơn hàng"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {showActions && (
                      <button
                        onClick={() => handleResolve(complaint.id)}
                        className="p-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Đánh dấu đã giải quyết"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
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
          <Badge variant="warning" className="ml-2">
            {pendingComplaints.length}
          </Badge>
        </h2>
        <Card>
          <ComplaintTable data={pendingComplaints} showActions={true} />
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-8 bg-green-500 rounded-full"></span>
          Lịch sử giải quyết
          <Badge variant="secondary" className="ml-2">
            {otherComplaints.length}
          </Badge>
        </h2>
        <Card>
          <ComplaintTable data={otherComplaints} />
        </Card>
      </div>

      {selectedComplaint && (
        <HistoryModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
}
