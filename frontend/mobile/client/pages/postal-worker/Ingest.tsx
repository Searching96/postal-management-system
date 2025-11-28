import PostalWorkerShell from "@/components/PostalWorkerShell";
import { Button } from "@/components/ui/button";
import { Camera, Scan, Package, CheckCircle } from "lucide-react";
import { useState } from "react";

interface IngestedPackage {
  id: string;
  orderNumber: string;
  origin: string;
  weight: number;
  timestamp: string;
}

export default function PostalWorkerIngest() {
  const [isScanning, setIsScanning] = useState(false);
  const [packages, setPackages] = useState<IngestedPackage[]>([]);

  const mockScanPackage = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newPackage: IngestedPackage = {
      id: Date.now().toString(),
      orderNumber: `VN${Math.random().toString().slice(2, 11)}VN`,
      origin: `Bưu cục ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
      weight: Math.floor(Math.random() * 5000) + 100,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    };
    
    setPackages(prev => [newPackage, ...prev]);
    setIsScanning(false);
  };

  const clearSession = () => {
    setPackages([]);
  };

  return (
    <PostalWorkerShell title="Nhận hàng" userName="Nguyễn Thị E" role="Nhân viên bưu điện">
      <div className="space-y-4">
        {/* Scanner Interface */}
        <div className="text-center space-y-4">
          <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg border-2 border-dashed flex items-center justify-center">
            {isScanning ? (
              <div className="text-center space-y-2">
                <Scan className="h-8 w-8 mx-auto animate-pulse text-blue-500" />
                <p className="text-sm text-muted-foreground">Đang quét...</p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Camera className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-sm text-muted-foreground">Quét mã kiện hàng</p>
              </div>
            )}
          </div>
          
          <Button 
            onClick={mockScanPackage}
            disabled={isScanning}
            className="w-full"
            size="lg"
          >
            {isScanning ? "Đang quét..." : "Quét kiện hàng"}
          </Button>
        </div>

        {/* Session Summary */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Phiên làm việc hiện tại</span>
          </div>
          <span className="text-lg font-bold text-blue-600">{packages.length} kiện</span>
        </div>

        {/* Ingested Packages List */}
        {packages.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Đã nhận ({packages.length})</h3>
              <Button variant="outline" size="sm" onClick={clearSession}>
                Kết thúc phiên
              </Button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {packages.map((pkg) => (
                <div key={pkg.id} className="p-3 bg-background border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">{pkg.orderNumber}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Từ: {pkg.origin}</p>
                      <p className="text-xs text-muted-foreground">Khối lượng: {pkg.weight}g</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{pkg.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PostalWorkerShell>
  );
}
