import CustomerShell from "@/components/CustomerShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Package,
  User,
  Phone,
  MapPin,
  Calendar,
  Check,
  ChevronsUpDown,
  Camera,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { fetchCustomerInfo } from "@/services/mockApi";

interface PackageData {
  orderNumber: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string; // Added senderEmail
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: string;
  service: string;
  cod: string;
  pickupTime: string;
  deliverTime: string;
  channel: string;
}

interface ComplaintFormState {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  trackingNumber: string;
  complaintType: string;
  detail: string;
  channel: string;
  claimAmount: string;
}

// Mock list of tracking numbers for autocomplete
const mockTrackingNumbers = [
  "VN123456789VN",
  "VN987654321VN",
  "VN555666777VN",
  "VN111222333VN",
  "VN444555666VN",
];

// Mock function to fetch package data by tracking number
const fetchPackageData = async (
  trackingNumber: string,
): Promise<PackageData | null> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (trackingNumber.startsWith("VN")) {
    return {
      orderNumber: trackingNumber,
      senderName: "Nguyễn Văn A",
      senderPhone: "0901234567",
      senderEmail: "nguyenvana@example.com", // Added senderEmail
      senderAddress: "123 Nguyễn Huệ, Q1, TP.HCM",
      receiverName: "Trần Thị B",
      receiverPhone: "0907654321",
      receiverAddress: "456 Lê Lợi, Q3, TP.HCM",
      weight: "2.5",
      service: "express",
      cod: "250000",
      pickupTime: "2024-01-15T09:00",
      deliverTime: "2024-01-16T14:00",
      channel: "App",
    };
  }
  return null;
};

const formatService = (service: string) => {
  const serviceMap: Record<string, string> = {
    express: "Hỏa tốc",
    fast: "Nhanh",
    economy: "Tiết kiệm",
  };
  return serviceMap[service] || service;
};

const formatCurrency = (amount: string) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount));
};

