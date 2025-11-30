import PostalWorkerShell from "@/components/PostalWorkerShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Phone, MapPin, Package, Clock, User, Hash } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchDeliveries, Delivery } from "@/services/mockApi";

export default function PackageList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<Delivery | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | Delivery['status']>('all');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  const officeStatuses: Delivery['status'][] = ['received', 'sorted', 'export_pending'];

  useEffect(() => {
    let mounted = true;
    fetchDeliveries().then((d) => {
      if (mounted) setDeliveries(d);
    });
    return () => { mounted = false; };
  }, []);

  const getStatusInfo = (status: Delivery['status']) => {
    switch (status) {
      case 'pickup_pending': return { label: 'Chờ lấy', color: 'bg-orange-100 text-orange-800' };
      case 'received': return { label: 'Đã nhận', color: 'bg-gray-100 text-gray-800' };
      case 'sorted': return { label: 'Đã phân loại', color: 'bg-blue-100 text-blue-800' };
      case 'export_pending': return { label: 'Đợi xuất', color: 'bg-yellow-100 text-yellow-800' };
      case 'in-transit': return { label: 'Đang vận chuyển', color: 'bg-blue-100 text-blue-800' };
      case 'delivered': return { label: 'Đã giao', color: 'bg-green-100 text-green-800' };
      case 'failed': return { label: 'Thất bại', color: 'bg-red-100 text-red-800' };
      default: return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const officePackages = deliveries.filter(pkg => officeStatuses.includes(pkg.status));
  const filteredPackages = officePackages.filter(pkg =>
    (statusFilter === 'all' || pkg.status === statusFilter) &&
    (pkg.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     pkg.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const contactCustomer = (phone: string, name: string) => {
    alert(`Đang gọi cho khách hàng: ${name}\nSố điện thoại: ${phone}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <PostalWorkerShell title="Danh sách kiện hàng" userName="Nguyễn Thị E" role="Nhân viên bưu điện">
      <div className="space-y-4">
        {/* Search Bar + Status Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo mã vận đơn, tên người gửi/nhận..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg bg-background"
            />
          </div>

          <div>
            <label className="sr-only">Lọc trạng thái</label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="border rounded-lg px-3 py-2 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả (trong bưu cục)</SelectItem>
                <SelectItem value="received">Đã nhận</SelectItem>
                <SelectItem value="sorted">Đã phân loại</SelectItem>
                <SelectItem value="export_pending">Đợi xuất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Package Count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tổng trong bưu cục: {officePackages.length} • Hiển thị: {filteredPackages.length}</span>
        </div>

        {/* Package List */}
        <div className="space-y-3">
          {filteredPackages.map((pkg) => {
            const statusInfo = getStatusInfo(pkg.status);
            return (
              <div 
                key={pkg.id}
                className="p-4 bg-background border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setSelectedPackage(pkg)}
              >
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{pkg.orderNumber}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Khách hàng:</p>
                      <p className="font-medium">{pkg.customerName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Địa chỉ:</p>
                      <p className="font-medium truncate">{pkg.address}</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>—</span>
                    {pkg.codAmount > 0 && (
                      <span className="text-amber-600">COD: {formatCurrency(pkg.codAmount)}</span>
                    )}
                    <span>{pkg.estimatedTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Package Detail Modal */}
        {selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Chi tiết kiện hàng</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedPackage(null)}
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Order Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{selectedPackage.orderNumber}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusInfo(selectedPackage.status).color}`}>
                      {getStatusInfo(selectedPackage.status).label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Dự kiến: {selectedPackage.estimatedTime}
                  </p>
                </div>

                {/* Recipient Info */}
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Người nhận</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{selectedPackage.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{selectedPackage.customerPhone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">{selectedPackage.address}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="mt-2 w-full border-green-300 text-green-700 hover:bg-green-100"
                    onClick={() => contactCustomer('—', selectedPackage.customerName)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Liên hệ người nhận
                  </Button>
                </div>

                {/* Package Details */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Thông tin kiện hàng</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Khối lượng:</span>
                      <p className="font-medium">—</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">COD:</span>
                      <p className="font-medium">
                        {selectedPackage.codAmount > 0 ? formatCurrency(selectedPackage.codAmount) : 'Không'}
                      </p>
                    </div>
                  </div>
                  {selectedPackage.notes && (
                    <div className="mt-2">
                      <span className="text-muted-foreground text-sm">Ghi chú:</span>
                      <p className="text-sm bg-white p-2 rounded border mt-1">{selectedPackage.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PostalWorkerShell>
  );
}
