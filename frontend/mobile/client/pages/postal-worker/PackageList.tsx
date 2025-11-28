import PostalWorkerShell from "@/components/PostalWorkerShell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Phone, MapPin, Package, Clock, User, Hash, Filter } from "lucide-react";
import { useState } from "react";


interface PackageDetails {
  id: string;
  orderNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  weight: number;
  codAmount: number;
  status: 'received' | 'sorted' | 'out-for-delivery' | 'delivered' | 'failed';
  notes: string;
  createdAt: string;
  estimatedDelivery: string;
}


const mockPackages: PackageDetails[] = [
  {
    id: '1',
    orderNumber: 'VN123456789VN',
    senderName: 'Nguyễn Văn Nam',
    senderPhone: '0901234567',
    senderAddress: '456 Lê Lợi, Q1, TP.HCM',
    recipientName: 'Trần Thị Mai',
    recipientPhone: '0907654321',
    recipientAddress: '123 Nguyễn Huệ, Q3, TP.HCM',
    weight: 1200,
    codAmount: 250000,
    status: 'out-for-delivery',
    notes: 'Hàng dễ vỡ, cần cẩn thận',
    createdAt: '2024-01-15 09:30',
    estimatedDelivery: '2024-01-16 14:00'
  },
  {
    id: '2',
    orderNumber: 'VN987654321VN',
    senderName: 'Lê Văn Hùng',
    senderPhone: '0902345678',
    senderAddress: '789 Trần Hưng Đạo, Q5, TP.HCM',
    recipientName: 'Phạm Thị Lan',
    recipientPhone: '0908765432',
    recipientAddress: '321 Võ Văn Tần, Q2, TP.HCM',
    weight: 800,
    codAmount: 0,
    status: 'sorted',
    notes: 'Đã thanh toán trước',
    createdAt: '2024-01-15 10:15',
    estimatedDelivery: '2024-01-17 16:30'
  },
  {
    id: '3',
    orderNumber: 'VN555666777VN',
    senderName: 'Hoàng Văn Đức',
    senderPhone: '0903456789',
    senderAddress: '654 Nguyễn Thị Minh Khai, Q1, TP.HCM',
    recipientName: 'Vũ Thị Hồng',
    recipientPhone: '0909876543',
    recipientAddress: '987 Lý Thường Kiệt, Q10, TP.HCM',
    weight: 2500,
    codAmount: 500000,
    status: 'delivered',
    notes: 'Giao tại bảo vệ tòa nhà',
    createdAt: '2024-01-14 14:20',
    estimatedDelivery: '2024-01-15 10:00'
  }
];


export default function PackageList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'received' | 'sorted'>('all');
  const [selectedPackage, setSelectedPackage] = useState<PackageDetails | null>(null);


  const getStatusInfo = (status: PackageDetails['status']) => {
    switch (status) {
      case 'received': return { label: 'Đã nhận', color: 'bg-gray-100 text-gray-800' };
      case 'sorted': return { label: 'Đã phân loại', color: 'bg-blue-100 text-blue-800' };
      case 'out-for-delivery': return { label: 'Đang giao', color: 'bg-yellow-100 text-yellow-800' };
      case 'delivered': return { label: 'Đã giao', color: 'bg-green-100 text-green-800' };
      case 'failed': return { label: 'Thất bại', color: 'bg-red-100 text-red-800' };
    }
  };


  // Filter packages: only show those in postal office (received or sorted)
  const packagesInOffice = mockPackages.filter(pkg => 
    pkg.status === 'received' || pkg.status === 'sorted'
  );


  const filteredPackages = packagesInOffice.filter(pkg => {
    // Search filter
    const matchesSearch = 
      pkg.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.recipientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });


  const contactCustomer = (phone: string, name: string, type: 'sender' | 'recipient') => {
    const contactType = type === 'sender' ? 'người gửi' : 'người nhận';
    alert(`Đang gọi cho ${contactType}: ${name}\nSố điện thoại: ${phone}`);
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
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
                type="text"
                placeholder="Tìm theo mã vận đơn, tên người gửi/nhận..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg bg-background"
            />
            </div>

            {/* Status Filter Dropdown */}
            <div className="w-full sm:w-64">
            <Select 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value as 'all' | 'received' | 'sorted')}
            >
                <SelectTrigger>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Lọc theo trạng thái" />
                </div>
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="received">Đã nhận</SelectItem>
                <SelectItem value="sorted">Đã phân loại</SelectItem>
                </SelectContent>
            </Select>
            </div>
        </div>

        {/* Package Count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Tổng cộng: {filteredPackages.length} kiện hàng tại bưu cục</span>
            <span className="text-xs">
            (Chỉ hiển thị kiện đang ở bưu cục)
            </span>
        </div>



        {/* Package List */}
        <div className="space-y-3">
          {filteredPackages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Không tìm thấy kiện hàng</p>
            </div>
          ) : (
            filteredPackages.map((pkg) => {
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
                        <p className="text-muted-foreground">Từ:</p>
                        <p className="font-medium">{pkg.senderName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Đến:</p>
                        <p className="font-medium">{pkg.recipientName}</p>
                      </div>
                    </div>


                    {/* Additional Info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{pkg.weight}g</span>
                      {pkg.codAmount > 0 && (
                        <span className="text-amber-600">COD: {formatCurrency(pkg.codAmount)}</span>
                      )}
                      <span>{pkg.createdAt}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
                    Tạo: {selectedPackage.createdAt} • Dự kiến: {selectedPackage.estimatedDelivery}
                  </p>
                </div>


                {/* Sender Info */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Người gửi</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{selectedPackage.senderName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{selectedPackage.senderPhone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span className="text-sm">{selectedPackage.senderAddress}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="mt-2 w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => contactCustomer(selectedPackage.senderPhone, selectedPackage.senderName, 'sender')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Liên hệ người gửi
                  </Button>
                </div>


                {/* Recipient Info */}
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Người nhận</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{selectedPackage.recipientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{selectedPackage.recipientPhone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">{selectedPackage.recipientAddress}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="mt-2 w-full border-green-300 text-green-700 hover:bg-green-100"
                    onClick={() => contactCustomer(selectedPackage.recipientPhone, selectedPackage.recipientName, 'recipient')}
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
                      <p className="font-medium">{selectedPackage.weight}g</p>
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
