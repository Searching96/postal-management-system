import PostalWorkerShell from "@/components/PostalWorkerShell";
import { Button } from "@/components/ui/button";
import { Camera, Scan, ArrowRight, Package } from "lucide-react";
import { useState } from "react";

interface SortingBin {
  id: string;
  route: string;
  district: string;
  count: number;
  color: string;
  containerCode: string;
}

interface PackageInfo {
  orderNumber: string;
  destination: string;
  recommendedRoute: string;
}

const sortingBins: SortingBin[] = [
  { id: 'route-a', route: 'Tuyến A', district: 'Q1, Q3', count: 15, color: 'bg-blue-100 text-blue-800', containerCode: 'CNT-A001' },
  { id: 'route-b', route: 'Tuyến B', district: 'Q2, Q10', count: 8, color: 'bg-green-100 text-green-800', containerCode: 'CNT-B002' },
  { id: 'route-c', route: 'Tuyến C', district: 'Q4, Q7', count: 12, color: 'bg-orange-100 text-orange-800', containerCode: 'CNT-C003' },
  { id: 'special', route: 'Đặc biệt', district: 'COD, Hỏa tốc', count: 3, color: 'bg-red-100 text-red-800', containerCode: 'CNT-S999' },
];

const getRouteFromAddress = (address: string): string => {
  if (address.includes('Q1') || address.includes('Q3') || address.includes('Quận 1') || address.includes('Quận 3')) {
    return 'route-a';
  }
  if (address.includes('Q2') || address.includes('Q10') || address.includes('Quận 2') || address.includes('Quận 10')) {
    return 'route-b';
  }
  if (address.includes('Q4') || address.includes('Q7') || address.includes('Quận 4') || address.includes('Quận 7')) {
    return 'route-c';
  }
  return 'special';
};

