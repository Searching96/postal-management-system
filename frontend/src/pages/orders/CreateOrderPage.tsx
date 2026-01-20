import { useState, useEffect } from "react";
import {
  Truck,
  User,
  CheckCircle2,
  Printer,
  Receipt,
  Loader2,
  Search,
  Phone,
  MapPin,
  Package as PackageIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  FormSelect,
  Separator,
  FormInput,
} from "../../components/ui";
import { toast } from "sonner";
import {
  orderService,
  PriceCalculationResponse,
  Order,
} from "../../services/orderService";
import { formatCurrency } from "../../lib/utils";
import { handlePrintReceipt, handlePrintSticker } from "../../lib/printHelper";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const phoneRegex = /(84|0)+([0-9]{9})\b/;

const createOrderSchema = z.object({
  senderName: z.string().min(1, "Họ tên người gửi là bắt buộc"),
  senderPhone: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .regex(phoneRegex, "Số điện thoại không hợp lệ (VD: 0912345678)"),
  senderAddressLine1: z.string().min(1, "Địa chỉ người gửi là bắt buộc"),
  senderWardCode: z.string().min(1, "Phường/Xã người gửi là bắt buộc"),
  receiverName: z.string().min(1, "Họ tên người nhận là bắt buộc"),
  receiverPhone: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .regex(phoneRegex, "Số điện thoại không hợp lệ (VD: 0912345678)"),
  receiverAddressLine1: z.string().min(1, "Địa chỉ người nhận là bắt buộc"),
  receiverWardCode: z.string().min(1, "Phường/Xã người nhận là bắt buộc"),
  packageType: z.string(),
  packageDescription: z.string().optional(),
  weightKg: z.coerce.number().min(0.01, "Trọng lượng phải lớn hơn 0"),
  lengthCm: z.coerce.number().min(0, "Không được âm"),
  widthCm: z.coerce.number().min(0, "Không được âm"),
  heightCm: z.coerce.number().min(0, "Không được âm"),
  serviceType: z.string(),
  codAmount: z.coerce.number().min(0),
  declaredValue: z.coerce.number().min(0),
  addInsurance: z.boolean(),
});

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

