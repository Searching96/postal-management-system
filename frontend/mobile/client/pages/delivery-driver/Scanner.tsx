import DriverShell from "@/components/DriverShell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Scan,
  MapPin,
  Clock,
  CheckCircle,
  ImageIcon,
} from "lucide-react";
import { useState } from "react";

type OrderType = "pickup" | "delivery" | "failed" | null;

interface ScanResult {
  orderNumber: string;
  type: OrderType;
  customerName: string;
  address: string;
}

export function Scanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [notes, setNotes] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [confirmationImage, setConfirmationImage] = useState<string | null>(
    null,
  );
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  const mockCameraScan = async () => {
    setIsScanning(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock different order types based on random selection
    const types: OrderType[] = ["pickup", "delivery", "failed"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const orderNumber = `${randomType.toUpperCase().substring(0, 2)}${Math.random().toString().slice(2, 11)}VN`;

    const mockResult: ScanResult = {
      orderNumber,
      type: randomType,
      customerName: "Nguyễn Văn B",
      address: "123 Nguyễn Huệ, Q1, TP.HCM",
    };

    setScanResult(mockResult);
    setIsScanning(false);
  };

  const mockTakePhoto = async () => {
    setIsTakingPhoto(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Mock photo data URL
    const mockImageData = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=`;
    setConfirmationImage(mockImageData);
    setIsTakingPhoto(false);
  };

  const handleConfirm = () => {
    if (!confirmationImage) {
      alert("Vui lòng chụp ảnh xác nhận trước khi hoàn tất!");
      return;
    }

    const operation =
      scanResult?.type === "pickup"
        ? "lấy hàng"
        : scanResult?.type === "delivery"
          ? "giao hàng"
          : "báo cáo thất bại";
    alert(`Đã xác nhận ${operation} cho đơn ${scanResult?.orderNumber}`);

    // Reset form
    setScanResult(null);
    setNotes("");
    setFailureReason("");
    setConfirmationImage(null);
  };

  const getOperationTitle = () => {
    switch (scanResult?.type) {
      case "pickup":
        return "Xác nhận đã lấy hàng";
      case "delivery":
        return "Xác nhận giao thành công";
      case "failed":
        return "Báo cáo giao thất bại";
      default:
        return "QR Scanner";
    }
  };

  const getOperationIcon = () => {
    switch (scanResult?.type) {
      case "pickup":
        return <Scan className="h-5 w-5 text-blue-500" />;
      case "delivery":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <Clock className="h-5 w-5 text-red-500" />;
      default:
        return <Camera className="h-5 w-5" />;
    }
  };

  return (
    <DriverShell
      title={getOperationTitle()}
      userName="Nguyễn Văn A"
      role="Bưu tá"
    >
      <div className="space-y-4">
        {!scanResult ? (
          // Scanner Interface
          <div className="text-center space-y-4">
            <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg border-2 border-dashed flex items-center justify-center">
              {isScanning ? (
                <div className="text-center space-y-2">
                  <Scan className="h-12 w-12 mx-auto animate-pulse text-blue-500" />
                  <p className="text-sm text-muted-foreground">
                    Đang quét mã...
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Camera className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-sm text-muted-foreground">
                    Nhấn để quét QR
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={mockCameraScan}
              disabled={isScanning}
              className="w-full"
              size="lg"
            >
              {isScanning ? "Đang quét..." : "Quét mã QR"}
            </Button>

            <p className="text-xs text-muted-foreground">
              Hệ thống sẽ tự động nhận diện loại đơn hàng
            </p>
          </div>
        ) : (
          // Operation Form
          <div className="space-y-4">
            {/* Scan Result */}
            <div className="p-3 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                {getOperationIcon()}
                <span className="font-medium">{scanResult.orderNumber}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {scanResult.customerName}
              </p>
              <p className="text-xs text-muted-foreground">
                {scanResult.address}
              </p>
            </div>

            {/* Confirmation Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ảnh xác nhận *</label>
              {!confirmationImage ? (
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {isTakingPhoto ? (
                    <div className="space-y-2">
                      <Camera className="h-8 w-8 mx-auto animate-pulse text-blue-500" />
                      <p className="text-sm text-muted-foreground">
                        Đang chụp ảnh...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="text-sm text-muted-foreground">
                        Chụp ảnh xác nhận giao hàng
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={mockTakePhoto}
                        disabled={isTakingPhoto}
                      >
                        Chụp ảnh
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative bg-gray-100 rounded-lg p-4 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="text-sm text-green-600">
                      Đã chụp ảnh xác nhận
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmationImage(null)}
                    className="w-full"
                  >
                    Chụp lại
                  </Button>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <form className="space-y-3">
              {scanResult.type === "failed" && (
                <div>
                  <label className="text-sm font-medium">Lý do thất bại</label>
                  <Select
                    value={failureReason}
                    onValueChange={setFailureReason}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Chọn lý do" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reschedule">Khách hẹn lại</SelectItem>
                      <SelectItem value="no-contact">
                        Không liên lạc được
                      </SelectItem>
                      <SelectItem value="wrong-address">Sai địa chỉ</SelectItem>
                      <SelectItem value="refused">
                        Khách từ chối nhận
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Ghi chú</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 h-20"
                  placeholder="Thêm ghi chú..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScanResult(null)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                {scanResult.type === "delivery" && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setScanResult({ ...scanResult, type: "failed" });
                      setConfirmationImage(null); // Clear image as it's for success
                    }}
                    className="flex-1"
                  >
                    Giao thất bại
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!confirmationImage}
                  className="flex-1"
                >
                  Xác nhận
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DriverShell>
  );
}