export default function PostalWorkerSorting() {
  const [isScanning, setIsScanning] = useState(false);
  const [isScanningContainer, setIsScanningContainer] = useState(false);
  const [scannedPackage, setScannedPackage] = useState<PackageInfo | null>(null);
  const [scannedContainer, setScannedContainer] = useState<string | null>(null);
  const [sortingError, setSortingError] = useState<string | null>(null);

  const mockScanPackage = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const destinations = [
      '123 Nguyễn Huệ, Q1, TP.HCM',
      '456 Lê Lợi, Q3, TP.HCM', 
      '789 Trần Hưng Đạo, Q2, TP.HCM',
      '321 Võ Văn Tần, Q10, TP.HCM',
      '654 Nguyễn Thị Minh Khai, Q4, TP.HCM',
      '987 Lý Thường Kiệt, Q7, TP.HCM'
    ];
    
    const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
    const orderNumber = `VN${Math.random().toString().slice(2, 11)}VN`;
    const recommendedRoute = getRouteFromAddress(randomDestination);
    
    setScannedPackage({
      orderNumber,
      destination: randomDestination,
      recommendedRoute
    });
    setScannedContainer(null);
    setIsScanning(false);
  };

  const mockScanContainer = async () => {
    setIsScanningContainer(true);
    setSortingError(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock scanning a random container code
    const containers = sortingBins.map(bin => bin.containerCode);
    const randomContainer = containers[Math.floor(Math.random() * containers.length)];
    setScannedContainer(randomContainer);
    
    // Check if container matches recommended route
    if (scannedPackage) {
      const targetBin = sortingBins.find(bin => bin.containerCode === randomContainer);
      const recommendedBin = sortingBins.find(bin => bin.id === scannedPackage.recommendedRoute);
      
      if (targetBin?.id !== recommendedBin?.id) {
        setSortingError(`❌ Container sai! Kiện hàng này cần được phân vào ${recommendedBin?.route} (${recommendedBin?.containerCode}), không phải ${targetBin?.route}`);
        alert(`❌ Container sai!\n\nKiện hàng: ${scannedPackage.orderNumber}\nĐiểm đến: ${scannedPackage.destination}\n\nCần container: ${recommendedBin?.route} (${recommendedBin?.containerCode})\nĐã quét: ${targetBin?.route} (${randomContainer})\n\nVui lòng quét đúng container!`);
      }
    }
    
    setIsScanningContainer(false);
  };

  const confirmSorting = () => {
    if (!scannedPackage || !scannedContainer || sortingError) return;
    
    const targetBin = sortingBins.find(bin => bin.containerCode === scannedContainer);
    alert(`✅ Đã phân loại ${scannedPackage.orderNumber} vào ${targetBin?.route} thành công!`);
    
    setScannedPackage(null);
    setScannedContainer(null);
    setSortingError(null);
  };

  const isCorrectContainer = () => {
    if (!scannedPackage || !scannedContainer) return false;
    const targetBin = sortingBins.find(bin => bin.containerCode === scannedContainer);
    const recommendedBin = sortingBins.find(bin => bin.id === scannedPackage.recommendedRoute);
    return targetBin?.id === recommendedBin?.id;
  };

  return (
    <PostalWorkerShell title="Phân loại hàng" userName="Nguyễn Thị E" role="Nhân viên bưu điện">
      <div className="space-y-4">
        {/* Scanner Interface */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center space-y-2">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg border-2 border-dashed flex items-center justify-center">
              {isScanning ? (
                <Scan className="h-5 w-5 animate-pulse text-blue-500" />
              ) : (
                <Package className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <Button 
              onClick={mockScanPackage}
              disabled={isScanning}
              size="sm"
              className="w-full"
            >
              {isScanning ? "Đang quét..." : "Quét kiện hàng"}
            </Button>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg border-2 border-dashed flex items-center justify-center">
              {isScanningContainer ? (
                <Scan className="h-5 w-5 animate-pulse text-green-500" />
              ) : (
                <Camera className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <Button 
              onClick={mockScanContainer}
              disabled={isScanningContainer || !scannedPackage}
              size="sm"
              variant="outline"
              className="w-full"
            >
              {isScanningContainer ? "Đang quét..." : "Quét container"}
            </Button>
          </div>
        </div>

        {/* Scanned Package Info */}
        {scannedPackage && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">{scannedPackage.orderNumber}</span>
            </div>
            <p className="text-sm text-yellow-700">📍 {scannedPackage.destination}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-yellow-600">Tuyến đề xuất:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                sortingBins.find(bin => bin.id === scannedPackage.recommendedRoute)?.color
              }`}>
                {sortingBins.find(bin => bin.id === scannedPackage.recommendedRoute)?.route}
              </span>
            </div>
          </div>
        )}

        {/* Scanned Container */}
        {scannedContainer && (
          <div className={`p-3 border rounded-lg ${
            sortingError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-2">
              <Camera className={`h-4 w-4 ${sortingError ? 'text-red-600' : 'text-green-600'}`} />
              <span className={`font-medium ${sortingError ? 'text-red-800' : 'text-green-800'}`}>
                Container: {scannedContainer}
              </span>
            </div>
            <p className={`text-sm ${sortingError ? 'text-red-700' : 'text-green-700'}`}>
              {sortingBins.find(bin => bin.containerCode === scannedContainer)?.route}
            </p>
          </div>
        )}

        {/* Sorting Error */}
        {sortingError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{sortingError}</p>
            <Button 
              onClick={() => {
                setScannedContainer(null);
                setSortingError(null);
              }}
              variant="outline"
              size="sm"
              className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
            >
              Quét lại container
            </Button>
          </div>
        )}

        {/* Confirm Button */}
        {scannedPackage && scannedContainer && (
          <Button 
            onClick={confirmSorting}
            disabled={!isCorrectContainer()}
            className={`w-full ${isCorrectContainer() ? '' : 'opacity-50 cursor-not-allowed'}`}
            size="lg"
          >
            {isCorrectContainer() ? 'Xác nhận phân loại' : 'Không thể xác nhận - Container sai'}
          </Button>
        )}

        {/* Available Containers */}
        <div className="space-y-3">
          <h3 className="font-medium">Container có sẵn</h3>
          
          <div className="grid gap-2">
            {sortingBins.map((bin) => {
              const isRecommended = scannedPackage?.recommendedRoute === bin.id;
              const isScanned = scannedContainer === bin.containerCode;
              const isWrongContainer = isScanned && !isCorrectContainer();
              
              return (
                <div
                  key={bin.id}
                  className={`p-3 border rounded-lg ${
                    isRecommended ? 'border-yellow-300 bg-yellow-50' : 
                    isWrongContainer ? 'border-red-300 bg-red-50' :
                    isScanned ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{bin.route}</span>
                        {isRecommended && <span className="text-xs text-yellow-600">📍 Đề xuất</span>}
                        {isScanned && !isWrongContainer && <span className="text-xs text-green-600">✓ Đã quét</span>}
                        {isWrongContainer && <span className="text-xs text-red-600">❌ Sai container</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">{bin.district}</div>
                      <div className="text-xs text-muted-foreground">Mã: {bin.containerCode}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${bin.color}`}>
                      {bin.count} kiện
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 1. Quét kiện hàng để xem tuyến đề xuất<br/>
            2. Quét đúng mã container theo tuyến đề xuất<br/>
            3. Nhấn "Xác nhận" để hoàn tất phân loại<br/>
            ⚠️ Hệ thống sẽ từ chối nếu quét sai container
          </p>
        </div>
      </div>
    </PostalWorkerShell>
  );
}
