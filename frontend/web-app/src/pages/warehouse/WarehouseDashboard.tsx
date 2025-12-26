import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components";
import { Package, ClipboardList, Scan, QrCode } from "lucide-react";

export const WarehouseDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          Bảng điều khiển Kho bãi
        </h1>
        <p className="text-secondary-600 mt-1">
          Quản lý bảng kê và quét mã vận đơn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/manifest/create")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <ClipboardList className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Tạo bảng kê
          </h3>
          <p className="text-sm text-secondary-600">Lập bảng kê vận chuyển</p>
        </Card>

        <Card
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/scan/package")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <Scan className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Quét kiện hàng
          </h3>
          <p className="text-sm text-secondary-600">Quét mã vận đơn</p>
        </Card>

        <Card
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/scan/manifest")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <QrCode className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Quét bảng kê
          </h3>
          <p className="text-sm text-secondary-600">Quét mã bảng kê</p>
        </Card>

        <Card
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/warehouse/manifests")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-50 p-3 rounded-lg">
              <Package className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Danh sách bảng kê
          </h3>
          <p className="text-sm text-secondary-600">Xem tất cả bảng kê</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Thống kê hôm nay
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">156</p>
            <p className="text-sm text-secondary-600 mt-1">Kiện đã quét</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">12</p>
            <p className="text-sm text-secondary-600 mt-1">Bảng kê mới</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">8</p>
            <p className="text-sm text-secondary-600 mt-1">Bảng kê đóng</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">234</p>
            <p className="text-sm text-secondary-600 mt-1">Kiện trong kho</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
