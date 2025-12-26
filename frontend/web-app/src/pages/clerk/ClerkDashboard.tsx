import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components";
import { Plus, Search, FileText } from "lucide-react";

export const ClerkDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          Bảng điều khiển Nhân viên tiếp nhận
        </h1>
        <p className="text-secondary-600 mt-1">
          Quản lý tiếp nhận và tra cứu đơn hàng
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/reception/create")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Plus className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Tiếp nhận đơn hàng
          </h3>
          <p className="text-sm text-secondary-600">
            Tạo vận đơn mới cho khách hàng
          </p>
        </Card>

        <Card
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/orders")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <Search className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Tra cứu đơn hàng
          </h3>
          <p className="text-sm text-secondary-600">
            Kiểm tra trạng thái vận đơn
          </p>
        </Card>

        <Card
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/complaints/create")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-50 p-3 rounded-lg">
              <FileText className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Tiếp nhận khiếu nại
          </h3>
          <p className="text-sm text-secondary-600">
            Ghi nhận khiếu nại từ khách hàng
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Đơn hàng hôm nay
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">24</p>
            <p className="text-sm text-secondary-600 mt-1">Đơn đã tiếp nhận</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">18</p>
            <p className="text-sm text-secondary-600 mt-1">Đơn đang xử lý</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">3</p>
            <p className="text-sm text-secondary-600 mt-1">
              Khiếu nại tiếp nhận
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
