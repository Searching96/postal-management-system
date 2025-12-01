import PostalWorkerShell from "@/components/PostalWorkerShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ArrowUpDown, Truck, Clock, CheckCircle, List, MessageSquare, AlertCircle, House } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchPostalWorkerStats, PostalWorkerStats } from "@/services/mockApi";


interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}


export default function PostalWorkerIndex() {
  const [stats, setStats] = useState<PostalWorkerStats | null>(null);

  useEffect(() => {
    fetchPostalWorkerStats().then(setStats);
  }, []);

  const statsData: StatsCardProps[] = [
    { title: "Hàng chờ nhận", value: stats?.pendingIngest ?? 0, icon: <Package className="h-6 w-6" />, color: "text-blue-500" },
    { title: "Đã phân loại", value: stats?.sorted ?? 0, icon: <ArrowUpDown className="h-6 w-6" />, color: "text-green-500" },
    { title: "Chờ xuất kho", value: stats?.pendingDispatch ?? 0, icon: <Truck className="h-6 w-6" />, color: "text-orange-500" },
    { title: "Hoàn thành", value: stats?.completedToday ?? 0, icon: <CheckCircle className="h-6 w-6" />, color: "text-purple-500" },
  ];


  return (
    <PostalWorkerShell title="Dashboard" userName="Nguyễn Thị E" role="Nhân viên bưu điện">
      <div className="space-y-6">
        {/* Stats Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Thống kê hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map((stat, index) => (
                <div key={index} className="p-4 bg-muted/30 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className={stat.color}>{stat.icon}</div>
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Link to="/postal-worker/package">
                  <Button variant="outline" className="justify-start h-12 w-full">
                    <Package className="h-4 w-4 mr-3" />
                    Nhận kiện hàng
                  </Button>
                </Link>
                <Link to="/postal-worker/packages">
                  <Button variant="outline" className="justify-start h-12 w-full">
                    <List className="h-4 w-4 mr-3" />
                    Tra cứu & In tem
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Support Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hỗ trợ khách hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Link to="/postal-worker/complaints">
                  <Button variant="outline" className="justify-start h-12 w-full">
                    <MessageSquare className="h-4 w-4 mr-3" />
                    Giải quyết khiếu nại
                  </Button>
                </Link>
                <Link to="/postal-worker/tickets">
                  <Button variant="outline" className="justify-start h-12 w-full">
                    <AlertCircle className="h-4 w-4 mr-3" />
                    Quản lý ticket
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "10:30", action: "Nhận 15 kiện hàng từ xe thu gom", status: "completed" },
                { time: "09:45", action: "Phân loại 32 kiện hàng Q1-Q3", status: "completed" },
                { time: "09:15", action: "Xuất kho 28 kiện cho tuyến A", status: "completed" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PostalWorkerShell>
  );
}
