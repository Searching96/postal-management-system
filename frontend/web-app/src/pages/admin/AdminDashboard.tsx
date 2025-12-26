import React from "react";
import { Card } from "@/components";
import { Users, DollarSign, BarChart, Settings } from "lucide-react";

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          Bảng điều khiển Quản trị viên
        </h1>
        <p className="text-secondary-600 mt-1">Quản lý toàn bộ hệ thống</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Tổng người dùng</p>
              <p className="text-2xl font-bold text-secondary-900 mt-1">
                1,234
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Doanh thu tháng</p>
              <p className="text-2xl font-bold text-secondary-900 mt-1">
                2.5B VND
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Bưu cục hoạt động</p>
              <p className="text-2xl font-bold text-secondary-900 mt-1">87</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <BarChart className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Cấu hình hệ thống</p>
              <p className="text-2xl font-bold text-secondary-900 mt-1">
                Active
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <Settings className="text-orange-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Hoạt động gần đây
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-secondary-100">
            <div>
              <p className="text-sm font-medium text-secondary-900">
                Cập nhật bảng giá
              </p>
              <p className="text-xs text-secondary-600">Hôm qua lúc 14:30</p>
            </div>
            <span className="text-xs text-green-600">Hoàn thành</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-secondary-100">
            <div>
              <p className="text-sm font-medium text-secondary-900">
                Thêm người dùng mới
              </p>
              <p className="text-xs text-secondary-600">2 ngày trước</p>
            </div>
            <span className="text-xs text-green-600">Hoàn thành</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
