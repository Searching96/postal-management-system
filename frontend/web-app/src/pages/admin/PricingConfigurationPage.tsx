import React from "react";
import { Button, Card, Table, Input, Modal } from "@/components";
import { DollarSign, Plus, Edit, Save, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PricingTier {
  id: number;
  serviceType: string;
  serviceName: string;
  weightFrom: number;
  weightTo: number;
  basePrice: number;
  stepPrice: number;
}

export const PricingConfigurationPage: React.FC = () => {
  const [pricingTiers, setPricingTiers] = React.useState<PricingTier[]>([]);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editForm, setEditForm] = React.useState<Partial<PricingTier>>({});

  React.useEffect(() => {
    loadPricingTiers();
  }, []);

  const loadPricingTiers = () => {
    // Mock pricing data
    const mockTiers: PricingTier[] = [
      // Express Service
      {
        id: 1,
        serviceType: "EXPRESS",
        serviceName: "Hỏa tốc",
        weightFrom: 0,
        weightTo: 0.5,
        basePrice: 35000,
        stepPrice: 8000,
      },
      {
        id: 2,
        serviceType: "EXPRESS",
        serviceName: "Hỏa tốc",
        weightFrom: 0.5,
        weightTo: 1.0,
        basePrice: 40000,
        stepPrice: 8000,
      },
      {
        id: 3,
        serviceType: "EXPRESS",
        serviceName: "Hỏa tốc",
        weightFrom: 1.0,
        weightTo: 5.0,
        basePrice: 45000,
        stepPrice: 7000,
      },
      // Standard Service
      {
        id: 4,
        serviceType: "STANDARD",
        serviceName: "Chuyển phát nhanh",
        weightFrom: 0,
        weightTo: 0.5,
        basePrice: 20000,
        stepPrice: 5000,
      },
      {
        id: 5,
        serviceType: "STANDARD",
        serviceName: "Chuyển phát nhanh",
        weightFrom: 0.5,
        weightTo: 1.0,
        basePrice: 25000,
        stepPrice: 5000,
      },
      {
        id: 6,
        serviceType: "STANDARD",
        serviceName: "Chuyển phát nhanh",
        weightFrom: 1.0,
        weightTo: 5.0,
        basePrice: 30000,
        stepPrice: 4000,
      },
      // Saving Service
      {
        id: 7,
        serviceType: "SAVING",
        serviceName: "Tiết kiệm",
        weightFrom: 0,
        weightTo: 0.5,
        basePrice: 15000,
        stepPrice: 3000,
      },
      {
        id: 8,
        serviceType: "SAVING",
        serviceName: "Tiết kiệm",
        weightFrom: 0.5,
        weightTo: 1.0,
        basePrice: 18000,
        stepPrice: 3000,
      },
      {
        id: 9,
        serviceType: "SAVING",
        serviceName: "Tiết kiệm",
        weightFrom: 1.0,
        weightTo: 5.0,
        basePrice: 21000,
        stepPrice: 2500,
      },
    ];
    setPricingTiers(mockTiers);
  };

  const handleEdit = (tier: PricingTier) => {
    setEditingId(tier.id);
    setEditForm(tier);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    setPricingTiers(
      pricingTiers.map((tier) =>
        tier.id === editingId ? { ...tier, ...editForm } : tier
      )
    );
    setEditingId(null);
    setEditForm({});
    alert("Cập nhật bảng giá thành công!");
  };

  const handleAddNew = () => {
    if (
      !editForm.serviceType ||
      editForm.weightFrom === undefined ||
      editForm.weightTo === undefined ||
      !editForm.basePrice ||
      !editForm.stepPrice
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const serviceNames: Record<string, string> = {
      EXPRESS: "Hỏa tốc",
      STANDARD: "Chuyển phát nhanh",
      SAVING: "Tiết kiệm",
    };

    const newTier: PricingTier = {
      id: pricingTiers.length + 1,
      serviceType: editForm.serviceType as string,
      serviceName: serviceNames[editForm.serviceType as string],
      weightFrom: editForm.weightFrom!,
      weightTo: editForm.weightTo!,
      basePrice: editForm.basePrice!,
      stepPrice: editForm.stepPrice!,
    };

    setPricingTiers([...pricingTiers, newTier]);
    setShowAddModal(false);
    setEditForm({});
    alert("Thêm bậc giá mới thành công!");
  };

  const groupedTiers = pricingTiers.reduce((acc, tier) => {
    if (!acc[tier.serviceType]) {
      acc[tier.serviceType] = [];
    }
    acc[tier.serviceType].push(tier);
    return acc;
  }, {} as Record<string, PricingTier[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <DollarSign size={28} />
            Thiết lập Bảng giá
          </h1>
          <p className="text-secondary-600 mt-1">
            Cấu hình giá cước theo trọng lượng và loại dịch vụ
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Thêm bậc giá
        </Button>
      </div>

      {/* Pricing Tables by Service Type */}
      {Object.entries(groupedTiers).map(([serviceType, tiers]) => (
        <Card key={serviceType}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              {tiers[0].serviceName}
            </h3>
            <Table
              columns={[
                { key: "weightRange", label: "Khối lượng (kg)" },
                { key: "basePrice", label: "Giá cơ bản" },
                { key: "stepPrice", label: "Giá bước nhảy (/kg)" },
                { key: "example", label: "Ví dụ (2.5kg)" },
                { key: "actions", label: "Thao tác" },
              ]}
              data={tiers.map((tier) => {
                const isEditing = editingId === tier.id;
                const examplePrice =
                  tier.basePrice +
                  Math.max(0, 2.5 - tier.weightFrom) * tier.stepPrice;

                return {
                  weightRange: isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.weightFrom || tier.weightFrom}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            weightFrom: Number(e.target.value),
                          })
                        }
                        className="w-20"
                      />
                      <span>→</span>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.weightTo || tier.weightTo}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            weightTo: Number(e.target.value),
                          })
                        }
                        className="w-20"
                      />
                    </div>
                  ) : (
                    <span className="font-mono">
                      {tier.weightFrom} → {tier.weightTo}
                    </span>
                  ),
                  basePrice: isEditing ? (
                    <Input
                      type="number"
                      value={editForm.basePrice || tier.basePrice}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          basePrice: Number(e.target.value),
                        })
                      }
                      className="w-32"
                    />
                  ) : (
                    <span className="font-mono font-semibold">
                      {formatCurrency(tier.basePrice)}
                    </span>
                  ),
                  stepPrice: isEditing ? (
                    <Input
                      type="number"
                      value={editForm.stepPrice || tier.stepPrice}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          stepPrice: Number(e.target.value),
                        })
                      }
                      className="w-32"
                    />
                  ) : (
                    <span className="font-mono">
                      {formatCurrency(tier.stepPrice)}
                    </span>
                  ),
                  example: (
                    <span className="text-primary-600 font-semibold">
                      {formatCurrency(examplePrice)}
                    </span>
                  ),
                  actions: isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={handleSaveEdit}
                      >
                        <Save size={16} />
                        Lưu
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X size={16} />
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(tier)}
                    >
                      <Edit size={16} />
                      Sửa
                    </Button>
                  ),
                };
              })}
            />
          </div>
        </Card>
      ))}

      {/* Add New Tier Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditForm({});
        }}
        title="Thêm Bậc giá Mới"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Loại dịch vụ *
            </label>
            <select
              value={editForm.serviceType || ""}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  serviceType: e.target.value,
                })
              }
              className="w-full border border-secondary-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Chọn loại dịch vụ --</option>
              <option value="EXPRESS">Hỏa tốc</option>
              <option value="STANDARD">Chuyển phát nhanh</option>
              <option value="SAVING">Tiết kiệm</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Trọng lượng từ (kg) *"
              type="number"
              step="0.1"
              value={editForm.weightFrom || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, weightFrom: Number(e.target.value) })
              }
              placeholder="0"
            />
            <Input
              label="Trọng lượng đến (kg) *"
              type="number"
              step="0.1"
              value={editForm.weightTo || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, weightTo: Number(e.target.value) })
              }
              placeholder="0.5"
            />
          </div>

          <Input
            label="Giá cơ bản (VNĐ) *"
            type="number"
            value={editForm.basePrice || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, basePrice: Number(e.target.value) })
            }
            placeholder="20000"
          />

          <Input
            label="Giá bước nhảy (/kg) *"
            type="number"
            value={editForm.stepPrice || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, stepPrice: Number(e.target.value) })
            }
            placeholder="5000"
          />

          <div className="flex gap-3 mt-6">
            <Button variant="primary" onClick={handleAddNew} className="flex-1">
              <Plus size={18} />
              Thêm bậc giá
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditForm({});
              }}
            >
              Hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pricing Notes */}
      <Card>
        <div className="p-6 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-3">
            📝 Ghi chú về Bảng giá
          </h4>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>Giá cơ bản áp dụng cho trọng lượng tối thiểu trong khoảng</li>
            <li>
              Giá bước nhảy áp dụng cho mỗi kg vượt quá trọng lượng tối thiểu
            </li>
            <li>
              Công thức:{" "}
              <code className="bg-blue-100 px-2 py-0.5 rounded">
                Tổng = Giá cơ bản + (Trọng lượng - Trọng lượng từ) × Giá bước
                nhảy
              </code>
            </li>
            <li>
              Trọng lượng tính cước = MAX(Trọng lượng thực, Trọng lượng quy đổi)
            </li>
            <li>Trọng lượng quy đổi = (Dài × Rộng × Cao) / 5000</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
