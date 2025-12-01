import PostalWorkerShell from "@/components/PostalWorkerShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, QrCode, Weight, MapPin, User, CheckCircle2, Scan, Printer, Receipt } from "lucide-react";
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
  length: string;
  width: string;
  height: string;
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
    length: '',
    width: '',
    height: '',
    codAmount: '',
    packageType: '',
    notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ingestedPackages, setIngestedPackages] = useState<PackageData[]>([]);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [recentPackage, setRecentPackage] = useState<PackageData | null>(null);

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

  const simulateBarcodeScanning = async () => {
    setIsScanning(true);
    
    // Simulate barcode scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock scanned package data
    const mockData = {
      senderName: "Nguyễn Văn A",
      senderPhone: "0901234567", 
      senderAddress: "123 Đường ABC, Quận 1, TP.HCM",
      receiverName: "Trần Thị B",
      receiverPhone: "0987654321",
      receiverAddress: "456 Đường XYZ, Quận 3, TP.HCM",
      weight: "1.5",
      packageType: "standard",
      length: "20",
      width: "15",
      height: "10",
      codAmount: "",
      notes: "Hàng dễ vỡ"
    };
    
    // Generate tracking number and create package
    const trackingNumber = generateTrackingNumber();
    const newPackage = { ...mockData, trackingNumber };
    
    // Add to ingested packages list
    setIngestedPackages(prev => [newPackage, ...prev]);
    
    // Update form with scanned data (optional, for display)
    setPackageData(prev => ({ ...prev, ...mockData, trackingNumber }));
    
    setIsScanning(false);
    
    toast({
      title: "Quét mã và nhận kiện thành công",
      description: `Kiện hàng đã được tự động nhận với mã ${trackingNumber}`,
      variant: "default"
    });

    // Show print dialog for scanned packages
    setRecentPackage(newPackage);
    setShowPrintDialog(true);
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
      length: '',
      width: '',
      height: '',
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

    // Show print dialog for manual package input
    setRecentPackage(newPackage);
    setShowPrintDialog(true);
  };

  const handlePrintReceipt = (pkg: PackageData) => {
    const receiptContent = generateReceiptContent(pkg);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }

    toast({
      title: "In hóa đơn khách hàng",
      description: `Hóa đơn cho kiện ${pkg.trackingNumber} đã được in`,
      variant: "default"
    });
  };

  const handlePrintSticker = (pkg: PackageData) => {
    const stickerContent = generateStickerContent(pkg);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(stickerContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }

    toast({
      title: "In tem dán kiện hàng",
      description: `Tem cho kiện ${pkg.trackingNumber} đã được in`,
      variant: "default"
    });
  };

  const generateReceiptContent = (pkg: PackageData) => {
    const dimensions = `${pkg.length}x${pkg.width}x${pkg.height}`;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa Đơn - ${pkg.trackingNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            font-size: 12px; 
            margin: 0; 
            padding: 20px;
            background: white;
          }
          .receipt {
            width: 80mm;
            border: 1px solid #000;
            padding: 10px;
            box-sizing: border-box;
          }
          .header {
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .section {
            margin: 10px 0;
            border-bottom: 1px dashed #666;
            padding-bottom: 8px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .label { font-weight: bold; }
          .total {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            margin: 10px 0;
          }
          @media print {
            body { margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            HÓA ĐƠN GỬI HÀNG<br>
            VIETNAM POST
          </div>
          
          <div class="section">
            <div class="row">
              <span class="label">Mã vận đơn:</span>
              <span>${pkg.trackingNumber}</span>
            </div>
            <div class="row">
              <span class="label">Ngày gửi:</span>
              <span>${new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
          
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
            <div class="row">
              <span class="label">Loại:</span>
              <span>${pkg.packageType}</span>
            </div>
            <div class="row">
              <span class="label">Khối lượng:</span>
              <span>${pkg.weight}kg</span>
            </div>
            <div class="row">
              <span class="label">Kích thước:</span>
              <span>${dimensions}cm</span>
            </div>
            ${pkg.codAmount ? `
            <div class="row">
              <span class="label">COD:</span>
              <span>${parseInt(pkg.codAmount).toLocaleString('vi-VN')}₫</span>
            </div>
            ` : ''}
          </div>
          
          ${pkg.notes ? `
          <div class="section">
            <div class="label">Ghi chú:</div>
            <div>${pkg.notes}</div>
          </div>
          ` : ''}
          
          <div class="total">
            Cảm ơn quý khách!
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateStickerContent = (pkg: PackageData) => {
    const dimensions = `${pkg.length}x${pkg.width}x${pkg.height}`;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tem Dán Kiện - ${pkg.trackingNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            font-size: 11px; 
            margin: 0; 
            padding: 15px;
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
            margin-bottom: 8px;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
          }
          .tracking {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin: 8px 0;
          }
          .barcode {
            text-align: center;
            font-family: 'Courier New', monospace;
            font-size: 20px;
            margin: 8px 0;
            letter-spacing: 2px;
            border: 1px solid #000;
            padding: 5px;
          }
          .section {
            margin: 6px 0;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px;
          }
          .label { font-weight: bold; }
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
            <div class="label">Từ:</div>
            <div>${pkg.senderName}</div>
            <div>${pkg.senderPhone}</div>
            <div>${pkg.senderAddress}</div>
          </div>
          
          <div class="section">
            <div class="label">Đến:</div>
            <div>${pkg.receiverName}</div>
            <div>${pkg.receiverPhone}</div>
            <div>${pkg.receiverAddress}</div>
          </div>
          
          <div class="section">
            <div class="label">Thông tin:</div>
            <div>Loại: ${pkg.packageType} | KL: ${pkg.weight}kg</div>
            <div>Kích thước: ${dimensions}cm</div>
            ${pkg.codAmount ? `<div>COD: ${parseInt(pkg.codAmount).toLocaleString('vi-VN')}₫</div>` : ''}
          </div>
          
          <div style="margin-top: auto; text-align: center; font-size: 10px;">
            ${new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <PostalWorkerShell title="Nhận Kiện Hàng" userName="Nguyễn Thị E" role="Nhân viên bưu điện">
      <div className="space-y-6">
        {/* Barcode Scanner Simulation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Quét Mã Vạch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={simulateBarcodeScanning}
              disabled={isScanning}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {isScanning ? (
                "Đang quét..."
              ) : (
                <>
                  <Scan className="h-4 w-4 mr-2" />
                  Quét Mã Vạch Kiện Hàng
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Sử dụng máy quét để tự động điền thông tin kiện hàng
            </p>
          </CardContent>
        </Card>
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
                  <Label>Kích thước (cm)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Input
                        id="length"
                        type="number"
                        value={packageData.length}
                        onChange={(e) => handleInputChange('length', e.target.value)}
                        placeholder="Dài"
                      />
                    </div>
                    <div>
                      <Input
                        id="width"
                        type="number"
                        value={packageData.width}
                        onChange={(e) => handleInputChange('width', e.target.value)}
                        placeholder="Rộng"
                      />
                    </div>
                    <div>
                      <Input
                        id="height"
                        type="number"
                        value={packageData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        placeholder="Cao"
                      />
                    </div>
                  </div>
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
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintReceipt(pkg)}
                          className="flex items-center gap-1"
                        >
                          <Receipt className="h-3 w-3" />
                          Hóa đơn
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handlePrintSticker(pkg)}
                          className="flex items-center gap-1"
                        >
                          <Printer className="h-3 w-3" />
                          Tem dán
                        </Button>
                      </div>
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
                      <div>
                        <span className="font-medium">KT:</span> {pkg.length}x{pkg.width}x{pkg.height}cm
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

      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Kiện hàng đã được nhận thành công
            </DialogTitle>
            <DialogDescription>
              Mã kiện hàng: <span className="font-mono font-semibold">{recentPackage?.trackingNumber}</span>
              <br />
              Chọn loại in cần thiết:
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => {
                if (recentPackage) {
                  handlePrintReceipt(recentPackage);
                }
              }}
              className="justify-start gap-2"
              variant="outline"
            >
              <Receipt className="h-4 w-4" />
              In hóa đơn khách hàng
            </Button>
            
            <Button
              onClick={() => {
                if (recentPackage) {
                  handlePrintSticker(recentPackage);
                }
              }}
              className="justify-start gap-2"
            >
              <Printer className="h-4 w-4" />
              In tem dán kiện hàng
            </Button>
            
            <div className="flex gap-2 mt-2">
              <Button
                onClick={() => {
                  if (recentPackage) {
                    handlePrintReceipt(recentPackage);
                    handlePrintSticker(recentPackage);
                  }
                }}
                className="flex-1"
                variant="default"
              >
                In cả hai
              </Button>
              
              <Button
                onClick={() => setShowPrintDialog(false)}
                variant="secondary"
                className="flex-1"
              >
                Bỏ qua
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PostalWorkerShell>
  );
}