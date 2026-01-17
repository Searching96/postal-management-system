import { useState, useEffect } from "react";
import {
    Card,
    Button,
    PageHeader,
    LoadingSpinner,
    FormInput,
    FormSelect,
    AddressSelector
} from "../../components/ui";
import {
    Truck,
    MapPin,
    User,
    Package
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { administrativeService } from "../../services/administrativeService";
import { OfficeResponse, ApiResponse } from "../../models";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";

export const CustomerPickupPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [senderName, setSenderName] = useState(user?.fullName || "");
    const [senderPhone, setSenderPhone] = useState(user?.phoneNumber || "");
    const [pickupAddress, setPickupAddress] = useState("");
    const [pickupProvinceCode, setPickupProvinceCode] = useState("");

    const [receiverName, setReceiverName] = useState("");
    const [receiverPhone, setReceiverPhone] = useState("");
    const [receiverAddress, setReceiverAddress] = useState(""); // Full address string
    const [destinationWardCode, setDestinationWardCode] = useState(""); // For shipping calculation

    const [packageType, setPackageType] = useState("DOCUMENT");
    const [weight, setWeight] = useState("");
    const [description, setDescription] = useState("");

    const [serviceType, setServiceType] = useState("STANDARD");
    const [codAmount, setCodAmount] = useState("");

    const [originOfficeId, setOriginOfficeId] = useState("");
    const [offices, setOffices] = useState<OfficeResponse[]>([]);
    const [isLoadingOffices, setIsLoadingOffices] = useState(false);

    // Load offices when pickup province changes
    useEffect(() => {
        if (pickupProvinceCode) {
            loadOffices(pickupProvinceCode);
        } else {
            setOffices([]);
            setOriginOfficeId("");
        }
    }, [pickupProvinceCode]);

    const loadOffices = async (provinceCode: string) => {
        setIsLoadingOffices(true);
        try {
            const response = await administrativeService.getPostOfficesByProvince(provinceCode);
            if (response.success && response.data) {
                setOffices(response.data);
            }
        } catch (error) {
            console.error("Failed to load offices:", error);
            toast.error("Không thể tải danh sách bưu cục");
        } finally {
            setIsLoadingOffices(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!pickupAddress || !originOfficeId || !destinationWardCode) {
            toast.error("Vui lòng điền đầy đủ thông tin địa chỉ và bưu cục");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: any = {
                originOfficeId,
                pickupAddress,
                senderName,
                senderPhone,
                receiverName,
                receiverPhone,
                receiverAddress,
                destinationWardCode,
                packageType,
                weightKg: parseFloat(weight),
                description,
                serviceType,
                codAmount: codAmount ? parseFloat(codAmount) : 0,
                // deliveryInstructions
            };

            await orderService.createCustomerPickupOrder(payload);
            toast.success("Tạo yêu cầu lấy hàng thành công!");
            navigate("/orders"); // Or track page
        } catch (error) {
            console.error("Create order failed:", error);
            toast.error("Tạo đơn hàng thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Tạo Yêu Cầu Gửi Hàng"
                description="Tạo đơn hàng online và shipper sẽ đến lấy hàng tận nơi"
            />

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sender & Pickup Info */}
                <Card className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <MapPin className="text-primary" size={20} />
                        Thông tin lấy hàng
                    </h3>

                    <FormInput
                        label="Họ tên người gửi"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        required
                        disabled // Use account info
                    />
                    <FormInput
                        label="Số điện thoại"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        required
                        disabled // Use account info
                    />

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Địa chỉ lấy hàng *</label>
                        <AddressSelector
                            label=""
                            onAddressChange={setPickupAddress}
                            onProvinceChange={setPickupProvinceCode}
                            onWardChange={(wardCode) => {
                                // Auto-select office when ward changes
                                if (wardCode) {
                                    setIsLoadingOffices(true);
                                    administrativeService.getOfficeByWardCode(wardCode)
                                        .then((res: ApiResponse<OfficeResponse>) => {
                                            if (res.success && res.data) {
                                                setOriginOfficeId(res.data.officeId);
                                                // Also make sure this office is in the list
                                                setOffices(prev => {
                                                    const exists = prev.some(o => o.officeId === res.data.officeId);
                                                    return exists ? prev : [...prev, res.data];
                                                });
                                            } else {
                                                setOriginOfficeId("");
                                                if (res.success === false) {
                                                    toast.error("Không có bưu cục nào được phân công cho phường/xã này");
                                                }
                                            }
                                        })
                                        .catch(() => {
                                            setOriginOfficeId("");
                                            // Silent fail or toast error
                                        })
                                        .finally(() => setIsLoadingOffices(false));
                                } else {
                                    setOriginOfficeId("");
                                }
                            }}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Bưu cục gửi *</label>
                        {isLoadingOffices ? (
                            <div className="text-sm text-gray-500 flex items-center gap-2 py-2">
                                <LoadingSpinner size="sm" /> Đang tải danh sách bưu cục...
                            </div>
                        ) : (
                            <FormSelect
                                label=""
                                value={originOfficeId}
                                onChange={(val) => setOriginOfficeId(val as string)}
                                options={[
                                    { value: "", label: "-- Chọn Bưu Cục trong Tỉnh/TP --" },
                                    ...offices.map(office => ({
                                        value: office.officeId,
                                        label: `${office.officeName} - ${office.officeAddress}`
                                    }))
                                ]}
                                disabled={!pickupProvinceCode || offices.length === 0}
                                error={!originOfficeId && pickupProvinceCode ? "Vui lòng chọn bưu cục" : ""}
                            />
                        )}
                        {!pickupProvinceCode && (
                            <p className="text-xs text-gray-500">Vui lòng chọn Tỉnh/Thành phố trước</p>
                        )}
                    </div>
                </Card>

                {/* Receiver Info */}
                <Card className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <User className="text-primary" size={20} />
                        Người nhận
                    </h3>

                    <FormInput
                        label="Họ tên người nhận"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        required
                        placeholder="Nhập tên người nhận"
                    />
                    <FormInput
                        label="Số điện thoại người nhận"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        required
                        placeholder="Nhập SĐT người nhận"
                    />

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Địa chỉ người nhận *</label>
                        <AddressSelector
                            label=""
                            onAddressChange={setReceiverAddress}
                            onWardChange={setDestinationWardCode}
                            required
                        />
                    </div>
                </Card>

                {/* Package Info */}
                <Card className="p-6 space-y-4 lg:col-span-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Package className="text-primary" size={20} />
                        Thông tin kiện hàng
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormSelect
                            label="Loại hàng hóa"
                            value={packageType}
                            onChange={(val) => setPackageType(val as string)}
                            options={[
                                { value: "DOCUMENT", label: "Tài liệu" },
                                { value: "GOODS", label: "Hàng hóa" }
                            ]}
                        />
                        <FormInput
                            label="Trọng lượng (kg)"
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            required
                            min={0.1}
                            step={0.1}
                        />
                        <FormInput
                            label="Mô tả hàng hóa"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="VD: Quần áo, sách vở..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSelect
                            label="Dịch vụ chuyển phát"
                            value={serviceType}
                            onChange={(val) => setServiceType(val as string)}
                            options={[
                                { value: "EXPRESS", label: "Hỏa tốc (Express)" },
                                { value: "STANDARD", label: "Chuyển phát nhanh (Standard)" },
                                { value: "ECONOMY", label: "Tiết kiệm (Economy)" }
                            ]}
                        />
                        <FormInput
                            label="Thu hộ (COD) (VNĐ)"
                            type="number"
                            value={codAmount}
                            onChange={(e) => setCodAmount(e.target.value)}
                            min={0}
                            placeholder="0"
                        />
                    </div>
                </Card>

                <div className="lg:col-span-2 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" /> Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Truck size={18} className="mr-2" /> Tạo Yêu Cầu
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};
