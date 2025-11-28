import DriverShell from "@/components/DriverShell";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Package, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Delivery {
  id: string;
  orderNumber: string;
  address: string;
  customerName: string;
  status: 'pending' | 'in-transit' | 'delivered';
  estimatedTime: string;
  codAmount: number;
  notes: string;
}

const mockDeliveries: Delivery[] = [
  {
    id: '1',
    orderNumber: 'VN123456789VN',
    address: '123 Nguyễn Huệ, Q1, TP.HCM',
    customerName: 'Nguyễn Văn B',
    status: 'pending',
    estimatedTime: '09:30',
    codAmount: 250000,
    notes: 'Gọi trước khi đến'
  },
  {
    id: '2',
    orderNumber: 'VN987654321VN',
    address: '456 Lê Lợi, Q1, TP.HCM',
    customerName: 'Trần Thị C',
    status: 'in-transit',
    estimatedTime: '10:15',
    codAmount: 0,
    notes: 'Đã thanh toán trước'
  },
  {
    id: '3',
    orderNumber: 'VN555666777VN',
    address: '789 Hai Bà Trưng, Q3, TP.HCM',
    customerName: 'Lê Văn D',
    status: 'delivered',
    estimatedTime: '11:00',
    codAmount: 150000,
    notes: 'Giao tại bảo vệ'
  }
];

export function DeliveriesMap() {
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [currentLocation] = useState({ lat: 10.7769, lng: 106.7009 });

  const getStatusIcon = (status: Delivery['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'in-transit': return <Package className="h-4 w-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'pending': return 'bg-orange-500';
      case 'in-transit': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
    }
  };

  const openNavigation = (delivery: Delivery) => {
    // Mock navigation - in real app would open maps app
    alert(`Đang mở chỉ đường đến: ${delivery.address}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <DriverShell title="Bản đồ giao hàng" userName="Nguyễn Văn A" role="Bưu tá">
      <div className="space-y-4">
        {/* Mock Map Area */}
        <div className="relative w-full h-64 bg-gray-100 rounded-lg border overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
            {/* Current Location */}
            <div 
              className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"
              style={{ 
                left: '50%', 
                top: '50%', 
                transform: 'translate(-50%, -50%)' 
              }}
            />
            
            {/* Delivery Markers */}
            {mockDeliveries.map((delivery, index) => (
              <div
                key={delivery.id}
                className={`absolute w-3 h-3 ${getStatusColor(delivery.status)} rounded-full border border-white cursor-pointer hover:scale-125 transition-transform`}
                style={{
                  left: `${30 + index * 20}%`,
                  top: `${25 + index * 15}%`
                }}
                onClick={() => setSelectedDelivery(delivery)}
              />
            ))}
          </div>
          
          {/* Map Controls */}
          <div className="absolute top-2 right-2 space-y-2">
            <Button size="sm" variant="outline" className="bg-white">
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
            Bản đồ mô phỏng
          </div>
        </div>

        {/* Delivery List */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Danh sách giao hàng ({mockDeliveries.length})</h3>
          
          {mockDeliveries.map((delivery) => (
            <div 
              key={delivery.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedDelivery?.id === delivery.id ? 'bg-blue-50 border-blue-200' : 'bg-background'
              }`}
              onClick={() => setSelectedDelivery(delivery)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(delivery.status)}
                    <span className="text-sm font-medium">{delivery.orderNumber}</span>
                    <span className="text-xs text-muted-foreground">{delivery.estimatedTime}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{delivery.customerName}</p>
                  <p className="text-xs text-muted-foreground truncate">{delivery.address}</p>
                  
                  {/* COD Amount */}
                  {delivery.codAmount > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        COD: {formatCurrency(delivery.codAmount)}
                      </span>
                    </div>
                  )}
                  
                  {/* Order Notes */}
                  {delivery.notes && (
                    <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      📝 {delivery.notes}
                    </p>
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    openNavigation(delivery);
                  }}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Chờ giao</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Đang giao</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Đã giao</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Vị trí hiện tại</span>
          </div>
        </div>
      </div>
    </DriverShell>
  );
}
