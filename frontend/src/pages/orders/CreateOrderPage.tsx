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
    Printer,
    Receipt
} from "lucide-react";
import {
    Card,
    Button,
    Input,
    Label,
    PageHeader,
    AddressSelector,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    FormSelect
} from "../../components/ui";
import { toast } from "sonner";
import { orderService } from "../../services/orderService";
import { formatCurrency } from "../../lib/utils";
import { handlePrintReceipt, handlePrintSticker } from "../../lib/printHelper";

type Step = "INFO" | "PACKAGE" | "SERVICE" | "CONFIRM";

export function CreateOrderPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<Step>("INFO");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    // Print Dialog State
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [createdOrder, setCreatedOrder] = useState<any>(null);

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

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Calculated Price (The full API response)
    const [calculationResult, setCalculationResult] = useState<any>(null);

    // Get service-specific info (totalAmount, estimatedDeliveryDays) from availableServices
    const selectedServiceInfo = calculationResult?.availableServices?.find(
        (s: any) => s.serviceType === formData.serviceType
    );

    // The fee breakdown (baseShippingFee, weightSurcharge, etc.) is always from the root object
    // but totalAmount should come from the selected service if available
    const currentPriceDetail = calculationResult ? {
        ...calculationResult,
        ...(selectedServiceInfo || {})
    } : null;

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }

        // Reset calculation ONLY if parameters affecting the QUOTE change.
        // Changing 'serviceType' should NOT reset, because we (hopefully) have quotes for all services.
        if (["weightKg", "lengthCm", "widthCm", "heightCm", "destinationWardCode", "addInsurance", "declaredValue"].includes(field)) {
            setCalculationResult(null);
        }
    };

    // Vietnamese phone number regex: starts with 0, 9 or 10 digits after (10-11 digits total)
    const isValidPhone = (phone: string) => /^0\d{9,10}$/.test(phone);

    // Real-time validation on blur
    const validateField = (field: string) => {
        let error = "";
        const value = formData[field as keyof typeof formData];

        switch (field) {
            case "senderName":
                if (!String(value).trim()) error = "Vui lòng nhập tên người gửi";
                else if (String(value).length > 255) error = "Tên người gửi không được quá 255 ký tự";
                break;
            case "senderPhone":
                if (!String(value).trim()) error = "Vui lòng nhập số điện thoại";
                else if (!isValidPhone(String(value))) error = "SĐT không hợp lệ (VD: 0901234567)";
                break;
            case "receiverName":
                if (!String(value).trim()) error = "Vui lòng nhập tên người nhận";
                else if (String(value).length > 255) error = "Tên người nhận không được quá 255 ký tự";
                break;
            case "receiverPhone":
                if (!String(value).trim()) error = "Vui lòng nhập số điện thoại";
                else if (!isValidPhone(String(value))) error = "SĐT không hợp lệ (VD: 0901234567)";
                break;
            case "weightKg":
                const w = Number(value);
                if (w < 0.01) error = "Trọng lượng tối thiểu 0.01 kg";
                else if (w > 100) error = "Trọng lượng tối đa 100 kg";
                break;
            case "lengthCm":
                const l = Number(value);
                if (l < 0.1) error = "Chiều dài tối thiểu 0.1 cm";
                else if (l > 300) error = "Chiều dài tối đa 300 cm";
                break;
            case "widthCm":
                const wd = Number(value);
                if (wd < 0.1) error = "Chiều rộng tối thiểu 0.1 cm";
                else if (wd > 300) error = "Chiều rộng tối đa 300 cm";
                break;
            case "heightCm":
                const h = Number(value);
                if (h < 0.1) error = "Chiều cao tối thiểu 0.1 cm";
                else if (h > 300) error = "Chiều cao tối đa 300 cm";
                break;
            case "packageDescription":
                if (String(value).length > 500) error = "Mô tả không được quá 500 ký tự";
                break;
            case "codAmount":
                if (Number(value) < 0) error = "Số tiền thu hộ không được âm";
                break;
            case "declaredValue":
                if (Number(value) < 0) error = "Giá trị khai giá không được âm";
                break;
        }

        if (error) {
            setErrors(prev => ({ ...prev, [field]: error }));
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
            // Handle both wrapped {success, data} and unwrapped responses
            const priceData = res.data ?? res;
            if (priceData) {
                setCalculationResult(priceData);
                toast.success("Đã tính cước phí");
            }
        } catch (error) {
            console.error("Calculation failed", error);
            toast.error("Tính phí thất bại");
        } finally {
            setIsCalculating(false);
        }
    };

    // Auto-calculate price when entering SERVICE step or when price-affecting fields change (debounced)
    useEffect(() => {
        if (currentStep !== "SERVICE" || !formData.destinationWardCode) return;

        const timeoutId = setTimeout(() => {
            if (!isCalculating) {
                calculatePrice();
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [currentStep, formData.serviceType, formData.declaredValue, formData.addInsurance]);

    const handleSubmit = async () => {
        if (!currentPriceDetail) {
            toast.error("Vui lòng tính cước phí trước khi tạo đơn");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await orderService.createOrder(formData);
            // Handle both wrapped {success, data} and unwrapped responses
            // The backend returns OrderResponse directly, so 'res' itself might be the order, or res.data
            const rawData = (res.data ?? res) as any;
            const orderData = {
                ...rawData,
                id: rawData.id || rawData.orderId,
                lengthCm: formData.lengthCm,
                widthCm: formData.widthCm,
                heightCm: formData.heightCm,
                packageDescription: formData.packageDescription
            };

            if (orderData && orderData.id) {
                toast.success("Tạo đơn hàng thành công!");
                setCreatedOrder(orderData);
                setShowSuccessDialog(true);
            } else {
                console.error("Order created but no ID found:", orderData);
                toast.error("Tạo đơn hàng thành công nhưng không tìm thấy ID đơn hàng.");
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
            const newErrors: Record<string, string> = {};

            if (!formData.senderName.trim()) {
                newErrors.senderName = "Vui lòng nhập tên người gửi";
            } else if (formData.senderName.length > 255) {
                newErrors.senderName = "Tên người gửi không được quá 255 ký tự";
            }

            if (!formData.senderPhone.trim()) {
                newErrors.senderPhone = "Vui lòng nhập số điện thoại";
            } else if (!isValidPhone(formData.senderPhone)) {
                newErrors.senderPhone = "SĐT không hợp lệ (VD: 0901234567)";
            }

            if (!formData.receiverName.trim()) {
                newErrors.receiverName = "Vui lòng nhập tên người nhận";
            } else if (formData.receiverName.length > 255) {
                newErrors.receiverName = "Tên người nhận không được quá 255 ký tự";
            }

            if (!formData.receiverPhone.trim()) {
                newErrors.receiverPhone = "Vui lòng nhập số điện thoại";
            } else if (!isValidPhone(formData.receiverPhone)) {
                newErrors.receiverPhone = "SĐT không hợp lệ (VD: 0901234567)";
            }

            if (!formData.destinationWardCode) {
                newErrors.destinationWardCode = "Vui lòng chọn phường/xã";
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            setErrors({});
            setCurrentStep("PACKAGE");
        } else if (currentStep === "PACKAGE") {
            const newErrors: Record<string, string> = {};
            if (formData.weightKg < 0.01) newErrors.weightKg = "Trọng lượng tối thiểu 0.01 kg";
            else if (formData.weightKg > 100) newErrors.weightKg = "Trọng lượng tối đa 100 kg";

            if (formData.lengthCm < 0.1) newErrors.lengthCm = "Chiều dài tối thiểu 0.1 cm";
            else if (formData.lengthCm > 300) newErrors.lengthCm = "Chiều dài tối đa 300 cm";

            if (formData.widthCm < 0.1) newErrors.widthCm = "Chiều rộng tối thiểu 0.1 cm";
            else if (formData.widthCm > 300) newErrors.widthCm = "Chiều rộng tối đa 300 cm";

            if (formData.heightCm < 0.1) newErrors.heightCm = "Chiều cao tối thiểu 0.1 cm";
            else if (formData.heightCm > 300) newErrors.heightCm = "Chiều cao tối đa 300 cm";

            if (formData.packageDescription.length > 500) newErrors.packageDescription = "Mô tả không được quá 500 ký tự";

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                toast.error("Vui lòng kiểm tra lại thông tin hàng hóa");
                return;
            }
            setErrors({});
            setCurrentStep("SERVICE");
        } else if (currentStep === "SERVICE") {
            const newErrors: Record<string, string> = {};
            if (formData.codAmount < 0) newErrors.codAmount = "Số tiền thu hộ không được âm";
            if (formData.declaredValue < 0) newErrors.declaredValue = "Giá trị khai giá không được âm";

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }
            setErrors({});

            if (!calculationResult) {
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
                                                    onBlur={() => validateField("senderName")}
                                                    placeholder="VD: Nguyễn Văn A"
                                                    className={errors.senderName ? "border-red-500" : ""}
                                                />
                                                {errors.senderName && <p className="text-red-500 text-xs">{errors.senderName}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Số điện thoại <span className="text-red-500">*</span></Label>
                                                <Input
                                                    value={formData.senderPhone}
                                                    onChange={e => handleInputChange("senderPhone", e.target.value)}
                                                    onBlur={() => validateField("senderPhone")}
                                                    placeholder="VD: 0901234567"
                                                    className={errors.senderPhone ? "border-red-500" : ""}
                                                />
                                                {errors.senderPhone && <p className="text-red-500 text-xs">{errors.senderPhone}</p>}
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
                                                    onBlur={() => validateField("receiverName")}
                                                    placeholder="VD: Trần Thị B"
                                                    className={errors.receiverName ? "border-red-500" : ""}
                                                />
                                                {errors.receiverName && <p className="text-red-500 text-xs">{errors.receiverName}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Số điện thoại <span className="text-red-500">*</span></Label>
                                                <Input
                                                    value={formData.receiverPhone}
                                                    onChange={e => handleInputChange("receiverPhone", e.target.value)}
                                                    onBlur={() => validateField("receiverPhone")}
                                                    placeholder="VD: 0912345678"
                                                    className={errors.receiverPhone ? "border-red-500" : ""}
                                                />
                                                {errors.receiverPhone && <p className="text-red-500 text-xs">{errors.receiverPhone}</p>}
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
                                            <FormSelect
                                                label="Loại hàng hóa"
                                                value={formData.packageType}
                                                onChange={(val) => handleInputChange("packageType", val)}
                                                options={[
                                                    { value: "BOX", label: "Hộp/Thùng (Box)" },
                                                    { value: "DOCUMENT", label: "Tài liệu (Document)" },
                                                    { value: "FRAGILE", label: "Hàng dễ vỡ (Fragile)" },
                                                    { value: "OVERSIZED", label: "Quá khổ (Oversized)" }
                                                ]}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Trọng lượng thực (kg) <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="number"
                                                min="0.1"
                                                step="0.1"
                                                value={formData.weightKg}
                                                onChange={e => handleInputChange("weightKg", parseFloat(e.target.value))}
                                                onBlur={() => validateField("weightKg")}
                                                className={errors.weightKg ? "border-red-500" : ""}
                                            />
                                            {errors.weightKg && <p className="text-red-500 text-xs">{errors.weightKg}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Kích thước (cm) - Dài x Rộng x Cao</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <Input
                                                    type="number" placeholder="Dài"
                                                    value={formData.lengthCm}
                                                    onChange={e => handleInputChange("lengthCm", parseFloat(e.target.value))}
                                                    onBlur={() => validateField("lengthCm")}
                                                    className={errors.lengthCm ? "border-red-500" : ""}
                                                />
                                                {errors.lengthCm && <p className="text-red-500 text-xs">{errors.lengthCm}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <Input
                                                    type="number" placeholder="Rộng"
                                                    value={formData.widthCm}
                                                    onChange={e => handleInputChange("widthCm", parseFloat(e.target.value))}
                                                    onBlur={() => validateField("widthCm")}
                                                    className={errors.widthCm ? "border-red-500" : ""}
                                                />
                                                {errors.widthCm && <p className="text-red-500 text-xs">{errors.widthCm}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <Input
                                                    type="number" placeholder="Cao"
                                                    value={formData.heightCm}
                                                    onChange={e => handleInputChange("heightCm", parseFloat(e.target.value))}
                                                    onBlur={() => validateField("heightCm")}
                                                    className={errors.heightCm ? "border-red-500" : ""}
                                                />
                                                {errors.heightCm && <p className="text-red-500 text-xs">{errors.heightCm}</p>}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500">Kích thước dùng để tính trọng lượng quy đổi (D x R x C / 5000)</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Mô tả nội dung</Label>
                                        <Input
                                            value={formData.packageDescription}
                                            onChange={e => handleInputChange("packageDescription", e.target.value)}
                                            onBlur={() => validateField("packageDescription")}
                                            placeholder="VD: Quần áo, sách vở..."
                                            className={errors.packageDescription ? "border-red-500" : ""}
                                        />
                                        {errors.packageDescription && <p className="text-red-500 text-xs">{errors.packageDescription}</p>}
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

                                        {isCalculating && (
                                            <div className="flex items-center justify-center p-4 text-gray-500">
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                <span>Đang tính cước phí...</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            {[
                                                { id: "STANDARD", label: "Chuẩn", desc: "3-4 ngày" },
                                                { id: "EXPRESS", label: "Hỏa tốc", desc: "1-2 ngày" },
                                                { id: "ECONOMY", label: "Tiết kiệm", desc: "5-7 ngày" }
                                            ].map(s => {
                                                // Find estimate for this service if available
                                                const est = calculationResult?.availableServices?.find((x: any) => x.serviceType === s.id);

                                                return (
                                                    <Button
                                                        key={s.id}
                                                        variant="ghost"
                                                        className={`p-3 h-auto rounded-lg border text-left transition-all flex-col items-start ${formData.serviceType === s.id
                                                            ? "border-primary-600 bg-primary-50 ring-1 ring-primary-600"
                                                            : "border-gray-200 hover:border-primary-300"
                                                            }`}
                                                        onClick={() => handleInputChange("serviceType", s.id)}
                                                    >
                                                        <div className="font-medium text-sm text-gray-900">{s.label}</div>
                                                        <div className="text-xs text-gray-500 mb-1">{s.desc}</div>
                                                        {est && (
                                                            <div className="mt-2 pt-2 border-t border-gray-200/50 w-full">
                                                                <div className="text-lg font-bold text-primary-700">{formatCurrency(est.totalAmount)}</div>
                                                                <div className="text-[10px] text-gray-500">Giao: {new Date(est.estimatedDeliveryDate).toLocaleDateString('vi-VN')}</div>
                                                            </div>
                                                        )}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Breakdown of Currently Selected Service */}
                                    {currentPriceDetail && (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-2 animate-in fade-in zoom-in duration-300">
                                            <h4 className="font-semibold text-gray-900 border-b pb-2 mb-2">Chi tiết cước ({currentPriceDetail.serviceName || formData.serviceType})</h4>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Phí cơ bản:</span>
                                                <span className="font-medium">{formatCurrency(currentPriceDetail.baseShippingFee)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Phụ phí trọng lượng:</span>
                                                <span className="font-medium">{formatCurrency(currentPriceDetail.weightSurcharge)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Phụ phí khoảng cách:</span>
                                                <span className="font-medium">{formatCurrency(currentPriceDetail.distanceSurcharge)}</span>
                                            </div>
                                            {currentPriceDetail.insuranceFee > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Bảo hiểm:</span>
                                                    <span className="font-medium">{formatCurrency(currentPriceDetail.insuranceFee)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-2 border-t font-bold text-primary-700 text-base">
                                                <span>Tổng cộng:</span>
                                                <span>{formatCurrency(currentPriceDetail.totalAmount)}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                                        <div className="space-y-2">
                                            <Label>Thu hộ (COD)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={formData.codAmount}
                                                onChange={e => handleInputChange("codAmount", parseFloat(e.target.value))}
                                                onBlur={() => validateField("codAmount")}
                                                className={errors.codAmount ? "border-red-500" : ""}
                                            />
                                            {errors.codAmount && <p className="text-red-500 text-xs">{errors.codAmount}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Giá trị khai giá</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={formData.declaredValue}
                                                onChange={e => handleInputChange("declaredValue", parseFloat(e.target.value))}
                                                onBlur={() => validateField("declaredValue")}
                                                className={errors.declaredValue ? "border-red-500" : ""}
                                            />
                                            {errors.declaredValue && <p className="text-red-500 text-xs">{errors.declaredValue}</p>}
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
                                </div>
                            )}

                            {currentStep === "CONFIRM" && (
                                <div className="space-y-6">
                                    <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                                        <h3 className="text-xl font-bold text-gray-900">Xác nhận đơn hàng</h3>
                                        <p className="text-gray-600">Vui lòng kiểm tra kỹ thông tin trước khi tạo</p>
                                    </div>

                                    {currentPriceDetail && (
                                        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Cước chính:</span>
                                                <span className="font-medium">{formatCurrency(currentPriceDetail.baseShippingFee)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Phụ phí trọng lượng:</span>
                                                <span className="font-medium">{formatCurrency(currentPriceDetail.weightSurcharge)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Phụ phí vùng xa:</span>
                                                <span className="font-medium">{formatCurrency(currentPriceDetail.distanceSurcharge)}</span>
                                            </div>
                                            {currentPriceDetail.insuranceFee > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Phí bảo hiểm:</span>
                                                    <span className="font-medium">{formatCurrency(currentPriceDetail.insuranceFee)}</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-2 flex justify-between font-bold text-lg text-primary-700">
                                                <span>Tổng cước:</span>
                                                <span>{formatCurrency(currentPriceDetail.totalAmount)}</span>
                                            </div>
                                            <div className="text-xs text-right text-gray-500 mt-1">
                                                Thời gian giao dự kiến: {currentPriceDetail.estimatedDeliveryDays} ngày
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

                                {currentPriceDetail && (
                                    <div className="bg-primary-50 p-3 rounded-lg mt-4">
                                        <span className="text-xs text-primary-600 font-semibold uppercase block mb-1">Tổng phí tạm tính</span>
                                        <span className="text-xl font-bold text-primary-700">
                                            {formatCurrency(currentPriceDetail.totalAmount)}
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

            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Tạo đơn hàng thành công
                        </DialogTitle>
                        <DialogDescription>
                            Mã vận đơn: <span className="font-mono font-semibold text-primary-600">{createdOrder?.trackingNumber}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-3 p-6 pt-0">
                        <Button
                            onClick={() => createdOrder && handlePrintReceipt(createdOrder)}
                            className="justify-start gap-2 w-full"
                            variant="outline"
                        >
                            <Receipt className="h-4 w-4" />
                            In hóa đơn khách hàng
                        </Button>

                        <Button
                            onClick={() => createdOrder && handlePrintSticker(createdOrder)}
                            className="justify-start gap-2 w-full"
                            variant="outline"
                        >
                            <Printer className="h-4 w-4" />
                            In tem dán kiện hàng
                        </Button>

                        <div className="flex gap-2 mt-2">
                            <Button
                                onClick={() => {
                                    if (createdOrder) {
                                        handlePrintReceipt(createdOrder);
                                        handlePrintSticker(createdOrder);
                                    }
                                }}
                                className="flex-1"
                            >
                                In cả hai
                            </Button>

                            <Button
                                onClick={() => {
                                    setShowSuccessDialog(false);
                                    navigate(`/orders/${createdOrder?.id}`);
                                }}
                                variant="secondary"
                                className="flex-1"
                            >
                                Đóng & Xem chi tiết
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
