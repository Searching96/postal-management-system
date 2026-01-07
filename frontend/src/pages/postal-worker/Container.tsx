import PostalWorkerShell from "@/components/PostalWorkerShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Scan, Truck, CheckCircle, Package, ArrowDown, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchSortingBins, SortingBin } from "@/services/mockApi";

export default function PostalWorkerContainer() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedContainer, setScannedContainer] = useState<SortingBin | null>(null);
  const [containers, setContainers] = useState<SortingBin[]>([]);

  useEffect(() => {
    fetchSortingBins().then(setContainers);
  }, []);

  const mockScanContainer = async () => {
    setIsScanning(true);
    // Simulate scanning a random container
    const randomContainer = containers[Math.floor(Math.random() * containers.length)];
    setScannedContainer(randomContainer);
    setIsScanning(false);
  };

  const confirmIngress = () => {
    if (!scannedContainer) return;
    alert(`✅ Container ${scannedContainer.containerCode} đã được nhận vào kho.`);
    setScannedContainer(null);
  };

  const confirmEgress = () => {
    if (!scannedContainer) return;
    alert(`✅ Container ${scannedContainer.containerCode} đã được xuất kho.`);
    setScannedContainer(null);
  };

  const getStatusColor = (status: SortingBin['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'full': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusLabel = (status: SortingBin['status']) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'maintenance': return 'Bảo trì';
      case 'full': return 'Đầy';
    }
  };

  return (
    <PostalWorkerShell title="Quản lý Container" userName="Nguyễn Thị E" role="Nhân viên bưu điện">
      <Tabs defaultValue="ingress" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ingress" className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4" />
            Nhận Container
          </TabsTrigger>
          <TabsTrigger value="egress" className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4" />
            Xuất Container
          </TabsTrigger>
        </TabsList>

        {/* INGRESS TAB */}
        <TabsContent value="ingress" className="space-y-4 mt-4">
          <div className="text-center space-y-3">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg border-2 border-dashed flex items-center justify-center">
              {isScanning ? (
                <Scan className="h-6 w-6 animate-pulse text-blue-500" />
              ) : (
                <Camera className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <Button onClick={mockScanContainer} disabled={isScanning} size="sm">
              {isScanning ? "Đang quét..." : "Quét Container"}
            </Button>
          </div>

          {scannedContainer && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">{scannedContainer.containerCode}</span>
                </div>
                <p className="text-sm text-blue-700">{scannedContainer.route} - {scannedContainer.district}</p>
                <p className="text-xs text-blue-600">Vị trí: {scannedContainer.location}</p>
              </div>
              <Button onClick={confirmIngress} className="w-full" size="lg">
                Xác nhận Container
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-medium">Containers trong kho</h3>
            <div className="space-y-2">
              {containers.map((container) => (
                <div key={container.id} className="p-3 bg-background border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{container.containerCode}</div>
                      <div className="text-sm text-muted-foreground">{container.route}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(container.status)}`}>
                      {getStatusLabel(container.status)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{container.currentLoad}/{container.capacity} kiện</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* EGRESS TAB */}
        <TabsContent value="egress" className="space-y-4 mt-4">
          <div className="text-center space-y-3">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg border-2 border-dashed flex items-center justify-center">
              {isScanning ? (
                <Scan className="h-6 w-6 animate-pulse text-blue-500" />
              ) : (
                <Camera className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <Button onClick={mockScanContainer} disabled={isScanning} size="sm">
              {isScanning ? "Đang quét..." : "Quét Container"}
            </Button>
          </div>

          {scannedContainer && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">{scannedContainer.containerCode}</span>
                </div>
                <p className="text-sm text-green-700">{scannedContainer.route} - {scannedContainer.district}</p>
                <p className="text-xs text-green-600">Sẵn sàng xuất: {scannedContainer.currentLoad} kiện</p>
              </div>
              <Button onClick={confirmEgress} className="w-full" size="lg" variant="destructive">
                Xác nhận xuất Container
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-medium">Containers sẵn sàng xuất</h3>
            <div className="space-y-2">
              {containers.filter(c => c.status === 'active' && c.currentLoad > 0).map((container) => (
                <div key={container.id} className="p-3 bg-background border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{container.containerCode}</div>
                      <div className="text-sm text-muted-foreground">{container.route}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{container.currentLoad} kiện</span>
                      <p className="text-xs text-muted-foreground">{container.location}</p>
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
