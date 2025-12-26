import React from "react";
import { Button, Input, Card, Table, Badge, Modal } from "@/components";
import { ClipboardList, Plus, Scan, Lock, X } from "lucide-react";
import { OrganizationService } from "@/services";
import { formatDate } from "@/lib/utils";

interface Manifest {
  id: number;
  code: string;
  originId: number;
  destinationId: number;
  route: string;
  status: "OPEN" | "SEALED";
  waybills: string[];
  createdAt: Date;
  sealedAt?: Date;
}

export const ManifestManagementPage: React.FC = () => {
  const [manifests, setManifests] = React.useState<Manifest[]>([]);
  const [organizations, setOrganizations] = React.useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [selectedManifest, setSelectedManifest] =
    React.useState<Manifest | null>(null);
  const [searchTrackingNumber, setSearchTrackingNumber] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // New manifest form
  const [newManifest, setNewManifest] = React.useState({
    originId: 0,
    destinationId: 0,
    route: "",
  });

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const orgs = await OrganizationService.getAll();
    setOrganizations(orgs);

    // Mock manifests data
    const mockManifests: Manifest[] = [
      {
        id: 1,
        code: "BK-HCM-HN-20251226-001",
        originId: 3,
        destinationId: 5,
        route: "HCM → Hà Nội",
        status: "OPEN",
        waybills: ["VN192837465VN", "VN192837466VN", "VN192837467VN"],
        createdAt: new Date(),
      },
      {
        id: 2,
        code: "BK-HCM-DN-20251225-005",
        originId: 3,
        destinationId: 7,
        route: "HCM → Đà Nẵng",
        status: "SEALED",
        waybills: ["VN192837468VN", "VN192837469VN"],
        createdAt: new Date(Date.now() - 86400000),
        sealedAt: new Date(Date.now() - 3600000),
      },
    ];
    setManifests(mockManifests);
  };

  const handleCreateManifest = () => {
    const origin = organizations.find((o) => o.id === newManifest.originId);
    const destination = organizations.find(
      (o) => o.id === newManifest.destinationId
    );

    if (!origin || !destination) {
      alert("Vui lòng chọn điểm gửi và điểm nhận!");
      return;
    }

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
    const code = `BK-${origin.code}-${destination.code}-${dateStr}-${String(
      manifests.length + 1
    ).padStart(3, "0")}`;

    const manifest: Manifest = {
      id: manifests.length + 1,
      code,
      originId: newManifest.originId,
      destinationId: newManifest.destinationId,
      route: `${origin.name} → ${destination.name}`,
      status: "OPEN",
      waybills: [],
      createdAt: new Date(),
    };

    setManifests([manifest, ...manifests]);
    setShowCreateModal(false);
    setSelectedManifest(manifest);
    setNewManifest({ originId: 0, destinationId: 0, route: "" });
    alert("Tạo bảng kê thành công!");
  };

  const handleAddWaybill = async () => {
    if (!selectedManifest || !searchTrackingNumber) return;

    setLoading(true);
    try {
      // Simulate barcode scan
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if waybill already exists
      if (selectedManifest.waybills.includes(searchTrackingNumber)) {
        alert("Mã vận đơn đã được thêm vào bảng kê này!");
        setLoading(false);
        return;
      }

      // Add waybill to manifest
      const updatedManifest = {
        ...selectedManifest,
        waybills: [...selectedManifest.waybills, searchTrackingNumber],
      };

      setManifests(
        manifests.map((m) =>
          m.id === selectedManifest.id ? updatedManifest : m
        )
      );
      setSelectedManifest(updatedManifest);
      setSearchTrackingNumber("");
      alert(`✓ Đã thêm vận đơn ${searchTrackingNumber}`);
    } catch (error) {
      alert("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWaybill = (trackingNumber: string) => {
    if (!selectedManifest) return;

    const updatedManifest = {
      ...selectedManifest,
      waybills: selectedManifest.waybills.filter((w) => w !== trackingNumber),
    };

    setManifests(
      manifests.map((m) => (m.id === selectedManifest.id ? updatedManifest : m))
    );
    setSelectedManifest(updatedManifest);
  };

  const handleSealManifest = () => {
    if (!selectedManifest) return;

    if (selectedManifest.waybills.length === 0) {
      alert("Bảng kê chưa có vận đơn nào!");
      return;
    }

    const confirmed = window.confirm(
      `Xác nhận đóng túi bảng kê ${selectedManifest.code}?\nSau khi đóng túi, không thể thêm/xóa vận đơn.`
    );

    if (confirmed) {
      const updatedManifest = {
        ...selectedManifest,
        status: "SEALED" as const,
        sealedAt: new Date(),
      };

      setManifests(
        manifests.map((m) =>
          m.id === selectedManifest.id ? updatedManifest : m
        )
      );
      setSelectedManifest(updatedManifest);
      alert("Đóng túi bảng kê thành công!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <ClipboardList size={28} />
            Quản lý Bảng kê Trung chuyển
          </h1>
          <p className="text-secondary-600 mt-1">
            Lập bảng kê và quản lý vận đơn trung chuyển
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          Tạo bảng kê mới
        </Button>
      </div>

      {/* Manifests List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Danh sách Bảng kê
          </h3>
          <Table
            columns={[
              { key: "code", label: "Mã bảng kê" },
              { key: "route", label: "Tuyến" },
              { key: "waybills", label: "Số vận đơn" },
              { key: "status", label: "Trạng thái" },
              { key: "createdAt", label: "Ngày tạo" },
              { key: "actions", label: "Thao tác" },
            ]}
            data={manifests.map((m) => ({
              code: m.code,
              route: m.route,
              waybills: m.waybills.length,
              status: (
                <Badge variant={m.status === "SEALED" ? "success" : "warning"}>
                  {m.status === "SEALED" ? "Đã đóng túi" : "Đang mở"}
                </Badge>
              ),
              createdAt: formatDate(m.createdAt),
              actions: (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedManifest(m)}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              ),
            }))}
          />
        </div>
      </Card>

      {/* Manifest Detail View */}
      {selectedManifest && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-secondary-900">
                  {selectedManifest.code}
                </h3>
                <p className="text-secondary-600">{selectedManifest.route}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    selectedManifest.status === "SEALED" ? "success" : "warning"
                  }
                >
                  {selectedManifest.status === "SEALED"
                    ? "Đã đóng túi"
                    : "Đang mở"}
                </Badge>
                {selectedManifest.status === "OPEN" && (
                  <Button variant="primary" onClick={handleSealManifest}>
                    <Lock size={18} />
                    Đóng túi
                  </Button>
                )}
              </div>
            </div>

            {/* Add Waybill Section */}
            {selectedManifest.status === "OPEN" && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Scan size={18} />
                  Quét mã vận đơn
                </h4>
                <div className="flex gap-3">
                  <Input
                    value={searchTrackingNumber}
                    onChange={(e) => setSearchTrackingNumber(e.target.value)}
                    placeholder="Nhập hoặc quét mã vận đơn (VN...)"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddWaybill();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="primary"
                    onClick={handleAddWaybill}
                    disabled={!searchTrackingNumber || loading}
                  >
                    <Plus size={18} />
                    Thêm
                  </Button>
                </div>
              </div>
            )}

            {/* Waybills List */}
            <div>
              <h4 className="font-semibold text-secondary-900 mb-3">
                Danh sách vận đơn ({selectedManifest.waybills.length})
              </h4>
              {selectedManifest.waybills.length === 0 ? (
                <div className="text-center py-12 text-secondary-500">
                  <ClipboardList
                    size={48}
                    className="mx-auto mb-3 opacity-30"
                  />
                  <p>Chưa có vận đơn nào trong bảng kê</p>
                </div>
              ) : (
                <div className="border border-secondary-200 rounded-lg divide-y divide-secondary-200">
                  {selectedManifest.waybills.map((waybill, index) => (
                    <div
                      key={waybill}
                      className="flex items-center justify-between p-4 hover:bg-secondary-50"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-secondary-500 font-mono text-sm w-8">
                          #{index + 1}
                        </span>
                        <span className="font-mono font-semibold text-secondary-900">
                          {waybill}
                        </span>
                      </div>
                      {selectedManifest.status === "OPEN" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveWaybill(waybill)}
                        >
                          <X size={16} />
                          Xóa
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-secondary-100 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-secondary-600">Tổng số vận đơn</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {selectedManifest.waybills.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Ngày tạo</p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {formatDate(selectedManifest.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Ngày đóng túi</p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {selectedManifest.sealedAt
                      ? formatDate(selectedManifest.sealedAt)
                      : "---"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Create Manifest Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo Bảng kê Mới"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Điểm gửi *
            </label>
            <select
              value={newManifest.originId}
              onChange={(e) =>
                setNewManifest({
                  ...newManifest,
                  originId: Number(e.target.value),
                })
              }
              className="w-full border border-secondary-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value={0}>-- Chọn điểm gửi --</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Điểm nhận *
            </label>
            <select
              value={newManifest.destinationId}
              onChange={(e) =>
                setNewManifest({
                  ...newManifest,
                  destinationId: Number(e.target.value),
                })
              }
              className="w-full border border-secondary-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value={0}>-- Chọn điểm nhận --</option>
              {organizations
                .filter((org) => org.id !== newManifest.originId)
                .map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.code})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              onClick={handleCreateManifest}
              className="flex-1"
            >
              Tạo bảng kê
            </Button>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
