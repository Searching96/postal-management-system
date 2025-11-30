import PostalWorkerShell from "@/components/PostalWorkerShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Scan, Package, CheckCircle, ArrowUpDown, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchSortingBins, SortingBin } from "@/services/mockApi";

interface IngestedPackage {
  id: string;
  orderNumber: string;
  origin: string;
  weight: number;
  timestamp: string;
}

interface ScannedPackage {
  orderNumber: string;
  destination: string;
  recommendedBin: string;
}

export default function PostalWorkerPackage() {
  // Ingest state
  const [isScanning, setIsScanning] = useState(false);
  const [ingestedPackages, setIngestedPackages] = useState<IngestedPackage[]>([]);

  // Sorting state
  const [scannedPackage, setScannedPackage] = useState<ScannedPackage | null>(null);
  const [scannedContainer, setScannedContainer] = useState<string>("");
  const [sortingError, setSortingError] = useState<string>("");
  const [sortingBins, setSortingBins] = useState<SortingBin[]>([]);
  const [sortedCount, setSortedCount] = useState(0);

  useEffect(() => {
    fetchSortingBins().then(setSortingBins);
  }, []);

  // Ingest functions
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
    setIngestedPackages(prev => [newPackage, ...prev]);
    setIsScanning(false);
  };

  const clearIngestSession = () => {
    setIngestedPackages([]);
  };

  // Sorting functions
  const mockScanPackageForSorting = async () => {
    const destinations = ["Quận 1", "Quận 2", "Quận 3", "Quận 5", "Phú Nhuận"];
    const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
    
    const bin = sortingBins.find(b => b.district.includes(randomDest));
    const recommendedBin = bin?.containerCode || "";

    setScannedPackage({
      orderNumber: `VN${Math.random().toString().slice(2, 11)}VN`,
      destination: randomDest,
      recommendedBin,
    });
    setScannedContainer("");
    setSortingError("");
  };

  const mockScanContainer = async () => {
    const randomBin = sortingBins[Math.floor(Math.random() * sortingBins.length)];
    setScannedContainer(randomBin.containerCode);
    setSortingError("");
  };

  const confirmSorting = () => {
    if (!scannedPackage || !scannedContainer) {
      setSortingError("Vui lòng quét cả kiện hàng và container");
      return;
    }

    if (scannedContainer !== scannedPackage.recommendedBin) {
      setSortingError(`❌ Sai container! Kiện hàng này phải vào ${scannedPackage.recommendedBin}`);
      return;
    }

    // Success
    setSortingBins(prev =>
      prev.map(bin =>
        bin.containerCode === scannedContainer
          ? { ...bin, count: bin.count + 1 }
          : bin
      )
    );
    setSortedCount(prev => prev + 1);
    setScannedPackage(null);
    setScannedContainer("");
    setSortingError("");
  };

  const resetSorting = () => {
    setScannedPackage(null);
    setScannedContainer("");
    setSortingError("");
  };

  return (
    <PostalWorkerShell title="Quản lý kiện hàng" userName="Nguyễn Thị E" role="Nhân viên bưu điện">
      <Tabs defaultValue="ingest" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ingest" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Nhận hàng
          </TabsTrigger>
          <TabsTrigger value="sorting" className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Phân loại
          </TabsTrigger>
        </TabsList>

        {/* INGEST TAB */}
        <TabsContent value="ingest" className="space-y-4 mt-4">
          {/* Scanner Interface */}
          <div className="bg-card rounded-lg p-6 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
            <div className="relative">
              <div
                className={`h-32 w-32 rounded-full flex items-center justify-center transition-all ${
                  isScanning
                    ? "bg-blue-100 animate-pulse"
                    : "bg-blue-50 hover:bg-blue-100 cursor-pointer"
                }`}
                onClick={mockScanPackage}
              >
                {isScanning ? (
                  <Scan className="h-16 w-16 text-blue-600 animate-spin" />
                ) : (
                  <Camera className="h-16 w-16 text-blue-600" />
                )}
              </div>
            </div>

            <Button
              onClick={mockScanPackage}
              disabled={isScanning}
              size="lg"
              className="w-full max-w-xs"
            >
              {isScanning ? "Đang quét..." : "Quét kiện hàng"}
            </Button>
          </div>

          {/* Session Summary */}
          <div className="bg-card rounded-lg p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Phiên làm việc hiện tại</p>
                <p className="text-2xl font-bold text-blue-600">{ingestedPackages.length} kiện</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          {/* Ingested Packages List */}
          {ingestedPackages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Đã nhận ({ingestedPackages.length})
                </h3>
                <Button variant="outline" size="sm" onClick={clearIngestSession}>
                  Kết thúc phiên
                </Button>
              </div>

              {ingestedPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-card rounded-lg p-4 border-l-4 border-l-green-500 space-y-2"
                >
                  <div className="font-medium">{pkg.orderNumber}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>Từ: {pkg.origin}</div>
                    <div>Khối lượng: {pkg.weight}g</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{pkg.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SORTING TAB */}
        <TabsContent value="sorting" className="space-y-4 mt-4">
          {/* Sorting Progress */}
          <div className="bg-card rounded-lg p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đã phân loại trong phiên</p>
                <p className="text-2xl font-bold text-green-600">{sortedCount} kiện</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          {/* Scanning Interface */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={mockScanPackageForSorting}
              variant="outline"
              className="h-24 flex-col gap-2"
            >
              <Package className="h-8 w-8" />
              <span>Quét kiện hàng</span>
            </Button>

            <Button
              onClick={mockScanContainer}
              variant="outline"
              className="h-24 flex-col gap-2"
              disabled={!scannedPackage}
            >
              <Scan className="h-8 w-8" />
              <span>Quét container</span>
            </Button>
          </div>

          {/* Scanned Package Info */}
          {scannedPackage && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-blue-900">Kiện hàng đã quét</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Mã vận đơn:</span>
                  <span className="font-medium">{scannedPackage.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Điểm đến:</span>
                  <span className="font-medium">📍 {scannedPackage.destination}</span>
                </div>
                <div className="bg-blue-100 rounded p-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Container đề xuất:</span>
                    <span className="font-bold text-blue-900">{scannedPackage.recommendedBin}</span>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {sortingBins.find(bin => bin.containerCode === scannedPackage.recommendedBin)?.route}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scanned Container */}
          {scannedContainer && (
            <div className={`rounded-lg p-4 ${scannedContainer !== scannedPackage?.recommendedBin ? 'bg-red-50 border border-red-200' : 'bg-green-50'}`}>
              <h3 className={`font-semibold ${scannedContainer !== scannedPackage?.recommendedBin ? 'text-red-900' : 'text-green-900'}`}>Container đã quét</h3>
              <p className={`text-xl font-bold mt-2 ${scannedContainer !== scannedPackage?.recommendedBin ? 'text-red-700' : 'text-green-700'}`}>{scannedContainer}</p>
              {scannedContainer !== scannedPackage?.recommendedBin && (
                <p className="text-sm text-red-600 mt-2">⚠️ Container sai! Đề xuất: {scannedPackage?.recommendedBin}</p>
              )}
            </div>
          )}

          {/* Error Message */}
          {sortingError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{sortingError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={resetSorting}
              variant="outline"
              disabled={!scannedPackage && !scannedContainer}
            >
              Đặt lại
            </Button>
            <Button
              onClick={confirmSorting}
              disabled={!scannedPackage || !scannedContainer || scannedContainer !== scannedPackage?.recommendedBin}
            >
              {scannedContainer && scannedContainer !== scannedPackage?.recommendedBin ? 'Container sai' : 'Xác nhận phân loại'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">💡 Hướng dẫn:</p>
            <ol className="space-y-1 ml-4 list-decimal">
              <li>Quét kiện hàng để xem tuyến đề xuất</li>
              <li>Quét đúng mã container theo tuyến đề xuất</li>
              <li>Nhấn "Xác nhận" để hoàn tất phân loại</li>
            </ol>
            <p className="text-red-600 text-xs mt-2">⚠️ Hệ thống sẽ từ chối nếu quét sai container</p>
          </div>

          {/* Container List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Containers hiện có</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sortingBins.map((bin) => (
                <div
                  key={bin.containerCode}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    scannedPackage?.recommendedBin === bin.containerCode
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-card"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold">{bin.containerCode}</div>
                      <div className="text-sm text-muted-foreground">{bin.route}</div>
                      <div className="text-xs text-muted-foreground mt-1">{bin.district}</div>
                    </div>
                    <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                      {bin.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PostalWorkerShell>
  );
}
