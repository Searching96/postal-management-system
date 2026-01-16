import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Truck,
    Box,
    User,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Calculator
} from "lucide-react";
import {
    Card,
    Button,
    Input,
    Label,
    PageHeader,
    AddressSelector
} from "../../components/ui";
import { toast } from "sonner";
import { orderService } from "../../services/orderService";
import { formatCurrency } from "../../lib/utils";

type Step = "INFO" | "PACKAGE" | "SERVICE" | "CONFIRM";

export function CreateOrderPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<Step>("INFO");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        // Sender
        senderName: "",
        senderPhone: "",
        senderAddress: "",
        // Receiver
        receiverName: "",
        receiverPhone: "",
        receiverAddress: "",
        destinationWardCode: "",
        // Package
        packageType: "BOX", // BOX, DOCUMENT, FRAGILE
        packageDescription: "",
        weightKg: 0.5,
        lengthCm: 10,
        widthCm: 10,
        heightCm: 10,
        // Service
        serviceType: "STANDARD", // STANDARD, EXPRESS, ECONOMY
        codAmount: 0,
        declaredValue: 0,
        addInsurance: false,
        deliveryInstructions: "",
        internalNotes: ""
    });

    // Calculated Price
    const [priceResult, setPriceResult] = useState<any>(null);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Reset calculated price if inputs change
        if (["weightKg", "lengthCm", "widthCm", "heightCm", "serviceType", "destinationWardCode", "addInsurance", "declaredValue"].includes(field)) {
            setPriceResult(null);
        }
    };

    const calculatePrice = async () => {
        if (!formData.destinationWardCode) {
            toast.error("Vui lòng chọn phường/xã người nhận");
            return;
        }

        setIsCalculating(true);
        try {
            const payload = {
                destinationWardCode: formData.destinationWardCode,
                packageType: formData.packageType,
                weightKg: formData.weightKg,
                lengthCm: formData.lengthCm,
                widthCm: formData.widthCm,
                heightCm: formData.heightCm,
                serviceType: formData.serviceType,
                declaredValue: formData.declaredValue,
                addInsurance: formData.addInsurance
            };
            const res = await orderService.calculatePrice(payload);
            if (res.success) {
                setPriceResult(res.data);
                toast.success("Đã tính cước phí");
            }
        } catch (error) {
            console.error("Calculation failed", error);
            toast.error("Tính phí thất bại");
        } finally {
            setIsCalculating(false);
        }
    };

    const handleSubmit = async () => {
        if (!priceResult) {
            toast.error("Vui lòng tính cước phí trước khi tạo đơn");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await orderService.createOrder(formData);
            if (res.success) {
                toast.success("Tạo đơn hàng thành công!");
                navigate(`/orders/${res.data.id}`);
            }
        } catch (error) {
            console.error("Creation failed", error);
            toast.error("Tạo đơn hàng thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep === "INFO") {
            if (!formData.senderName || !formData.receiverName || !formData.destinationWardCode) {
                toast.error("Vui lòng điền đủ thông tin bắt buộc");
                return;
            }
            setCurrentStep("PACKAGE");
        } else if (currentStep === "PACKAGE") {
            if (formData.weightKg <= 0) {
                toast.error("Trọng lượng phải lớn hơn 0");
                return;
            }
            setCurrentStep("SERVICE");
        } else if (currentStep === "SERVICE") {
            if (!priceResult) {
                calculatePrice().then(() => setCurrentStep("CONFIRM"));
            } else {
                setCurrentStep("CONFIRM");
            }
        }
    };

    const steps = [
        { id: "INFO", label: "Thông tin", icon: User },
        { id: "PACKAGE", label: "Hàng hóa", icon: Box },
        { id: "SERVICE", label: "Dịch vụ", icon: Truck },
        { id: "CONFIRM", label: "Xác nhận", icon: CheckCircle },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <PageHeader title="Tạo Vận Đơn Mới" description="Tạo đơn hàng gửi bưu kiện tại bưu cục" />

            {/* Stepper */}
            <div className="flex items-center justify-between px-10 py-4 bg-white rounded-xl shadow-sm border border-gray-100">
                {steps.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

                    return (
                        <div key={step.id} className="flex flex-col items-center relative z-10 text-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${isActive ? "bg-primary-600 text-white shadow-md ring-4 ring-primary-50" :
                                    isCompleted ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                                }`}>
                                <step.icon size={18} />
                            </div>
                            <span className={`text-sm font-medium ${isActive ? "text-primary-700" : "text-gray-500"}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Form Area */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <div className="p-6 space-y-6">
                            {currentStep === "INFO" && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center text-gray-800">
                                            <User className="mr-2 text-primary-600" size={20} /> Người gửi
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Họ tên <span className="text-red-500">*</span></Label>
                                                <Input
                                                    value={formData.senderName}
                                                    onChange={e => handleInputChange("senderName", e.target.value)}
                                                    placeholder="VD: Nguyễn Văn A"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Số điện thoại <span className="text-red-500">*</span></Label>
                                                <Input
                                                    value={formData.senderPhone}
                                                    onChange={e => handleInputChange("senderPhone", e.target.value)}
                                                    placeholder="VD: 0901234567"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <AddressSelector
                                                    label="Địa chỉ gửi"
                                                    required
                                                    onAddressChange={(val) => handleInputChange("senderAddress", val)}
                                                    initialValue={formData.senderAddress}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center text-gray-800">
                                            <User className="mr-2 text-blue-600" size={20} /> Người nhận
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Họ tên <span className="text-red-500">*</span></Label>
                                                <Input
                                                    value={formData.receiverName}
                                                    onChange={e => handleInputChange("receiverName", e.target.value)}
                                                    placeholder="VD: Trần Thị B"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Số điện thoại <span className="text-red-500">*</span></Label>
                                                <Input
                                                    value={formData.receiverPhone}
                                                    onChange={e => handleInputChange("receiverPhone", e.target.value)}
                                                    placeholder="VD: 0912345678"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <AddressSelector
                                                    label="Địa chỉ nhận"
                                                    required
                                                    onAddressChange={(val) => handleInputChange("receiverAddress", val)}
                                                    onWardChange={(code) => handleInputChange("destinationWardCode", code)}
                                                    initialValue={formData.receiverAddress}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === "PACKAGE" && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold flex items-center text-gray-800">
                                        <Box className="mr-2 text-primary-600" size={20} /> Thông tin hàng hóa
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Loại hàng hóa</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                value={formData.packageType}
                                                onChange={e => handleInputChange("packageType", e.target.value)}
                                            >
                                                <option value="BOX">Hộp/Thùng (Box)</option>
                                                <option value="DOCUMENT">Tài liệu (Document)</option>
                                                <option value="FRAGILE">Hàng dễ vỡ (Fragile)</option>
                                                <option value="OVERSIZED">Quá khổ (Oversized)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Trọng lượng thực (kg) <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="number"
                                                min="0.1"
                                                step="0.1"
                                                value={formData.weightKg}
                                                onChange={e => handleInputChange("weightKg", parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Kích thước (cm) - Dài x Rộng x Cao</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Input
                                                type="number" placeholder="Dài"
                                                value={formData.lengthCm}
                                                onChange={e => handleInputChange("lengthCm", parseFloat(e.target.value))}
                                            />
                                            <Input
                                                type="number" placeholder="Rộng"
                                                value={formData.widthCm}
                                                onChange={e => handleInputChange("widthCm", parseFloat(e.target.value))}
                                            />
                                            <Input
                                                type="number" placeholder="Cao"
                                                value={formData.heightCm}
                                                onChange={e => handleInputChange("heightCm", parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">Kích thước dùng để tính trọng lượng quy đổi (D x R x C / 5000)</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Mô tả nội dung</Label>
                                        <Input
                                            value={formData.packageDescription}
                                            onChange={e => handleInputChange("packageDescription", e.target.value)}
                                            placeholder="VD: Quần áo, sách vở..."
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === "SERVICE" && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold flex items-center text-gray-800">
                                        <Truck className="mr-2 text-primary-600" size={20} /> Dịch vụ & Phụ phí
                                    </h3>

                                    <div className="space-y-2">
                                        <Label>Dịch vụ vận chuyển</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: "STANDARD", label: "Chuẩn", desc: "3-4 ngày" },
                                                { id: "EXPRESS", label: "Hỏa tốc", desc: "1-2 ngày" },
                                                { id: "ECONOMY", label: "Tiết kiệm", desc: "5-7 ngày" }
                                            ].map(s => (
                                                <button
                                                    key={s.id}
                                                    className={`p-3 rounded-lg border text-left transition-all ${formData.serviceType === s.id
                                                            ? "border-primary-600 bg-primary-50 ring-1 ring-primary-600"
                                                            : "border-gray-200 hover:border-primary-300"
                                                        }`}
                                                    onClick={() => handleInputChange("serviceType", s.id)}
                                                >
                                                    <div className="font-medium text-sm text-gray-900">{s.label}</div>
                                                    <div className="text-xs text-gray-500">{s.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Thu hộ (COD)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={formData.codAmount}
                                                onChange={e => handleInputChange("codAmount", parseFloat(e.target.value))}

                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Giá trị khai giá</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={formData.declaredValue}
                                                onChange={e => handleInputChange("declaredValue", parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id="insurance"
                                            className="h-4 w-4 text-primary-600 rounded border-gray-300"
                                            checked={formData.addInsurance}
                                            onChange={e => handleInputChange("addInsurance", e.target.checked)}
                                        />
                                        <label htmlFor="insurance" className="text-sm font-medium text-gray-700 cursor-pointer">
                                            Bảo hiểm hàng hóa (1% giá trị khai giá)
                                        </label>
                                    </div>

                                    <div className="flex justify-center pt-4">
                                        <Button
                                            variant="secondary"
                                            onClick={calculatePrice}
                                            isLoading={isCalculating}
                                            className="w-full sm:w-auto"
                                        >
                                            <Calculator className="mr-2 h-4 w-4" /> Tính cước phí tạm tính
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {currentStep === "CONFIRM" && (
                                <div className="space-y-6">
                                    <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                                        <h3 className="text-xl font-bold text-gray-900">Xác nhận đơn hàng</h3>
                                        <p className="text-gray-600">Vui lòng kiểm tra kỹ thông tin trước khi tạo</p>
                                    </div>

                                    {priceResult && (
                                        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Cước chính:</span>
                                                <span className="font-medium">{formatCurrency(priceResult.baseShippingFee)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Phụ phí trọng lượng:</span>
                                                <span className="font-medium">{formatCurrency(priceResult.weightSurcharge)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Phụ phí vùng xa:</span>
                                                <span className="font-medium">{formatCurrency(priceResult.distanceSurcharge)}</span>
                                            </div>
                                            {priceResult.insuranceFee > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Phí bảo hiểm:</span>
                                                    <span className="font-medium">{formatCurrency(priceResult.insuranceFee)}</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-2 flex justify-between font-bold text-lg text-primary-700">
                                                <span>Tổng cước:</span>
                                                <span>{formatCurrency(priceResult.totalAmount)}</span>
                                            </div>
                                            <div className="text-xs text-right text-gray-500 mt-1">
                                                Thời gian giao dự kiến: {priceResult.estimatedDeliveryDays} ngày
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <span className="font-medium block text-gray-500">Người gửi:</span>
                                            <p>{formData.senderName} - {formData.senderPhone}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium block text-gray-500">Người nhận:</span>
                                            <p>{formData.receiverName} - {formData.receiverPhone}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="font-medium block text-gray-500">Địa chỉ nhận:</span>
                                            <p>{formData.receiverAddress}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Summary (Visible on all steps) */}
                <div className="md:col-span-1">
                    <Card className="sticky top-6">
                        <div className="p-4 space-y-4">
                            <h4 className="font-semibold text-gray-900 border-b pb-2">Tóm tắt đơn hàng</h4>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-500 block text-xs">Dịch vụ</span>
                                    <span className="font-medium text-primary-700 font-mono">
                                        {formData.serviceType}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-gray-500 block text-xs">Trọng lượng</span>
                                        <span className="font-medium">{formData.weightKg} kg</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Loại hàng</span>
                                        <span className="font-medium">{formData.packageType}</span>
                                    </div>
                                </div>

                                {priceResult && (
                                    <div className="bg-primary-50 p-3 rounded-lg mt-4">
                                        <span className="text-xs text-primary-600 font-semibold uppercase block mb-1">Tổng phí tạm tính</span>
                                        <span className="text-xl font-bold text-primary-700">
                                            {formatCurrency(priceResult.totalAmount)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 space-y-2">
                                {currentStep !== "INFO" && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            if (currentStep === "CONFIRM") setCurrentStep("SERVICE");
                                            else if (currentStep === "SERVICE") setCurrentStep("PACKAGE");
                                            else if (currentStep === "PACKAGE") setCurrentStep("INFO");
                                        }}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                                    </Button>
                                )}

                                {currentStep !== "CONFIRM" ? (
                                    <Button className="w-full" onClick={nextStep}>
                                        Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={handleSubmit}
                                        isLoading={isSubmitting}
                                    >
                                        Tạo Đơn Hàng <CheckCircle className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
