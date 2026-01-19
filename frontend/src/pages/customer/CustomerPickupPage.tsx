import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Truck,
    Box,
    User,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Loader2,
    PackageOpen
} from "lucide-react";
import {
    Card,
    Button,
    Input,
    Label,
    PageHeader,
    AddressSelector,
    // Assuming you export FormSelect from your UI components folder
    FormSelect
} from "../../components/ui";
import { toast } from "sonner";
import { orderService } from "../../services/orderService";
import { formatCurrency } from "../../lib/utils";

type Step = "INFO" | "DETAILS" | "CONFIRM";

const PACKAGE_OPTIONS = [
    { value: "BOX", label: "Hộp/Thùng (Box)" },
    { value: "DOCUMENT", label: "Tài liệu (Document)" },
    { value: "FRAGILE", label: "Hàng dễ vỡ (Fragile)" },
    { value: "OVERSIZED", label: "Quá khổ (Oversized)" }
];



export function CustomerPickupPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<Step>("INFO");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        // Sender
        senderName: "",
        senderPhone: "",
        senderAddressLine1: "",
        senderWardCode: "",
        senderProvinceCode: "",
        // Receiver
        receiverName: "",
        receiverPhone: "",
        receiverAddressLine1: "",
        receiverWardCode: "",
        receiverProvinceCode: "",
        // Package
        packageType: "BOX",
        packageDescription: "",
        weightKg: 0.5,
        lengthCm: 10,
        widthCm: 10,
        heightCm: 10,
        // Service
        serviceType: "STANDARD",
        codAmount: 0,
        declaredValue: 0,
        addInsurance: false
    });

    const [priceResult, setPriceResult] = useState<any>(null);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Auto-calculate Price Effect
    useEffect(() => {
        if (!formData.receiverWardCode || formData.weightKg <= 0) {
            setPriceResult(null);
            return;
        }

        setIsCalculating(true);

        const timeoutId = setTimeout(async () => {
            try {
                const payload = {
                    destinationWardCode: formData.receiverWardCode,
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
                setPriceResult(res);
            } catch (error) {
                console.error("Calculation failed", error);
            } finally {
                setIsCalculating(false);
            }
        }, 800);

        return () => clearTimeout(timeoutId);

    }, [
        formData.receiverWardCode,
        formData.packageType,
        formData.weightKg,
        formData.lengthCm,
        formData.widthCm,
        formData.heightCm,
        formData.serviceType,
        formData.declaredValue,
        formData.addInsurance
    ]);

    const handleSubmit = async () => {
        if (!priceResult && !isCalculating) {
            toast.error("Vui lòng đợi tính cước phí hoàn tất");
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
            toast.error("Tạo đơn hàng thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep === "INFO") {
            if (!formData.senderName || !formData.receiverName || !formData.receiverWardCode) {
                toast.error("Vui lòng điền đủ thông tin bắt buộc");
                return;
            }
            setCurrentStep("DETAILS");
        } else if (currentStep === "DETAILS") {
            if (formData.weightKg <= 0) {
                toast.error("Trọng lượng phải lớn hơn 0");
                return;
            }
            if (isCalculating) {
                toast.info("Đang tính phí, vui lòng đợi...");
                return;
            }
            setCurrentStep("CONFIRM");
        }
    };

    const steps = [
        { id: "INFO", label: "Thông tin", icon: User },
        { id: "DETAILS", label: "Chi tiết & Báo giá", icon: PackageOpen },
        { id: "CONFIRM", label: "Xác nhận", icon: CheckCircle },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    const progressPercentage = (currentStepIndex / (steps.length - 1)) * 100;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <PageHeader title="Tạo Vận Đơn Mới" description="Tạo đơn hàng gửi bưu kiện tại bưu cục" />

            {/* Stepper */}
            <div className="relative px-10 py-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="absolute top-9 left-0 w-full px-12 h-1 z-0">
                    <div className="w-full h-full bg-gray-100 rounded-full relative">
                        <div
                            className="absolute top-0 left-0 h-full bg-primary-600 rounded-full transition-all duration-300 ease-in-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between relative z-10">
                    {steps.map((step, index) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

                        return (
                            <div key={step.id} className="flex flex-col items-center bg-white">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors border-2 ${isActive
                                    ? "bg-primary-600 text-white border-primary-600 shadow-md ring-4 ring-primary-50"
                                    : isCompleted
                                        ? "bg-white text-primary-600 border-primary-600"
                                        : "bg-white text-gray-400 border-gray-200"
                                    }`}>
                                    <step.icon size={18} />
                                </div>
                                <span className={`text-sm font-medium transition-colors ${isActive || isCompleted ? "text-primary-700" : "text-gray-500"
                                    }`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Form Area */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <div className="p-6 space-y-6">
                            {/* STEP 1: INFO */}
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
                                                    onChange={(addr) => {
                                                        handleInputChange("senderAddressLine1", addr.addressLine1);
                                                        handleInputChange("senderWardCode", addr.wardCode);
                                                        handleInputChange("senderProvinceCode", addr.provinceCode);
                                                    }}
                                                    initialValue={formData.senderAddressLine1}
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
                                                    onChange={(addr) => {
                                                        handleInputChange("receiverAddressLine1", addr.addressLine1);
                                                        handleInputChange("receiverWardCode", addr.wardCode);
                                                        handleInputChange("receiverProvinceCode", addr.provinceCode);
                                                    }}
                                                    initialValue={formData.receiverAddressLine1}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: DETAILS */}
                            {currentStep === "DETAILS" && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                        {/* LEFT COLUMN: PACKAGE INPUTS */}
                                        <div className="space-y-5">
                                            <h3 className="text-lg font-semibold flex items-center text-gray-800 border-b pb-2">
                                                <Box className="mr-2 text-primary-600" size={20} /> Hàng hóa
                                            </h3>

                                            <div className="space-y-4">
                                                {/* ---- NEW FORM SELECT IMPLEMENTATION ---- */}
                                                <div>
                                                    <FormSelect
                                                        label="Loại hàng hóa"
                                                        value={formData.packageType}
                                                        onChange={(val) => handleInputChange("packageType", val)}
                                                        options={PACKAGE_OPTIONS}
                                                        placeholder="Chọn loại hàng"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Trọng lượng (kg) <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        type="number"
                                                        min="0.1"
                                                        step="0.1"
                                                        value={formData.weightKg}
                                                        onChange={e => handleInputChange("weightKg", parseFloat(e.target.value))}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Kích thước (cm)</Label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <Input type="number" placeholder="Dài" value={formData.lengthCm} onChange={e => handleInputChange("lengthCm", parseFloat(e.target.value))} />
                                                        <Input type="number" placeholder="Rộng" value={formData.widthCm} onChange={e => handleInputChange("widthCm", parseFloat(e.target.value))} />
                                                        <Input type="number" placeholder="Cao" value={formData.heightCm} onChange={e => handleInputChange("heightCm", parseFloat(e.target.value))} />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Mô tả nội dung</Label>
                                                    <Input
                                                        value={formData.packageDescription}
                                                        onChange={e => handleInputChange("packageDescription", e.target.value)}
                                                        placeholder="VD: Quần áo..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT COLUMN: SERVICE & ADD-ONS */}
                                        <div className="space-y-5">
                                            <h3 className="text-lg font-semibold flex items-center text-gray-800 border-b pb-2">
                                                <Truck className="mr-2 text-primary-600" size={20} /> Dịch vụ
                                            </h3>

                                            {/* Service Selection */}
                                            <div className="space-y-2">
                                                <Label>Chọn gói vận chuyển</Label>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {[
                                                        { id: "STANDARD", label: "Chuẩn", desc: "3-4 ngày" },
                                                        { id: "EXPRESS", label: "Hỏa tốc", desc: "1-2 ngày" },
                                                        { id: "ECONOMY", label: "Tiết kiệm", desc: "5-7 ngày" }
                                                    ].map(s => {
                                                        const serviceInfo = priceResult?.availableServices?.find((as: any) => as.serviceType === s.id);
                                                        return (
                                                            <button
                                                                key={s.id}
                                                                className={`p-3 rounded-lg border text-left transition-all relative ${formData.serviceType === s.id
                                                                    ? "border-primary-600 bg-primary-50 ring-1 ring-primary-600 shadow-sm"
                                                                    : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                                                                    }`}
                                                                onClick={() => handleInputChange("serviceType", s.id)}
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <div className="font-medium text-sm text-gray-900">{s.label}</div>
                                                                        <div className="text-xs text-gray-500">{s.desc}</div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        {isCalculating ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                                                        ) : serviceInfo ? (
                                                                            <div className="font-bold text-primary-700">
                                                                                {formatCurrency(serviceInfo.totalAmount)}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-xs text-gray-400">---</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-2">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Thu hộ (COD)</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className="h-9"
                                                            value={formData.codAmount}
                                                            onChange={e => handleInputChange("codAmount", parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Khai giá</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className="h-9"
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
                                                        Bảo hiểm hàng hóa (1%)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: CONFIRM */}
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
                                            <p>{formData.receiverAddressLine1}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Summary */}
                <div className="md:col-span-1">
                    <Card className="sticky top-6">
                        <div className="p-4 space-y-4">
                            <h4 className="font-semibold text-gray-900 border-b pb-2">Tóm tắt đơn hàng</h4>

                            <div className="space-y-3 text-sm">
                                {(formData.senderName || formData.senderPhone) && (
                                    <div className="border-b border-gray-100 pb-2">
                                        <span className="text-gray-500 block text-xs">Người gửi</span>
                                        <div className="font-medium text-gray-900 truncate">{formData.senderName}</div>
                                    </div>
                                )}
                                {(formData.receiverName || formData.receiverAddressLine1) && (
                                    <div className="border-b border-gray-100 pb-2">
                                        <span className="text-gray-500 block text-xs">Người nhận</span>
                                        <div className="font-medium text-gray-900 truncate">{formData.receiverName}</div>
                                        {formData.receiverAddressLine1 && <div className="text-xs text-gray-500 line-clamp-2">{formData.receiverAddressLine1}</div>}
                                    </div>
                                )}

                                <div className="bg-primary-50 p-3 rounded-lg mt-4 transition-all">
                                    <span className="text-xs text-primary-600 font-semibold uppercase block mb-1">Tổng phí tạm tính</span>
                                    {isCalculating ? (
                                        <div className="flex items-center space-x-2 text-primary-400">
                                            <Loader2 className="animate-spin h-5 w-5" />
                                            <span className="text-sm font-medium">Đang tính...</span>
                                        </div>
                                    ) : (
                                        <span className="text-xl font-bold text-primary-700">
                                            {priceResult ? formatCurrency(priceResult.totalAmount) : "---"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 space-y-2">
                                {currentStep !== "INFO" && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            if (currentStep === "CONFIRM") setCurrentStep("DETAILS");
                                            else if (currentStep === "DETAILS") setCurrentStep("INFO");
                                        }}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                                    </Button>
                                )}

                                {currentStep !== "CONFIRM" ? (
                                    <Button className="w-full" onClick={nextStep} disabled={isCalculating && currentStep === "DETAILS"}>
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