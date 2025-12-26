import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Input, Select } from "@/components";
import {
  OrderService,
  CustomerService,
  PricingService,
  LocationService,
} from "@/services";
import { CreateOrderDto, Customer } from "@/models";
import { formatCurrency } from "@/lib/utils";
import { Package, Calculator, Save } from "lucide-react";

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [serviceTypes, setServiceTypes] = React.useState<any[]>([]);
  const [provinces, setProvinces] = React.useState<any[]>([]);

  const [formData, setFormData] = React.useState<Partial<CreateOrderDto>>({
    serviceTypeId: 2, // Default to FAST
    actualWeight: 0,
    declaredValue: 0,
    codAmount: 0,
  });

  const [pricing, setPricing] = React.useState({
    baseFee: 0,
    insuranceFee: 0,
    codFee: 0,
    totalFee: 0,
  });

  React.useEffect(() => {
    loadInitialData();
  }, []);

  React.useEffect(() => {
    if (
      formData.serviceTypeId &&
      formData.actualWeight &&
      formData.actualWeight > 0
    ) {
      calculatePricing();
    }
  }, [
    formData.serviceTypeId,
    formData.actualWeight,
    formData.declaredValue,
    formData.codAmount,
  ]);

  const loadInitialData = async () => {
    try {
      const [customersData, servicesData, provincesData] = await Promise.all([
        CustomerService.getAll(),
        PricingService.getServiceTypes(),
        LocationService.getProvinces(),
      ]);

      setCustomers(customersData);
      setServiceTypes(servicesData);
      setProvinces(provincesData);
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  };

  const calculatePricing = async () => {
    try {
      const fees = await PricingService.calculateFee(
        formData.serviceTypeId || 2,
        formData.actualWeight || 0
      );

      const insuranceFee =
        formData.declaredValue && formData.declaredValue > 0
          ? await PricingService.calculateInsuranceFee(formData.declaredValue)
          : 0;

      const codFee =
        formData.codAmount && formData.codAmount > 0
          ? await PricingService.calculateCodFee(formData.codAmount)
          : 0;

      setPricing({
        baseFee: fees.baseFee,
        insuranceFee,
        codFee,
        totalFee: fees.baseFee + insuranceFee + codFee,
      });
    } catch (error) {
      console.error("Failed to calculate pricing:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const order = await OrderService.create(formData as CreateOrderDto);
      alert(
        `Đơn hàng đã được tạo thành công!\nMã vận đơn: ${order.trackingNumber}`
      );
      navigate("/orders");
    } catch (error) {
      alert(
        "Có lỗi xảy ra khi tạo đơn hàng: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id.toString() === customerId);
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        customerId: customer.id,
        senderName: customer.fullName,
        senderPhone: customer.phone,
        senderAddress: customer.address,
        senderProvince: customer.province,
        senderDistrict: customer.district,
        senderWard: customer.ward,
      }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Tiếp nhận đơn hàng mới
          </h1>
          <p className="text-secondary-600 mt-1">
            Nhập thông tin để tạo vận đơn
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/orders")}>
          Hủy bỏ
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Sender & Receiver Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sender Information */}
            <Card title="Thông tin người gửi">
              <div className="space-y-4">
                <Select
                  label="Chọn khách hàng"
                  options={[
                    { value: "", label: "Chọn khách hàng..." },
                    ...customers.map((c) => ({
                      value: c.id.toString(),
                      label: `${c.fullName} - ${c.phone}`,
                    })),
                  ]}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Tên người gửi"
                    placeholder="Nguyễn Văn A"
                    value={formData.senderName || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        senderName: e.target.value,
                      }))
                    }
                    required
                  />
                  <Input
                    label="Số điện thoại"
                    placeholder="0912345678"
                    value={formData.senderPhone || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        senderPhone: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <Input
                  label="Địa chỉ"
                  placeholder="123 Nguyễn Văn Cừ"
                  value={formData.senderAddress || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      senderAddress: e.target.value,
                    }))
                  }
                  required
                />

                <div className="grid grid-cols-3 gap-4">
                  <Select
                    label="Tỉnh/Thành phố"
                    options={[
                      { value: "", label: "Chọn tỉnh/thành" },
                      ...provinces.map((p) => ({
                        value: p.name,
                        label: p.name,
                      })),
                    ]}
                    value={formData.senderProvince || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        senderProvince: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Quận/Huyện"
                    placeholder="Quận 1"
                    value={formData.senderDistrict || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        senderDistrict: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Phường/Xã"
                    placeholder="Phường Bến Nghé"
                    value={formData.senderWard || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        senderWard: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Receiver Information */}
            <Card title="Thông tin người nhận">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Tên người nhận"
                    placeholder="Trần Thị B"
                    value={formData.receiverName || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiverName: e.target.value,
                      }))
                    }
                    required
                  />
                  <Input
                    label="Số điện thoại"
                    placeholder="0987654321"
                    value={formData.receiverPhone || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiverPhone: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <Input
                  label="Địa chỉ"
                  placeholder="456 Lê Văn Sỹ"
                  value={formData.receiverAddress || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      receiverAddress: e.target.value,
                    }))
                  }
                  required
                />

                <div className="grid grid-cols-3 gap-4">
                  <Select
                    label="Tỉnh/Thành phố"
                    options={[
                      { value: "", label: "Chọn tỉnh/thành" },
                      ...provinces.map((p) => ({
                        value: p.name,
                        label: p.name,
                      })),
                    ]}
                    value={formData.receiverProvince || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiverProvince: e.target.value,
                      }))
                    }
                    required
                  />
                  <Input
                    label="Quận/Huyện"
                    placeholder="Quận 3"
                    value={formData.receiverDistrict || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiverDistrict: e.target.value,
                      }))
                    }
                    required
                  />
                  <Input
                    label="Phường/Xã"
                    placeholder="Phường 2"
                    value={formData.receiverWard || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiverWard: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Package Information */}
            <Card title="Thông tin hàng hóa">
              <div className="space-y-4">
                <Input
                  label="Loại hàng hóa"
                  placeholder="Quần áo, Điện tử, Thực phẩm..."
                  value={formData.packageType || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      packageType: e.target.value,
                    }))
                  }
                />

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Khối lượng (kg)"
                    type="number"
                    step="0.1"
                    placeholder="0.5"
                    value={formData.actualWeight || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        actualWeight: parseFloat(e.target.value) || 0,
                      }))
                    }
                    required
                    leftIcon={<Package size={18} />}
                  />
                  <Input
                    label="Giá trị hàng hóa (VNĐ)"
                    type="number"
                    placeholder="500000"
                    value={formData.declaredValue || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        declaredValue: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  <Input
                    label="Thu hộ COD (VNĐ)"
                    type="number"
                    placeholder="750000"
                    value={formData.codAmount || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        codAmount: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>

                <Input
                  label="Ghi chú"
                  placeholder="Hàng dễ vỡ, giao buổi chiều..."
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
            </Card>
          </div>

          {/* Right Column - Service & Pricing */}
          <div className="space-y-6">
            {/* Service Selection */}
            <Card title="Dịch vụ vận chuyển">
              <div className="space-y-3">
                {serviceTypes.map((service) => (
                  <label
                    key={service.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.serviceTypeId === service.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-secondary-200 hover:bg-secondary-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="serviceType"
                      value={service.id}
                      checked={formData.serviceTypeId === service.id}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          serviceTypeId: parseInt(e.target.value),
                        }))
                      }
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">
                        {service.name}
                      </p>
                      <p className="text-xs text-secondary-600">
                        {service.estimatedDeliveryDays} ngày
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            {/* Pricing Summary */}
            <Card title="Tổng cước phí" action={<Calculator size={20} />}>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Phí vận chuyển:</span>
                  <span className="font-medium text-secondary-900">
                    {formatCurrency(pricing.baseFee)}
                  </span>
                </div>

                {pricing.insuranceFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Phí bảo hiểm:</span>
                    <span className="font-medium text-secondary-900">
                      {formatCurrency(pricing.insuranceFee)}
                    </span>
                  </div>
                )}

                {pricing.codFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Phí thu hộ COD:</span>
                    <span className="font-medium text-secondary-900">
                      {formatCurrency(pricing.codFee)}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-secondary-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-secondary-900">
                      Tổng cộng:
                    </span>
                    <span className="text-xl font-bold text-primary-600">
                      {formatCurrency(pricing.totalFee)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              <Save size={18} className="mr-2" />
              Tạo đơn hàng
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
