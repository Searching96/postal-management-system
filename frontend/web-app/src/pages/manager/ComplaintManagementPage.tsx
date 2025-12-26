import React from "react";
import { Button, Card, Table, Badge, Modal, Input, Select } from "@/components";
import { AlertCircle, Eye, CheckCircle, XCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Complaint {
  id: number;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  type: string;
  description: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  compensation?: number;
}

export const ComplaintManagementPage: React.FC = () => {
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] =
    React.useState<Complaint | null>(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL");
  const [filterType, setFilterType] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Resolution form
  const [resolution, setResolution] = React.useState("");
  const [compensation, setCompensation] = React.useState<number>(0);

  React.useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = () => {
    // Mock complaints data
    const mockComplaints: Complaint[] = [
      {
        id: 1,
        trackingNumber: "VN192837465VN",
        customerName: "Nguyễn Văn Dũng",
        customerPhone: "0901234567",
        type: "Giao chậm",
        description: "Đơn hàng quá hạn giao 3 ngày so với cam kết",
        status: "OPEN",
        priority: "MEDIUM",
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
      },
      {
        id: 2,
        trackingNumber: "VN192837466VN",
        customerName: "Trần Thị Hoa",
        customerPhone: "0901234568",
        type: "Hư hỏng",
        description: "Hàng bị ướt do mưa, bao bì rách",
        status: "INVESTIGATING",
        priority: "HIGH",
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        id: 3,
        trackingNumber: "VN192837467VN",
        customerName: "Phạm Minh Tuấn",
        customerPhone: "0901234569",
        type: "Sai COD",
        description: "Thu thiếu 200,000 VND so với số tiền ghi trên vận đơn",
        status: "RESOLVED",
        priority: "HIGH",
        createdAt: new Date(Date.now() - 259200000), // 3 days ago
        resolvedAt: new Date(Date.now() - 86400000),
        resolution: "Đã hoàn trả đủ số tiền thiếu cho khách hàng",
        compensation: 200000,
      },
      {
        id: 4,
        trackingNumber: "VN192837468VN",
        customerName: "Lê Thị Mai",
        customerPhone: "0901234570",
        type: "Thái độ nhân viên",
        description: "Bưu tá có thái độ thiếu tôn trọng khi giao hàng",
        status: "RESOLVED",
        priority: "LOW",
        createdAt: new Date(Date.now() - 345600000), // 4 days ago
        resolvedAt: new Date(Date.now() - 172800000),
        resolution: "Đã nhắc nhở nhân viên và gửi lời xin lỗi đến khách hàng",
        compensation: 0,
      },
    ];
    setComplaints(mockComplaints);
  };

  const getFilteredComplaints = () => {
    let filtered = complaints;

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    if (filterType !== "ALL") {
      filtered = filtered.filter((c) => c.type === filterType);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.customerPhone.includes(searchQuery)
      );
    }

    return filtered;
  };

  const handleViewDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResolution(complaint.resolution || "");
    setCompensation(complaint.compensation || 0);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (newStatus: Complaint["status"]) => {
    if (!selectedComplaint) return;

    const updatedComplaint = {
      ...selectedComplaint,
      status: newStatus,
      resolvedAt: newStatus === "RESOLVED" ? new Date() : undefined,
      resolution: newStatus === "RESOLVED" ? resolution : undefined,
      compensation: newStatus === "RESOLVED" ? compensation : undefined,
    };

    setComplaints(
      complaints.map((c) =>
        c.id === selectedComplaint.id ? updatedComplaint : c
      )
    );
    setSelectedComplaint(updatedComplaint);
    alert(`Cập nhật trạng thái thành công!`);
  };

  const handleResolve = () => {
    if (!selectedComplaint) return;

    if (!resolution.trim()) {
      alert("Vui lòng nhập giải pháp xử lý!");
      return;
    }

    handleUpdateStatus("RESOLVED");
    setShowDetailModal(false);
  };

  const getStatusBadge = (status: Complaint["status"]) => {
    const statusMap: Record<
      Complaint["status"],
      { variant: "success" | "warning" | "danger"; text: string }
    > = {
      OPEN: { variant: "warning", text: "Mới tiếp nhận" },
      INVESTIGATING: { variant: "warning", text: "Đang xử lý" },
      RESOLVED: { variant: "success", text: "Đã giải quyết" },
      REJECTED: { variant: "danger", text: "Từ chối" },
    };
    const config = statusMap[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getPriorityBadge = (priority: Complaint["priority"]) => {
    const priorityMap: Record<
      Complaint["priority"],
      { variant: "success" | "warning" | "danger"; text: string }
    > = {
      LOW: { variant: "success", text: "Thấp" },
      MEDIUM: { variant: "warning", text: "Trung bình" },
      HIGH: { variant: "danger", text: "Cao" },
    };
    const config = priorityMap[priority];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
          <AlertCircle size={28} />
          Quản lý Khiếu nại
        </h1>
        <p className="text-secondary-600 mt-1">
          Tiếp nhận và xử lý khiếu nại từ khách hàng
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tổng số", value: complaints.length, color: "blue" },
          {
            label: "Mới tiếp nhận",
            value: complaints.filter((c) => c.status === "OPEN").length,
            color: "yellow",
          },
          {
            label: "Đang xử lý",
            value: complaints.filter((c) => c.status === "INVESTIGATING")
              .length,
            color: "orange",
          },
          {
            label: "Đã giải quyết",
            value: complaints.filter((c) => c.status === "RESOLVED").length,
            color: "green",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="p-6">
              <p className="text-sm text-secondary-600 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold text-${stat.color}-600`}>
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã vận đơn, tên, SĐT..."
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: "ALL", label: "Tất cả trạng thái" },
                { value: "OPEN", label: "Mới tiếp nhận" },
                { value: "INVESTIGATING", label: "Đang xử lý" },
                { value: "RESOLVED", label: "Đã giải quyết" },
                { value: "REJECTED", label: "Từ chối" },
              ]}
            />
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: "ALL", label: "Tất cả loại khiếu nại" },
                { value: "Giao chậm", label: "Giao chậm" },
                { value: "Mất hàng", label: "Mất hàng" },
                { value: "Hư hỏng", label: "Hư hỏng" },
                { value: "Sai COD", label: "Sai COD" },
                { value: "Thái độ nhân viên", label: "Thái độ nhân viên" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Complaints Table */}
      <Card>
        <div className="p-6">
          <Table
            columns={[
              { key: "id", label: "ID" },
              { key: "trackingNumber", label: "Mã vận đơn" },
              { key: "customer", label: "Khách hàng" },
              { key: "type", label: "Loại khiếu nại" },
              { key: "priority", label: "Độ ưu tiên" },
              { key: "status", label: "Trạng thái" },
              { key: "createdAt", label: "Ngày tạo" },
              { key: "actions", label: "Thao tác" },
            ]}
            data={getFilteredComplaints().map((complaint) => ({
              id: `#${complaint.id}`,
              trackingNumber: (
                <span className="font-mono text-sm">
                  {complaint.trackingNumber}
                </span>
              ),
              customer: (
                <div>
                  <p className="font-medium">{complaint.customerName}</p>
                  <p className="text-xs text-secondary-600">
                    {complaint.customerPhone}
                  </p>
                </div>
              ),
              type: complaint.type,
              priority: getPriorityBadge(complaint.priority),
              status: getStatusBadge(complaint.status),
              createdAt: formatDate(complaint.createdAt),
              actions: (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleViewDetail(complaint)}
                >
                  <Eye size={16} />
                  Chi tiết
                </Button>
              ),
            }))}
          />
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Khiếu nại #${selectedComplaint.id}`}
        >
          <div className="space-y-6">
            {/* Complaint Info */}
            <div>
              <h4 className="font-semibold text-secondary-900 mb-3">
                Thông tin khiếu nại
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Mã vận đơn:</span>
                  <span className="font-mono font-semibold">
                    {selectedComplaint.trackingNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Khách hàng:</span>
                  <span className="font-semibold">
                    {selectedComplaint.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Số điện thoại:</span>
                  <span className="font-semibold">
                    {selectedComplaint.customerPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Loại khiếu nại:</span>
                  <span className="font-semibold">
                    {selectedComplaint.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Độ ưu tiên:</span>
                  {getPriorityBadge(selectedComplaint.priority)}
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Trạng thái:</span>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Ngày tạo:</span>
                  <span className="font-semibold">
                    {formatDate(selectedComplaint.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold text-secondary-900 mb-2">
                Mô tả chi tiết
              </h4>
              <p className="text-sm text-secondary-700 bg-secondary-50 p-3 rounded-lg">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Resolution Form (if not resolved) */}
            {selectedComplaint.status !== "RESOLVED" &&
              selectedComplaint.status !== "REJECTED" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Giải pháp xử lý *
                    </label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full border border-secondary-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={4}
                      placeholder="Mô tả chi tiết cách xử lý khiếu nại..."
                      required
                    />
                  </div>

                  <Input
                    label="Mức bồi thường (VNĐ)"
                    type="number"
                    value={compensation || ""}
                    onChange={(e) => setCompensation(Number(e.target.value))}
                    placeholder="0"
                  />

                  <div className="flex gap-3">
                    {selectedComplaint.status === "OPEN" && (
                      <Button
                        variant="secondary"
                        onClick={() => handleUpdateStatus("INVESTIGATING")}
                        className="flex-1"
                      >
                        Chuyển sang Đang xử lý
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      onClick={handleResolve}
                      className="flex-1"
                    >
                      <CheckCircle size={18} />
                      Hoàn thành xử lý
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus("REJECTED")}
                    >
                      <XCircle size={18} />
                      Từ chối
                    </Button>
                  </div>
                </div>
              )}

            {/* Resolution (if resolved) */}
            {selectedComplaint.status === "RESOLVED" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">
                  ✓ Đã giải quyết
                </h4>
                <p className="text-sm text-green-800 mb-3">
                  {selectedComplaint.resolution}
                </p>
                {selectedComplaint.compensation &&
                  selectedComplaint.compensation > 0 && (
                    <p className="text-sm font-semibold text-green-900">
                      Bồi thường:{" "}
                      {formatCurrency(selectedComplaint.compensation)}
                    </p>
                  )}
                <p className="text-xs text-green-700 mt-2">
                  Giải quyết lúc: {formatDate(selectedComplaint.resolvedAt!)}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