const formatDateTime = (datetime: string) => {
  if (!datetime) return "";
  return new Date(datetime).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ComplaintCreate() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [packageNotFound, setPackageNotFound] = useState(false);
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [trackingError, setTrackingError] = useState("");
  const [open, setOpen] = useState(false);

  const initialFormData: ComplaintFormState = {
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    trackingNumber: "",
    complaintType: "late",
    detail: "",
    channel: "",
    claimAmount: "",
  };

  const [formData, setFormData] = useState<ComplaintFormState>(initialFormData);

  const [files, setFiles] = useState<File[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      // Reset input value to allow re-selection of the same file if needed
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerGallery = () => {
    galleryInputRef.current?.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  // Autofill contact info from logged-in user
  useEffect(() => {
    fetchCustomerInfo().then((data) => {
      setFormData((prev) => ({
        ...prev,
        customerName: data.name,
        customerPhone: data.phone,
        customerEmail: data.email,
      }));
    });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTrackingNumberChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      trackingNumber: value,
    }));
    if (value.trim()) {
      setTrackingError("");
    }
  };

  const fetchAndLoadPackageData = async (trackingNumber: string) => {
    if (!trackingNumber.trim()) {
      setPackageData(null);
      setPackageNotFound(false);
      return;
    }

    try {
      setLoading(true);
      setPackageNotFound(false);
      const data = await fetchPackageData(trackingNumber);

      if (data) {
        setPackageData(data);
        // Removed contact info autofill from package data
        setFormData((prev) => ({
          ...prev,
          channel: data.channel,
        }));
      } else {
        setPackageNotFound(true);
        setPackageData(null);
      }
    } catch (error) {
      console.error("Failed to fetch package data:", error);
      setPackageNotFound(true);
      setPackageData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackingNumberBlur = () => {
    fetchAndLoadPackageData(formData.trackingNumber);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.trackingNumber.trim()) {
      setTrackingError("Vui lòng nhập mã vận đơn");
      return;
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData(initialFormData);
    setFiles([]);
    setPackageData(null);
    setPackageNotFound(false);
    // Re-fetch customer info to autofill again
    fetchCustomerInfo().then((data) => {
      setFormData((prev) => ({
        ...prev,
        customerName: data.name,
        customerPhone: data.phone,
        customerEmail: data.email,
      }));
    });
  };

  if (submitted) {
    const complaintTypeLabel =
      {
        late: "Giao chậm",
        lost: "Mất hàng",
        damage: "Hư hỏng",
        cod: "Sai COD",
        other: "Khác",
      }[formData.complaintType] || formData.complaintType;

    return (
      <CustomerShell
        title="Gửi khiếu nại"
        userName="Nguyễn Văn A"
        role="Khách hàng"
      >
        <div className="space-y-6">
          <div className="rounded-lg border bg-green-50 p-6 text-center text-green-700">
            <h2 className="text-xl font-semibold mb-2">
              Gửi khiếu nại thành công!
            </h2>
            <p>
              Chúng tôi đã tiếp nhận phản hồi của bạn và sẽ xử lý trong thời
              gian sớm nhất.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin khiếu nại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-muted-foreground text-xs uppercase mb-1">
                    Người gửi
                  </p>
                  <p className="font-medium">{formData.customerName}</p>
                  <p>{formData.customerPhone}</p>
                  <p>{formData.customerEmail}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground text-xs uppercase mb-1">
                    Đơn hàng
                  </p>
                  <p className="font-medium text-blue-600">
                    {formData.trackingNumber}
                  </p>
                  {packageData && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Người nhận: {packageData.receiverName}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-muted-foreground text-xs uppercase mb-1">
                      Loại khiếu nại
                    </p>
                    <p className="font-medium">{complaintTypeLabel}</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-muted-foreground text-xs uppercase mb-1">
                    Chi tiết
                  </p>
                  <p className="whitespace-pre-wrap">
                    {formData.detail || "Không có mô tả chi tiết."}
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="border-t pt-4">
                  <p className="font-semibold text-muted-foreground text-xs uppercase mb-2">
                    Hình ảnh đính kèm
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {files.map((file, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Evidence ${index}`}
                          className="h-full w-full rounded-md object-cover border"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button className="w-full h-12 rounded-xl" onClick={handleReset}>
            Tạo khiếu nại mới
          </Button>
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell
      title="Gửi khiếu nại"
      userName="Nguyễn Văn A"
      role="Khách hàng"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin liên lạc</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="customerName">Họ và tên</Label>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Số điện thoại</Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                required
                title="Vui lòng nhập đúng định dạng số điện thoại!"
                pattern="^(0|\+?84)[0-9]{8,10}$"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đơn hàng liên quan</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label>Mã vận đơn</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                    type="button"
                  >
                    {formData.trackingNumber || "Chọn hoặc nhập mã vận đơn..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Tìm kiếm hoặc nhập mã..."
                      value={formData.trackingNumber}
                      onValueChange={handleTrackingNumberChange}
                      onBlur={handleTrackingNumberBlur}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <div className="py-2 text-center text-sm">
                          {formData.trackingNumber ? (
                            <div>
                              <p className="text-muted-foreground mb-4 px-4">
                                Không tìm thấy trong danh sách
                              </p>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setOpen(false);
                                  fetchAndLoadPackageData(
                                    formData.trackingNumber,
                                  );
                                }}
                                type="button"
                              >
                                Sử dụng "{formData.trackingNumber}"
                              </Button>
                            </div>
                          ) : (
                            "Nhập mã vận đơn..."
                          )}
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {mockTrackingNumbers
                          .filter((number) =>
                            number
                              .toLowerCase()
                              .includes(formData.trackingNumber.toLowerCase()),
                          )
                          .map((number) => (
                            <CommandItem
                              key={number}
                              value={number}
                              onSelect={(currentValue) => {
                                const upperValue = currentValue.toUpperCase();
                                handleTrackingNumberChange(upperValue);
                                setOpen(false);
                                // Call fetch directly with the selected value
                                fetchAndLoadPackageData(upperValue);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.trackingNumber === number
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {number}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {loading && (
                <p className="text-xs text-blue-600">
                  Đang tải thông tin đơn hàng...
                </p>
              )}
              {packageNotFound && (
                <p className="text-xs text-red-600">
                  Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã vận đơn.
                </p>
              )}
              {trackingError && (
                <p className="text-xs text-red-600">{trackingError}</p>
              )}
            </div>

            {/* Display-Only Package Information */}
            {packageData && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-800 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Thông tin đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {/* Receiver Info */}
                  <div className="space-y-2">
                    <p className="font-semibold text-green-900 text-xs uppercase">
                      Người nhận
                    </p>
                    <div className="space-y-1.5 bg-white/50 rounded p-2">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-green-700" />
                        <span>{packageData.receiverName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-green-700" />
                        <span>{packageData.receiverPhone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-green-700 mt-0.5" />
                        <span className="flex-1">
                          {packageData.receiverAddress}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="space-y-2">
                    <p className="font-semibold text-green-900 text-xs uppercase">
                      Chi tiết
                    </p>
                    <div className="grid grid-cols-2 gap-2 bg-white/50 rounded p-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Khối lượng
                        </p>
                        <p className="font-medium">{packageData.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Dịch vụ</p>
                        <p className="font-medium">
                          {formatService(packageData.service)}
                        </p>
                      </div>
                      {Number(packageData.cod) > 0 && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground">COD</p>
                          <p className="font-medium text-amber-700">
                            {formatCurrency(packageData.cod)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  {/* {(packageData.pickupTime || packageData.deliverTime) && (
                    <div className="space-y-2">
                      <p className="font-semibold text-green-900 text-xs uppercase flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Thời gian
                      </p>
                      <div className="space-y-1.5 bg-white/50 rounded p-2">
                        {packageData.pickupTime && (
                          <div>
                            <p className="text-xs text-muted-foreground">Lấy hàng</p>
                            <p className="font-medium">{formatDateTime(packageData.pickupTime)}</p>
                          </div>
                        )}
                        {packageData.deliverTime && (
                          <div>
                            <p className="text-xs text-muted-foreground">Giao hàng dự kiến</p>
                            <p className="font-medium">{formatDateTime(packageData.deliverTime)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )} */}
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="complaintType">Loại khiếu nại</Label>
              <Select
                value={formData.complaintType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, complaintType: value }))
                }
              >
                <SelectTrigger id="complaintType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="late">Giao chậm</SelectItem>
                  <SelectItem value="lost">Mất hàng</SelectItem>
                  <SelectItem value="damage">Hư hỏng</SelectItem>
                  <SelectItem value="cod">Sai COD</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail">Mô tả chi tiết</Label>
              <Textarea
                id="detail"
                name="detail"
                value={formData.detail}
                onChange={handleInputChange}
                rows={4}
                placeholder="Mô tả vấn đề gặp phải..."
              />
            </div>

            <div className="space-y-2">
              <Label>Hình ảnh minh chứng</Label>
              <div className="grid grid-cols-4 gap-2">
                {files.map((file, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="h-full w-full rounded-md object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Upload Button - Gallery */}
                <div
                  onClick={triggerGallery}
                  className="aspect-square cursor-pointer flex flex-col items-center justify-center rounded-md border border-dashed border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <ImageIcon className="h-6 w-6 mb-1 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    Thư viện
                  </span>
                </div>

                {/* Upload Button - Camera */}
                <div
                  onClick={triggerCamera}
                  className="aspect-square cursor-pointer flex flex-col items-center justify-center rounded-md border border-dashed border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <Camera className="h-6 w-6 mb-1 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    Chụp ảnh
                  </span>
                </div>
              </div>

              {/* Hidden Inputs */}
              <input
                type="file"
                ref={galleryInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              <input
                type="file"
                ref={cameraInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="claimAmount">
                Số tiền bồi thường mong muốn (₫)
              </Label>
              <Input
                id="claimAmount"
                name="claimAmount"
                type="number"
                min={0}
                value={formData.claimAmount}
                onChange={handleInputChange}
              />
            </div> */}
          </CardContent>
        </Card>

        <Button
          className="w-full h-12 rounded-xl"
          disabled={loading}
          type="submit"
        >
          {loading ? "Đang tải..." : "Gửi khiếu nại"}
        </Button>

        {submitted && (
          <div className="rounded-lg border bg-amber-50 p-3 text-sm text-amber-700">
            Khiếu nại đã được tiếp nhận. Chúng tôi sẽ phản hồi trong thời gian
            sớm nhất.
          </div>
        )}
      </form>
    </CustomerShell>
  );
}
