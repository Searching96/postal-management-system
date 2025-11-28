import PostalWorkerShell from "@/components/PostalWorkerShell";
import { Button } from "@/components/ui/button";
import { Camera, Scan, Truck, CheckCircle, Package } from "lucide-react";
import { useState } from "react";

interface DispatchBatch {
  id: string;
  route: string;
  driver: string;
  packageCount: number;
  status: 'ready' | 'loading' | 'dispatched';
  estimatedTime: string;
}

const mockBatches: DispatchBatch[] = [
  { id: '1', route: 'Tuyến A - Q1, Q3', driver: 'Nguyễn Văn A', packageCount: 15, status: 'ready', estimatedTime: '14:00' },
  { id: '2', route: 'Tuyến B - Q2, Q10', driver: 'Trần Văn B', packageCount: 8, status: 'loading', estimatedTime: '14:30' },
  { id: '3', route: 'Tuyến C - Q4, Q7', driver: 'Lê Văn C', packageCount: 12, status: 'ready', estimatedTime: '15:00' },
];

interface ScannedPackageInfo {
  orderNumber: string;
  destination: string;
  recommendedRoute: string;
}

const getRouteFromOrderNumber = (orderNumber: string): { route: string, destination: string } => {
  // Mock logic to determine route based on order number pattern
  const destinations = {
    'A': { route: 'Tuyến A - Q1, Q3', destination: '123 Nguyễn Huệ, Q1, TP.HCM' },
    'B': { route: 'Tuyến B - Q2, Q10', destination: '456 Lê Lợi, Q2, TP.HCM' },
    'C': { route: 'Tuyến C - Q4, Q7', destination: '789 Trần Hưng Đạo, Q4, TP.HCM' },
  };
  
  // Simple logic based on order number
  const hash = orderNumber.charCodeAt(2) % 3;
  const keys = Object.keys(destinations);
  const key = keys[hash] as keyof typeof destinations;
  return destinations[key];
};

export default function PostalWorkerDispatch() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPackage, setScannedPackage] = useState<ScannedPackageInfo | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);

  const mockScanPackage = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const orderNumber = `VN${Math.random().toString().slice(2, 11)}VN`;
    const { route, destination } = getRouteFromOrderNumber(orderNumber);
    
    setScannedPackage({
      orderNumber,
      destination,
      recommendedRoute: route
    });
    setIsScanning(false);
  };

  const addToBatch = () => {
    if (!scannedPackage) return;
    
    alert(`Đã thêm ${scannedPackage.orderNumber} vào ${scannedPackage.recommendedRoute}`);
    setScannedPackage(null);
  };

  const confirmDispatch = (batchId: string) => {
    const batch = mockBatches.find(b => b.id === batchId);
    if (!batch) return;
    
    if (window.confirm(`Xác nhận xuất kho?\n\nTuyến: ${batch.route}\nTài xế: ${batch.driver}\nSố kiện: ${batch.packageCount}\nThời gian: ${batch.estimatedTime}\n\nSau khi xuất kho không thể hoàn tác!`)) {
      alert(`✅ Đã xuất kho ${batch.route} cho ${batch.driver}`);
      // In real app, update batch status to 'dispatched'
    }
    setShowConfirmation(null);
  };

  const getStatusColor = (status: DispatchBatch['status']) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'loading': return 'bg-yellow-100 text-yellow-800';
      case 'dispatched': return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = (status: DispatchBatch['status']) => {
    switch (status) {
      case 'ready': return 'Sẵn sàng';
      case 'loading': return 'Đang xếp';
      case 'dispatched': return 'Đã xuất';
    }
  };

  return (
    <PostalWorkerShell title="Xuất kho" userName="Nguyễn Thị E" role="Nhân viên bưu điện">
      <div className="space-y-4">
        {/* Scanner Interface */}
        <div className="text-center space-y-3">
          <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg border-2 border-dashed flex items-center justify-center">
            {isScanning ? (
              <Scan className="h-6 w-6 animate-pulse text-blue-500" />
            ) : (
              <Camera className="h-6 w-6 text-gray-400" />
            )}
          </div>
          
          <Button 
            onClick={mockScanPackage}
            disabled={isScanning}
            size="sm"
          >
            {isScanning ? "Đang quét..." : "Quét kiện hàng"}
          </Button>
        </div>

        {/* Scanned Package with Auto Route Detection */}
        {scannedPackage && (
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">{scannedPackage.orderNumber}</span>
              </div>
              <p className="text-sm text-yellow-700">📍 {scannedPackage.destination}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-yellow-600">Tuyến giao hàng:</span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {scannedPackage.recommendedRoute}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={addToBatch}
              className="w-full"
              size="lg"
            >
              Thêm vào lô hàng
            </Button>
          </div>
        )}

        {/* Dispatch Batches */}
        <div className="space-y-3">
          <h3 className="font-medium">Lô hàng xuất kho</h3>
          
          <div className="space-y-2">
            {mockBatches.map((batch) => (
              <div key={batch.id} className="p-3 bg-background border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{batch.route}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(batch.status)}`}>
                        {getStatusLabel(batch.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Tài xế: {batch.driver}</p>
                    <p className="text-xs text-muted-foreground">{batch.packageCount} kiện • Xuất lúc {batch.estimatedTime}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {batch.status === 'ready' && (
                    <Button 
                      size="sm"
                      onClick={() => setShowConfirmation(batch.id)}
                      className="flex-1"
                      variant="destructive"
                    >
                      Xuất kho
                    </Button>
                  )}
                  
                  {batch.status === 'dispatched' && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Đã xuất kho
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h3 className="font-medium mb-4">Xác nhận xuất kho</h3>
              {(() => {
                const batch = mockBatches.find(b => b.id === showConfirmation);
                return (
                  <div className="space-y-2 mb-6">
                    <p className="text-sm"><strong>Tuyến:</strong> {batch?.route}</p>
                    <p className="text-sm"><strong>Tài xế:</strong> {batch?.driver}</p>
                    <p className="text-sm"><strong>Số kiện:</strong> {batch?.packageCount}</p>
                    <p className="text-sm"><strong>Thời gian:</strong> {batch?.estimatedTime}</p>
                    <p className="text-xs text-red-600 mt-3">⚠️ Sau khi xuất kho không thể hoàn tác!</p>
                  </div>
                );
              })()}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmation(null)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={() => confirmDispatch(showConfirmation)}
                  className="flex-1"
                  variant="destructive"
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 Quét kiện hàng để tự động xác định tuyến giao hàng, sau đó thêm vào lô tương ứng
          </p>
        </div>
      </div>
    </PostalWorkerShell>
  );
}