export function CreateOrderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [calculationResult, setCalculationResult] =
    useState<PriceCalculationResponse | null>(null);

  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema) as any,
    defaultValues: {
      senderName: "",
      senderPhone: "",
      senderAddressLine1: "",
      senderWardCode: "00235",
      receiverName: "",
      receiverPhone: "",
      receiverAddressLine1: "",
      receiverWardCode: "",
      packageType: "BOX",
      packageDescription: "",
      weightKg: 0.5,
      lengthCm: 10,
      widthCm: 10,
      heightCm: 10,
      serviceType: "STANDARD",
      codAmount: 0,
      declaredValue: 0,
      addInsurance: false,
    },
  });

  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  // Watch fields for price calculation
  const watchedValues = watch([
    "receiverWardCode",
    "senderWardCode",
    "weightKg",
    "lengthCm",
    "widthCm",
    "heightCm",
    "serviceType",
    "addInsurance",
    "declaredValue",
    "packageType",
  ]);

  const handleSenderPhoneBlur = async () => {
    const phone = getValues("senderPhone");
    const name = getValues("senderName");

    if (!phone || phone.length < 9) return;
    if (name) return; // Already filled

    try {
      const toastId = toast.loading("Đang tìm thông tin khách hàng...");
      const res = await orderService.getOrdersBySenderPhone(phone, {
        page: 0,
        size: 1,
      });
      toast.dismiss(toastId);

      if (res && res.content && res.content.length > 0) {
        const lastOrder = res.content[0];
        setValue("senderName", lastOrder.senderName);
        setValue("senderAddressLine1", lastOrder.senderAddressLine1);
        setValue("senderWardCode", lastOrder.senderWardCode);
        toast.success("Đã tìm thấy thông tin khách hàng!", { duration: 2000 });
      }
    } catch {
      toast.dismiss();
    }
  };

  const calculatePrice = async () => {
    // Get fresh values from form state
    const values = getValues();

    if (!values.receiverWardCode) {
      return;
    }

    setIsCalculating(true);
    try {
      const payload = {
        originWardCode: values.senderWardCode || undefined,
        destinationWardCode: values.receiverWardCode,
        packageType: values.packageType,
        weightKg: Number(values.weightKg) || 0,
        lengthCm: Number(values.lengthCm) || 0,
        widthCm: Number(values.widthCm) || 0,
        heightCm: Number(values.heightCm) || 0,
        serviceType: values.serviceType,
        declaredValue: Number(values.declaredValue) || 0,
        codAmount: Number(values.codAmount) || 0,
        addInsurance: Boolean(values.addInsurance),
        packageDescription: values.packageDescription || undefined,
      };
      const res = await orderService.calculatePrice(payload);
      if (res) setCalculationResult(res);
    } catch (error) {
      // console.error("Price calc error", error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-calculate effect
  useEffect(() => {
    const [wardCode] = watchedValues;
    if (!wardCode) {
      setCalculationResult(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      calculatePrice();
    }, 800);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...watchedValues]);

  const onSubmit = async (data: CreateOrderFormValues) => {
    if (!calculationResult && !isCalculating) {
      await calculatePrice();
    }

    setIsSubmitting(true);
    try {
      const res = await orderService.createOrder(data);
      console.log("API Response:", res); // DEBUG: See full response

      // Backend returns Order directly, not wrapped in ApiResponse
      const orderData = {
        ...(res.data || res), // Handle both ApiResponse<Order> and Order
        lengthCm: data.lengthCm,
        widthCm: data.widthCm,
        heightCm: data.heightCm,
      };

      console.log("Order Data:", orderData); // DEBUG: See processed order
      console.log("Has orderId?", orderData.orderId); // DEBUG: Check orderId

      if (orderData.id || orderData.orderId) {
        setCreatedOrder(orderData);
        setShowSuccessDialog(true);
        toast.success("Tạo vận đơn thành công!");
      } else {
        console.error("Order missing id/orderId", orderData);
        toast.error("Đơn hàng được tạo nhưng thiếu mã định danh");
      }
    } catch (error) {
      console.error("Create order error:", error); // DEBUG: See error details
      toast.error(
        "Tạo đơn thất bại: " + (error as any)?.response?.data?.message ||
          (error as Error)?.message ||
          "Unknown error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get active service Info
  const currentServiceType = watch("serviceType");
  const selectedServiceInfo = calculationResult?.availableServices?.find(
    (s) => s.serviceType === currentServiceType,
  );

  // Merge for display. If selectedServiceInfo exists, use its totalAmount, otherwise use calculationResult default (if matches) or wait for user to select
  // Actually, availableServices has the accurate price for each service.
  // The main calculationResult might show fields, but availableServices is the source of truth for the options.
  const displayTotal = selectedServiceInfo
    ? selectedServiceInfo.totalAmount
    : calculationResult?.totalAmount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Vận Đơn Mới"
        description="Nhập thông tin để tạo đơn hàng mới"
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Input Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sender & Receiver Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5 text-gray-500" />
                  Thông tin Người gửi & Người nhận
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sender */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-500 uppercase flex items-center gap-2">
                    <MapPin size={16} /> Người gửi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Label className="mb-1 block text-sm font-bold text-gray-700 ml-1">
                        Số điện thoại
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          {...register("senderPhone")}
                          onBlur={(e) => {
                            register("senderPhone").onBlur(e);
                            handleSenderPhoneBlur();
                          }}
                          className={`pl-9 ${errors.senderPhone ? "border-red-500" : ""}`}
                          placeholder="VD: 0912345678"
                        />
                        <button
                          onClick={handleSenderPhoneBlur}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600"
                          type="button"
                          title="Tìm thông tin khách hàng cũ"
                        >
                          <Search className="h-4 w-4" />
                        </button>
                      </div>
                      {errors.senderPhone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.senderPhone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <FormInput
                        label="Họ tên"
                        {...register("senderName")}
                        error={errors.senderName?.message}
                        placeholder="Nguyễn Văn A"
                        icon={User}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Controller
                        control={control}
                        name="senderAddressLine1"
                        render={({ field }) => (
                          <AddressSelector
                            label="Địa chỉ gửi"
                            initialValue={field.value}
                            onChange={(addr) => {
                              field.onChange(addr.addressLine1);
                              setValue("senderWardCode", addr.wardCode);
                            }}
                          />
                        )}
                      />
                      {errors.senderAddressLine1 && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.senderAddressLine1.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Receiver */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-500 uppercase flex items-center gap-2">
                    <MapPin size={16} /> Người nhận
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormInput
                        label="Số điện thoại"
                        {...register("receiverPhone")}
                        error={errors.receiverPhone?.message}
                        placeholder="VD: 0912345678"
                        icon={Phone}
                      />
                    </div>
                    <div>
                      <FormInput
                        label="Họ tên"
                        {...register("receiverName")}
                        error={errors.receiverName?.message}
                        placeholder="Trần Thị B"
                        icon={User}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Controller
                        control={control}
                        name="receiverAddressLine1"
                        render={({ field }) => (
                          <AddressSelector
                            label="Địa chỉ nhận"
                            required
                            initialValue={field.value}
                            onChange={(addr) => {
                              field.onChange(addr.addressLine1);
                              setValue("receiverWardCode", addr.wardCode);
                            }}
                          />
                        )}
                      />
                      {errors.receiverAddressLine1 && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.receiverAddressLine1.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <PackageIcon className="h-5 w-5 text-gray-500" />
                  Thông tin Kiện hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Controller
                      control={control}
                      name="packageType"
                      render={({ field }) => (
                        <FormSelect
                          label="Loại hàng"
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { value: "BOX", label: "Hộp/Thùng" },
                            { value: "DOCUMENT", label: "Tài liệu" },
                            { value: "FRAGILE", label: "Dễ vỡ" },
                            { value: "OVERSIZED", label: "Quá khổ" },
                          ]}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <FormInput
                      label="Trọng lượng (kg)"
                      type="number"
                      step="0.1"
                      {...register("weightKg")}
                      error={errors.weightKg?.message}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 ml-1 block mb-1">
                    Kích thước (cm)
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="relative">
                      <Input
                        placeholder="Dài"
                        type="number"
                        className="pr-8 text-center"
                        {...register("lengthCm")}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                        cm
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        placeholder="Rộng"
                        type="number"
                        className="pr-8 text-center"
                        {...register("widthCm")}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                        cm
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        placeholder="Cao"
                        type="number"
                        className="pr-8 text-center"
                        {...register("heightCm")}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                        cm
                      </span>
                    </div>
                  </div>
                  {errors.lengthCm && (
                    <p className="text-red-500 text-xs">
                      {errors.lengthCm.message}
                    </p>
                  )}
                </div>
                <div>
                  <FormInput
                    label="Mô tả nội dung"
                    {...register("packageDescription")}
                    placeholder="Vd: Quần áo, Sách..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Summary Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Services & Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="h-5 w-5 text-gray-500" />
                  Dịch vụ & Tính phí
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">
                    Chọn dịch vụ
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: "STANDARD", label: "Chuẩn" },
                      { id: "EXPRESS", label: "Hỏa tốc" },
                      { id: "ECONOMY", label: "Tiết kiệm" },
                    ].map((s) => {
                      const isActive = currentServiceType === s.id;
                      const serviceInfo =
                        calculationResult?.availableServices?.find(
                          (as) => as.serviceType === s.id,
                        );

                      return (
                        <div
                          key={s.id}
                          onClick={() => setValue("serviceType", s.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${isActive ? "bg-primary-50 border-primary-500 text-primary-900 ring-1 ring-primary-500" : "hover:bg-gray-50"}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">
                              {s.label}
                            </span>
                            {isActive && (
                              <CheckCircle2 className="h-4 w-4 text-primary-600" />
                            )}
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="text-xs text-gray-500">
                              {serviceInfo
                                ? serviceInfo.slaDescription ||
                                  `${serviceInfo.estimatedDeliveryDays} ngày`
                                : "--"}
                            </span>
                            <span className="font-bold text-sm">
                              {serviceInfo
                                ? formatCurrency(serviceInfo.totalAmount)
                                : "---"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {errors.serviceType && (
                    <p className="text-red-500 text-xs">
                      {errors.serviceType.message}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <FormInput
                      label="Thu hộ (COD)"
                      type="number"
                      {...register("codAmount")}
                      suffix={
                        <span className="text-gray-500 text-xs">VNĐ</span>
                      }
                    />
                  </div>
                  <div>
                    <FormInput
                      label="Khai giá"
                      type="number"
                      {...register("declaredValue")}
                      suffix={
                        <span className="text-gray-500 text-xs">VNĐ</span>
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Controller
                      control={control}
                      name="addInsurance"
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="ins"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      )}
                    />
                    <label
                      htmlFor="ins"
                      className="text-sm text-gray-700 cursor-pointer select-none"
                    >
                      Bảo hiểm hàng hóa
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total & Action */}
            <Card className="bg-slate-900 text-white border-slate-900 shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">
                    Tổng cước phí tạm tính
                  </p>
                  {isCalculating ? (
                    <div className="h-8 w-24 bg-slate-800 animate-pulse rounded mt-1" />
                  ) : (
                    <p className="text-3xl font-bold">
                      {displayTotal ? formatCurrency(displayTotal) : "---"}
                    </p>
                  )}
                </div>

                {selectedServiceInfo && calculationResult && (
                  <div className="space-y-1 text-xs text-slate-400 border-t border-slate-700/50 pt-2">
                    <div className="flex justify-between">
                      <span>Cước chính:</span>
                      <span>
                        {formatCurrency(calculationResult.baseShippingFee)}
                      </span>
                    </div>
                    {(calculationResult.insuranceFee > 0 ||
                      getValues("addInsurance")) && (
                      <div className="flex justify-between text-yellow-500">
                        <span>Phí bảo hiểm:</span>
                        <span>
                          {formatCurrency(calculationResult.insuranceFee)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Phụ phí:</span>
                      <span>
                        {formatCurrency(
                          (calculationResult.weightSurcharge || 0) +
                            (calculationResult.distanceSurcharge || 0),
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-12 text-lg shadow-lg shadow-green-900/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                  )}
                  Tạo Vận Đơn
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" /> Tạo thành công
            </DialogTitle>
            <DialogDescription>
              Mã vận đơn:{" "}
              <span className="font-bold text-black text-lg">
                {createdOrder?.trackingNumber}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => createdOrder && handlePrintReceipt(createdOrder)}
              >
                <Receipt className="mr-2 h-4 w-4" /> In Hóa Đơn
              </Button>
              <Button
                variant="primary"
                onClick={() => createdOrder && handlePrintSticker(createdOrder)}
              >
                <Printer className="mr-2 h-4 w-4" /> In Tem Dán
              </Button>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setShowSuccessDialog(false);
                setCreatedOrder(null);
                form.reset({
                  senderName: getValues("senderName"),
                  senderPhone: getValues("senderPhone"),
                  senderAddressLine1: getValues("senderAddressLine1"),
                  senderWardCode: getValues("senderWardCode"),
                  receiverName: "",
                  receiverPhone: "",
                  receiverAddressLine1: "",
                  receiverWardCode: "",
                  packageType: "BOX",
                  packageDescription: "",
                  weightKg: 0.5,
                  lengthCm: 10,
                  widthCm: 10,
                  heightCm: 10,
                  serviceType: "STANDARD",
                  codAmount: 0,
                  declaredValue: 0,
                  addInsurance: false,
                });
              }}
            >
              Đóng & Tạo đơn mới
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
