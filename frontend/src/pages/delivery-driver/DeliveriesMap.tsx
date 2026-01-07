import DriverShell from "@/components/DriverShell";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchDeliveries, Delivery } from "@/services/mockApi";

export function DeliveriesMap() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [currentLocation] = useState({ lat: 10.7769, lng: 106.7009 });
  const [driverId] = useState("driver-001"); // hardcoded for Nguyễn Văn A

  useEffect(() => {
    let mounted = true;
    // Fetch only deliveries assigned to this driver
    fetchDeliveries({ driverId }).then((d) => {
      if (mounted) setDeliveries(d);
    });
    return () => { mounted = false; };
  }, [driverId]);

  // Show only actionable deliveries (optional filter)
  const relevantStatuses: Delivery['status'][] = ['out-for-delivery', 'pickup_pending'];
  const displayedDeliveries = deliveries.filter(d => relevantStatuses.includes(d.status));

  const getStatusIcon = (status: Delivery['status']) => {
    switch (status) {
      case 'pickup_pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'received': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'sorted': return <Package className="h-4 w-4 text-purple-500" />;
      case 'export_pending': return <Package className="h-4 w-4 text-amber-500" />;
      case 'in-transit': return <Package className="h-4 w-4 text-blue-500" />;
      case 'out-for-delivery': return <Package className="h-4 w-4 text-blue-600" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Package className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'pickup_pending': return 'bg-orange-500';
      case 'received': return 'bg-orange-500';
      case 'sorted': return 'bg-purple-500';
      case 'export_pending': return 'bg-amber-500';
      case 'in-transit': return 'bg-blue-500';
      case 'out-for-delivery': return 'bg-blue-600';
      case 'delivered': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const openNavigation = (delivery: Delivery) => {
    // Mock navigation - in real app would open maps app
    alert(`Đang mở chỉ đường đến: ${delivery.address}`);
  };

  return (
    <DriverShell title="Bản đồ giao hàng" userName="Nguyễn Văn A" role="Bưu tá">
      <div className="space-y-4">
        {/* Real Map Background */}
        <div 
          className="relative w-full h-64 rounded-lg border overflow-hidden"
          style={{
            backgroundImage: `url('/images/map.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay for marker visibility */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Current Location Icon */}
          <div className="absolute w-6 h-6 shadow-xl z-30" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            {/* Current Location - Circle + Arrow */}
            <div 
              className="absolute w-6 h-6 shadow-xl z-20"
              style={{ 
                left: '50%', 
                top: '50%', 
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Main Circle */}
              <div 
                className="w-6 h-6 rounded-full border-2 border-white z-10"
                style={{
                  background: 'linear-gradient(135deg, #4285f4 0%, #34a853 50%, #4285f4 100%)',
                  boxShadow: '0 2px 12px rgba(66, 133, 244, 0.6)'
                }}
              />
              
              {/* Arrow Triangle */}
              <div 
                className="absolute w-3 h-2.5 -top-2 left-1.5 z-20"
                style={{
                  background: 'white',
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  borderRadius: '1px 1px 0 0'
                }}
              />
              
              {/* Pulse Animation */}
              <div className="absolute inset-0 w-6 h-6 border-2 border-blue-400/50 rounded-full animate-ping" />
            </div>

          </div>
          
          {/* Delivery Markers */}
          {displayedDeliveries.map((delivery, index) => (
            <div
              key={delivery.id}
              className={`absolute w-3 h-3 ${getStatusColor(delivery.status)} rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-all z-20 shadow-md`}
              style={{
                left: `${35 + index * 18}%`,
                top: `${30 + index * 12}%`
              }}
              onClick={() => setSelectedDelivery(delivery)}
            />
          ))}
          
          {/* Controls & Attribution */}
          <div className="absolute top-2 right-2 space-y-2 z-30">
            <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute bottom-2 left-2 text-xs text-white/90 bg-black/50 px-2 py-1 rounded z-30">
            Bản đồ TP.HCM
          </div>
        </div>

        {/* Delivery List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">
              Danh sách giao hàng ({displayedDeliveries.length})
            </h3>
            
            {/* Horizontal Legend - Scrollable */}
            <div className="flex items-center gap-3 text-xs overflow-x-auto pb-1">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Chờ lấy</span>
              </div>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Đang giao</span>
              </div>
            </div>
          </div>
          {displayedDeliveries.map((delivery) => (
            <div 
              key={delivery.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedDelivery?.id === delivery.id ? 'bg-blue-50 border-blue-200' : 'bg-background'
              }`}
              onClick={() => setSelectedDelivery(delivery)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(delivery.status)}
                    <span className="text-sm font-medium">{delivery.orderNumber}</span>
                    <span className="text-xs text-muted-foreground">{delivery.estimatedTime}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{delivery.customerName}</p>
                  <p className="text-xs text-muted-foreground truncate">{delivery.address}</p>
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
        </div>
    </DriverShell>
  );
}
