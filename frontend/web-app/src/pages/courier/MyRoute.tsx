import React from "react";
import { Card, Badge } from "@/components";
import { MapPin, Package, Phone, CheckCircle } from "lucide-react";

export const MyRoute: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          Tuyến giao hàng của tôi
        </h1>
        <p className="text-secondary-600 mt-1">
          Quản lý các đơn hàng được phân công
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="bg-blue-50 p-3 rounded-lg inline-block mb-3">
              <Package className="text-blue-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-secondary-900">12</p>
            <p className="text-sm text-secondary-600 mt-1">Đơn cần giao</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="bg-green-50 p-3 rounded-lg inline-block mb-3">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-secondary-900">8</p>
            <p className="text-sm text-secondary-600 mt-1">
              Đã giao thành công
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="bg-orange-50 p-3 rounded-lg inline-block mb-3">
              <MapPin className="text-orange-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-secondary-900">4</p>
            <p className="text-sm text-secondary-600 mt-1">Đơn còn lại</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Danh sách đơn hàng hôm nay
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-start justify-between p-4 border border-secondary-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-secondary-900">
                    VN20250126000{item}VN
                  </span>
                  <Badge variant="warning">Chưa giao</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-600 mb-1">
                  <MapPin size={14} />
                  <span>123 Nguyễn Văn Cừ, Q.5, TP.HCM</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-600">
                  <Phone size={14} />
                  <span>0912345678 - Nguyễn Văn A</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-secondary-900">
                  COD: 500,000 VND
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
