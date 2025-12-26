import React from "react";
import { Button, Input, Select, Card } from "@/components";
import {
  LocationService,
  CustomerService,
  PricingService,
  OrderService,
} from "@/services";
import { formatCurrency } from "@/lib/utils";
import { Package, Calculator, Save, Printer } from "lucide-react";

interface FormData {
  // Người gửi
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderProvinceId: number | null;
  senderDistrictId: number | null;
  senderWardId: number | null;

  // Người nhận
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverProvinceId: number | null;
  receiverDistrictId: number | null;
  receiverWardId: number | null;

  // Hàng hóa
  goodsType: string;
  actualWeight: number;
  length: number;
  width: number;
  height: number;

  // Dịch vụ
  serviceType: string;
  codAmount: number;
  insuranceValue: number;
  note: string;
}

export const ParcelReceptionPage: React.FC = () => {
  const [formData, setFormData] = React.useState<FormData>({
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    senderProvinceId: null,
    senderDistrictId: null,
    senderWardId: null,
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    receiverProvinceId: null,
    receiverDistrictId: null,
    receiverWardId: null,
    goodsType: "DOCUMENT",
    actualWeight: 0,
    length: 0,
    width: 0,
    height: 0,
    serviceType: "STANDARD",
    codAmount: 0,
    insuranceValue: 0,
    note: "",
  });

  const [provinces, setProvinces] = React.useState<any[]>([]);
  const [senderDistricts, setSenderDistricts] = React.useState<any[]>([]);
  const [senderWards, setSenderWards] = React.useState<any[]>([]);
  const [receiverDistricts, setReceiverDistricts] = React.useState<any[]>([]);
  const [receiverWards, setReceiverWards] = React.useState<any[]>([]);
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [calculatedFee, setCalculatedFee] = React.useState<any>(null);
  const [trackingNumber, setTrackingNumber] = React.useState<string | null>(
    null
  );

  // Load provinces and customers
  React.useEffect(() => {
    const loadData = async () => {
      const [provincesData, customersData] = await Promise.all([
        LocationService.getAll(),
        CustomerService.getAll(),
      ]);
      setProvinces(provincesData);
      setCustomers(customersData);
    };
    loadData();
  }, []);

  // Load sender districts when province changes
  React.useEffect(() => {
    if (formData.senderProvinceId) {
      const province = provinces.find(
        (p) => p.code === String(formData.senderProvinceId)
      );
      if (province) {
        LocationService.getDistrictsByProvince(province.code).then(
          setSenderDistricts
        );
      }
    } else {
      setSenderDistricts([]);
      setSenderWards([]);
    }
  }, [formData.senderProvinceId]);

  // Load sender wards when district changes
  React.useEffect(() => {
    if (formData.senderDistrictId) {
      const district = senderDistricts.find(
        (d) => d.code === String(formData.senderDistrictId)
      );
      if (district) {
        LocationService.getWardsByDistrict(district.code).then(setSenderWards);
      }
    } else {
      setSenderWards([]);
    }
  }, [formData.senderDistrictId]);

  // Load receiver districts when province changes
  React.useEffect(() => {
    if (formData.receiverProvinceId) {
      const province = provinces.find(
        (p) => p.code === String(formData.receiverProvinceId)
      );
      if (province) {
        LocationService.getDistrictsByProvince(province.code).then(
          setReceiverDistricts
        );
      }
    } else {
      setReceiverDistricts([]);
      setReceiverWards([]);
    }
  }, [formData.receiverProvinceId]);

  // Load receiver wards when district changes
  React.useEffect(() => {
    if (formData.receiverDistrictId) {
      const district = receiverDistricts.find(
        (d) => d.code === String(formData.receiverDistrictId)
      );
      if (district) {
        LocationService.getWardsByDistrict(district.code).then(
          setReceiverWards
        );
      }
    } else {
      setReceiverWards([]);
    }
  }, [formData.receiverDistrictId]);

  // Auto-fill customer data when phone number is entered
  const handleSenderPhoneChange = async (phone: string) => {
    setFormData((prev) => ({ ...prev, senderPhone: phone }));
    if (phone.length === 10) {
      const customer = customers.find((c) => c.phone === phone);
      if (customer) {
        setFormData((prev) => ({
          ...prev,
          senderName: customer.name,
          senderAddress: customer.address,
          senderProvinceId: customer.provinceId,
          senderDistrictId: customer.districtId,
          senderWardId: customer.wardId,
        }));
      }
    }
  };

  // Calculate converted weight
  const calculateConvertedWeight = () => {
    const { length, width, height } = formData;
    if (length > 0 && width > 0 && height > 0) {
      return (length * width * height) / 5000;
    }
    return 0;
  };

  // Calculate pricing
  const handleCalculatePrice = async () => {
    const convertedWeight = calculateConvertedWeight();
    const finalWeight = Math.max(formData.actualWeight, convertedWeight);

    // Get service type ID based on service type code
    const serviceTypeMap: Record<string, number> = {
      EXPRESS: 1,
      STANDARD: 2,
      SAVING: 3,
    };
    const serviceTypeId = serviceTypeMap[formData.serviceType];

    const feeResult = await PricingService.calculateFee(
      serviceTypeId,
      finalWeight
    );

    const codFee = await PricingService.calculateCodFee(formData.codAmount);
    const insuranceFee = await PricingService.calculateInsuranceFee(
      formData.insuranceValue
    );

    setCalculatedFee({
      baseFee: feeResult.baseFee,
      codFee,
      insuranceFee,
      totalFee: feeResult.baseFee + codFee + insuranceFee,
      finalWeight,
      convertedWeight,
    });
  };

  // Auto-calculate when relevant fields change
  React.useEffect(() => {
    if (
      formData.senderProvinceId &&
      formData.receiverProvinceId &&
      (formData.actualWeight > 0 || calculateConvertedWeight() > 0)
    ) {
      handleCalculatePrice();
    }
  }, [
    formData.senderProvinceId,
    formData.receiverProvinceId,
    formData.actualWeight,
    formData.length,
    formData.width,
    formData.height,
    formData.serviceType,
    formData.codAmount,
    formData.insuranceValue,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create order
      const senderProvince = provinces.find(
        (p) => p.id === formData.senderProvinceId
      );
      const senderDistrict = senderDistricts.find(
        (d) => d.id === formData.senderDistrictId
      );
      const senderWard = senderWards.find(
        (w) => w.id === formData.senderWardId
      );
      const receiverProvince = provinces.find(
        (p) => p.id === formData.receiverProvinceId
      );
      const receiverDistrict = receiverDistricts.find(
        (d) => d.id === formData.receiverDistrictId
      );
      const receiverWard = receiverWards.find(
        (w) => w.id === formData.receiverWardId
      );

      const serviceTypeMap: Record<string, number> = {
        EXPRESS: 1,
        STANDARD: 2,
        SAVING: 3,
      };

      const order = await OrderService.create({
        customerId: 1, // Mock customer
        serviceTypeId: serviceTypeMap[formData.serviceType],
        senderName: formData.senderName,
        senderPhone: formData.senderPhone,
        senderAddress: formData.senderAddress,
        senderProvince: senderProvince?.name,
        senderDistrict: senderDistrict?.name,
        senderWard: senderWard?.name,
        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        receiverAddress: formData.receiverAddress,
        receiverProvince: receiverProvince?.name || "",
        receiverDistrict: receiverDistrict?.name || "",
        receiverWard: receiverWard?.name,
        packageType: formData.goodsType,
        actualWeight: formData.actualWeight,
        declaredValue: formData.insuranceValue,
        notes: formData.note,
        codAmount: formData.codAmount,
      });

      setTrackingNumber(order.trackingNumber);
      alert("Tạo vận đơn thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      senderName: "",
      senderPhone: "",
      senderAddress: "",
      senderProvinceId: null,
      senderDistrictId: null,
      senderWardId: null,
      receiverName: "",
      receiverPhone: "",
      receiverAddress: "",
      receiverProvinceId: null,
      receiverDistrictId: null,
      receiverWardId: null,
      goodsType: "DOCUMENT",
      actualWeight: 0,
      length: 0,
      width: 0,
      height: 0,
      serviceType: "STANDARD",
      codAmount: 0,
      insuranceValue: 0,
      note: "",
    });
    setCalculatedFee(null);
    setTrackingNumber(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <Package size={28} />
            Tiếp nhận Bưu gửi
          </h1>
          <p className="text-secondary-600 mt-1">
            Nhập thông tin người gửi, người nhận và hàng hóa
          </p>
        </div>
        {trackingNumber && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <p className="text-xs text-green-700 font-medium">Mã vận đơn</p>
            <p className="text-lg font-bold text-green-900">{trackingNumber}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: Sender & Receiver */}
          <div className="space-y-6">
            {/* Sender Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Thông tin Người gửi
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Số điện thoại *"
                    value={formData.senderPhone}
                    onChange={(e) => handleSenderPhoneChange(e.target.value)}
                    placeholder="0901234567"
                    required
                  />
                  <Input
                    label="Họ và tên *"
                    value={formData.senderName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        senderName: e.target.value,
                      }))
                    }
                    placeholder="Nguyễn Văn A"
                    required
                  />
                  <Select
                    label="Tỉnh/Thành phố *"
                    value={formData.senderProvinceId?.toString() || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        senderProvinceId: Number(e.target.value),
                        senderDistrictId: null,
                        senderWardId: null,
                      }))
                    }
                    options={[
                      { value: "", label: "-- Chọn tỉnh/thành phố --" },
                      ...provinces.map((p) => ({
                        value: p.id.toString(),
                        label: p.name,
                      })),
                    ]}
                    required
                  />
                  <Select
                    label="Quận/Huyện *"
                    value={formData.senderDistrictId?.toString() || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        senderDistrictId: Number(e.target.value),
                        senderWardId: null,
                      }))
                    }
                    options={[
                      { value: "", label: "-- Chọn quận/huyện --" },
                      ...senderDistricts.map((d) => ({
                        value: d.id.toString(),
                        label: d.name,
                      })),
                    ]}
                    disabled={!formData.senderProvinceId}
                    required
                  />
                  <Select
                    label="Phường/Xã *"
                    value={formData.senderWardId?.toString() || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        senderWardId: Number(e.target.value),
                      }))
                    }
                    options={[
                      { value: "", label: "-- Chọn phường/xã --" },
                      ...senderWards.map((w) => ({
                        value: w.id.toString(),
                        label: w.name,
                      })),
                    ]}
                    disabled={!formData.senderDistrictId}
                    required
                  />
                  <Input
                    label="Địa chỉ cụ thể *"
                    value={formData.senderAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        senderAddress: e.target.value,
                      }))
                    }
                    placeholder="Số nhà, tên đường"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Receiver Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Thông tin Người nhận
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Số điện thoại *"
                    value={formData.receiverPhone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiverPhone: e.target.value,
                      }))
                    }
                    placeholder="0901234567"
                    required
                  />
                  <Input
                    label="Họ và tên *"
                    value={formData.receiverName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiverName: e.target.value,
                      }))
                    }
                    placeholder="Trần Thị B"
                    required
                  />
                  <Select
                    label="Tỉnh/Thành phố *"
                    value={formData.receiverProvinceId?.toString() || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiverProvinceId: Number(e.target.value),
                        receiverDistrictId: null,
                        receiverWardId: null,
                      }))
                    }
                    options={[
                      { value: "", label: "-- Chọn tỉnh/thành phố --" },
                      ...provinces.map((p) => ({
                        value: p.id.toString(),
                        label: p.name,
                      })),
                    ]}
                    required
                  />
                  <Select
                    label="Quận/Huyện *"
                    value={formData.receiverDistrictId?.toString() || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiverDistrictId: Number(e.target.value),
                        receiverWardId: null,
                      }))
                    }
                    options={[
                      { value: "", label: "-- Chọn quận/huyện --" },
                      ...receiverDistricts.map((d) => ({
                        value: d.id.toString(),
                        label: d.name,
                      })),
                    ]}
                    disabled={!formData.receiverProvinceId}
                    required
                  />
                  <Select
                    label="Phường/Xã *"
                    value={formData.receiverWardId?.toString() || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiverWardId: Number(e.target.value),
                      }))
                    }
                    options={[
                      { value: "", label: "-- Chọn phường/xã --" },
                      ...receiverWards.map((w) => ({
                        value: w.id.toString(),
                        label: w.name,
                      })),
                    ]}
                    disabled={!formData.receiverDistrictId}
                    required
                  />
                  <Input
                    label="Địa chỉ cụ thể *"
                    value={formData.receiverAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receiverAddress: e.target.value,
                      }))
                    }
                    placeholder="Số nhà, tên đường"
                    required
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Parcel Details & Pricing */}
          <div className="space-y-6">
            {/* Goods Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Thông tin Hàng hóa
                </h3>
                <div className="space-y-4">
                  <Select
                    label="Loại hàng hóa *"
                    value={formData.goodsType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        goodsType: e.target.value,
                      }))
                    }
                    options={[
                      { value: "DOCUMENT", label: "Tài liệu" },
                      { value: "PACKAGE", label: "Hàng hóa" },
                      { value: "FRAGILE", label: "Hàng dễ vỡ" },
                      { value: "FOOD", label: "Thực phẩm" },
                      { value: "ELECTRONICS", label: "Điện tử" },
                    ]}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Trọng lượng thực (kg) *"
                      type="number"
                      step="0.1"
                      value={formData.actualWeight || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          actualWeight: Number(e.target.value),
                        }))
                      }
                      placeholder="0.5"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Trọng lượng quy đổi (kg)
                      </label>
                      <div className="bg-secondary-100 rounded-lg px-3 py-2 text-secondary-900 font-semibold">
                        {calculateConvertedWeight().toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Dài (cm)"
                      type="number"
                      value={formData.length || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          length: Number(e.target.value),
                        }))
                      }
                      placeholder="20"
                    />
                    <Input
                      label="Rộng (cm)"
                      type="number"
                      value={formData.width || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          width: Number(e.target.value),
                        }))
                      }
                      placeholder="15"
                    />
                    <Input
                      label="Cao (cm)"
                      type="number"
                      value={formData.height || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          height: Number(e.target.value),
                        }))
                      }
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Service Type */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Loại dịch vụ *
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      value: "EXPRESS",
                      label: "🚀 Hỏa tốc (24 giờ)",
                      color: "red",
                    },
                    {
                      value: "STANDARD",
                      label: "⚡ Chuyển phát nhanh (2-3 ngày)",
                      color: "blue",
                    },
                    {
                      value: "SAVING",
                      label: "📦 Tiết kiệm (4-5 ngày)",
                      color: "green",
                    },
                  ].map((service) => (
                    <label
                      key={service.value}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.serviceType === service.value
                          ? `border-${service.color}-500 bg-${service.color}-50`
                          : "border-secondary-200 hover:border-secondary-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="serviceType"
                        value={service.value}
                        checked={formData.serviceType === service.value}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            serviceType: e.target.value,
                          }))
                        }
                        className="w-4 h-4"
                      />
                      <span className="font-medium text-secondary-900">
                        {service.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </Card>

            {/* Value Added Services */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Dịch vụ gia tăng
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Thu hộ COD (VNĐ)"
                    type="number"
                    value={formData.codAmount || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        codAmount: Number(e.target.value),
                      }))
                    }
                    placeholder="0"
                  />
                  <Input
                    label="Giá trị khai giá bảo hiểm (VNĐ)"
                    type="number"
                    value={formData.insuranceValue || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        insuranceValue: Number(e.target.value),
                      }))
                    }
                    placeholder="0"
                  />
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={formData.note}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                      className="w-full border border-secondary-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="Ghi chú đặc biệt về đơn hàng..."
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Pricing Calculator */}
            {calculatedFee && (
              <Card>
                <div className="p-6 bg-primary-50">
                  <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
                    <Calculator size={20} />
                    Chi tiết Cước phí
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-700">
                        Trọng lượng tính cước:
                      </span>
                      <span className="font-semibold">
                        {calculatedFee.finalWeight.toFixed(2)} kg
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-700">
                        Cước vận chuyển:
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(calculatedFee.baseFee)}
                      </span>
                    </div>
                    {calculatedFee.codFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-700">
                          Phí thu hộ COD:
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(calculatedFee.codFee)}
                        </span>
                      </div>
                    )}
                    {calculatedFee.insuranceFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-700">
                          Phí bảo hiểm:
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(calculatedFee.insuranceFee)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-primary-200 pt-3 flex justify-between">
                      <span className="font-bold text-primary-900">
                        TỔNG CỘNG:
                      </span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(calculatedFee.totalFee)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                <Save size={18} />
                {loading ? "Đang xử lý..." : "Tạo vận đơn"}
              </Button>
              {trackingNumber && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => window.print()}
                >
                  <Printer size={18} />
                  In tem
                </Button>
              )}
              <Button type="button" variant="outline" onClick={handleReset}>
                Làm mới
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
