import PostalWorkerShell from "@/components/PostalWorkerShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Printer, QrCode, Weight, MapPin, User, Phone, Calculator, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PackageData {
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: string;
  dimensions: string;
  codAmount: string;
  packageType: string;
  notes: string;
}

export default function PackageIngest() {
  const { toast } = useToast();
  const [packageData, setPackageData] = useState<PackageData>({
    trackingNumber: '',
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    weight: '',
    dimensions: '',
    codAmount: '',
    packageType: '',
    notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [ingestedPackages, setIngestedPackages] = useState<PackageData[]>([]);

  const generateTrackingNumber = () => {
    const prefix = "VNP";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const handleInputChange = (field: keyof PackageData, value: string) => {
    setPackageData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['senderName', 'senderPhone', 'senderAddress', 'receiverName', 'receiverPhone', 'receiverAddress', 'weight', 'packageType'];
    return required.every(field => packageData[field as keyof PackageData].trim() !== '');
  };

  const handleIngestPackage = async () => {
    if (!validateForm()) {
      toast({
        title: "Lỗi nhập liệu",
        description: "Vui lòng điền đầy đủ các thông tin bắt buộc",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const trackingNumber = generateTrackingNumber();
    const newPackage = { ...packageData, trackingNumber };
    
    setIngestedPackages(prev => [newPackage, ...prev]);
    setPackageData({
      trackingNumber: '',
      senderName: '',
      senderPhone: '',
      senderAddress: '',
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      weight: '',
      dimensions: '',
      codAmount: '',
      packageType: '',
      notes: ''
    });

    setIsProcessing(false);
    
    toast({
      title: "Thành công",
      description: `Kiện hàng đã được nhận với mã ${trackingNumber}`,
      variant: "default"
    });
  };

  const handlePrintSticker = (pkg: PackageData) => {
    // In a real app, this would interface with a physical printer
    const stickerContent = generateStickerContent(pkg);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(stickerContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }

    toast({
      title: "In tem giao hàng",
      description: `Tem cho kiện ${pkg.trackingNumber} đã được gửi đến máy in`,
      variant: "default"
    });
  };

  const generateStickerContent = (pkg: PackageData) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tem Giao Hàng - ${pkg.trackingNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            font-size: 12px; 
            margin: 0; 
            padding: 20px;
            background: white;
          }
          .sticker {
            width: 100mm;
            height: 150mm;
            border: 2px solid #000;
            padding: 8px;
            box-sizing: border-box;
          }
          .header {
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
          }
          .tracking {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
          }
          .section {
            margin: 8px 0;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }
          .label { font-weight: bold; }
          .barcode {
            text-align: center;
            font-family: 'Courier New', monospace;
            font-size: 24px;
            margin: 10px 0;
            letter-spacing: 2px;
          }
          @media print {
            body { margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="sticker">
          <div class="header">VIETNAM POST</div>
          <div class="tracking">${pkg.trackingNumber}</div>
          <div class="barcode">||||| ||||| |||||</div>
          
          <div class="section">
            <div class="label">Người gửi:</div>
            <div>${pkg.senderName}</div>
            <div>${pkg.senderPhone}</div>
            <div>${pkg.senderAddress}</div>
          </div>
          
          <div class="section">
            <div class="label">Người nhận:</div>
            <div>${pkg.receiverName}</div>
            <div>${pkg.receiverPhone}</div>
            <div>${pkg.receiverAddress}</div>
          </div>
          
          <div class="section">
            <div class="label">Thông tin kiện hàng:</div>
            <div>Loại: ${pkg.packageType}</div>
            <div>Trọng lượng: ${pkg.weight}kg</div>
            ${pkg.dimensions ? `<div>Kích thước: ${pkg.dimensions}</div>` : ''}
            ${pkg.codAmount ? `<div>COD: ${parseInt(pkg.codAmount).toLocaleString('vi-VN')}₫</div>` : ''}
          </div>
          
          ${pkg.notes ? `
          <div class="section">
            <div class="label">Ghi chú:</div>
            <div>${pkg.notes}</div>
          </div>
          ` : ''}
          
          <div style="margin-top: auto; text-align: center; font-size: 10px;">
            Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <PostalWorkerShell title="Nhận Kiện Hàng" userName="Nguyễn Thị E" role="Nhân viên bưu điện">
      <div className="space-y-6">
        {/* Package Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Nhập Thông Tin Kiện Hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sender Info */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Thông tin người gửi
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="senderName">Họ tên *</Label>
                  <Input
                    id="senderName"
                    value={packageData.senderName}
                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                    placeholder="Nhập họ tên người gửi"
                  />
                </div>
                <div>
                  <Label htmlFor="senderPhone">Số điện thoại *</Label>
                  <Input
                    id="senderPhone"
                    value={packageData.senderPhone}
                    onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <Label htmlFor="senderAddress">Địa chỉ *</Label>
                  <Textarea
                    id="senderAddress"
                    value={packageData.senderAddress}
                    onChange={(e) => handleInputChange('senderAddress', e.target.value)}
                    placeholder="Nhập địa chỉ người gửi"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Receiver Info */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Thông tin người nhận
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="receiverName">Họ tên *</Label>
                  <Input
                    id="receiverName"
                    value={packageData.receiverName}
                    onChange={(e) => handleInputChange('receiverName', e.target.value)}
                    placeholder="Nhập họ tên người nhận"
                  />
                </div>
                <div>
                  <Label htmlFor="receiverPhone">Số điện thoại *</Label>
                  <Input
                    id="receiverPhone"
                    value={packageData.receiverPhone}
                    onChange={(e) => handleInputChange('receiverPhone', e.target.value)}
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <Label htmlFor="receiverAddress">Địa chỉ *</Label>
                  <Textarea
                    id="receiverAddress"
                    value={packageData.receiverAddress}
                    onChange={(e) => handleInputChange('receiverAddress', e.target.value)}
                    placeholder="Nhập địa chỉ người nhận"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Package Details */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Thông tin kiện hàng
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="packageType">Loại kiện hàng *</Label>
                  <Select value={packageData.packageType} onValueChange={(value) => handleInputChange('packageType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Thường</SelectItem>
                      <SelectItem value="fragile">Dễ vỡ</SelectItem>
                      <SelectItem value="valuable">Có giá trị</SelectItem>
                      <SelectItem value="express">Nhanh</SelectItem>
                      <SelectItem value="cold">Lạnh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight">Trọng lượng (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={packageData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="0.5"
                  />
                </div>
                <div>
                  <Label htmlFor="dimensions">Kích thước (cm)</Label>
                  <Input
                    id="dimensions"
                    value={packageData.dimensions}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    placeholder="20x15x10"
                  />
                </div>
                <div>
                  <Label htmlFor="codAmount">COD (₫)</Label>
                  <Input
                    id="codAmount"
                    type="number"
                    value={packageData.codAmount}
                    onChange={(e) => handleInputChange('codAmount', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={packageData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Ghi chú đặc biệt về kiện hàng"
                  rows={2}
                />
              </div>
            </div>

            <Button 
              onClick={handleIngestPackage}
              disabled={isProcessing || !validateForm()}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                "Đang xử lý..."
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Nhận Kiện Hàng
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recently Ingested Packages */}
        {ingestedPackages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Kiện Hàng Vừa Nhận ({ingestedPackages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ingestedPackages.map((pkg, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="secondary" className="font-mono">
                          {pkg.trackingNumber}
                        </Badge>
                        <Badge variant="outline" className="ml-2">
                          {pkg.packageType}
                        </Badge>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handlePrintSticker(pkg)}
                        className="flex items-center gap-1"
                      >
                        <Printer className="h-3 w-3" />
                        In tem
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Từ:</span> {pkg.senderName}
                      </div>
                      <div>
                        <span className="font-medium">Đến:</span> {pkg.receiverName}
                      </div>
                      <div>
                        <span className="font-medium">KL:</span> {pkg.weight}kg
                      </div>
                      {pkg.codAmount && (
                        <div>
                          <span className="font-medium">COD:</span> {parseInt(pkg.codAmount).toLocaleString('vi-VN')}₫
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PostalWorkerShell>
  );
}