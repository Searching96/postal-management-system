import React from "react";
import { Card, Badge, Table } from "@/components";
import { Calendar } from "lucide-react";

export const DeliveryHistory: React.FC = () => {
  const deliveries = [
    {
      date: "26/01/2025",
      total: 15,
      success: 12,
      failed: 2,
      returning: 1,
      cod: 2500000,
    },
    {
      date: "25/01/2025",
      total: 18,
      success: 16,
      failed: 1,
      returning: 1,
      cod: 3200000,
    },
    {
      date: "24/01/2025",
      total: 12,
      success: 11,
      failed: 1,
      returning: 0,
      cod: 1800000,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          Lịch sử giao hàng
        </h1>
        <p className="text-secondary-600 mt-1">Xem lại các đơn hàng đã giao</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-secondary-600">Tuần này</p>
            <p className="text-2xl font-bold text-secondary-900 mt-1">45</p>
            <p className="text-xs text-green-600 mt-1">
              +12% so với tuần trước
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-secondary-600">Thành công</p>
            <p className="text-2xl font-bold text-green-600 mt-1">39</p>
            <p className="text-xs text-secondary-600 mt-1">86.7% tỷ lệ</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-secondary-600">Thất bại</p>
            <p className="text-2xl font-bold text-red-600 mt-1">4</p>
            <p className="text-xs text-secondary-600 mt-1">8.9% tỷ lệ</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-secondary-600">Tổng COD</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">7.5M</p>
            <p className="text-xs text-secondary-600 mt-1">VND</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Chi tiết theo ngày
        </h2>
        <Table
          columns={[
            { key: "date", label: "Ngày" },
            { key: "total", label: "Tổng đơn" },
            { key: "success", label: "Thành công" },
            { key: "failed", label: "Thất bại" },
            { key: "cod", label: "COD thu được" },
          ]}
          data={deliveries.map((d) => ({
            date: d.date,
            total: d.total,
            success: <Badge variant="success">{d.success}</Badge>,
            failed: <Badge variant="danger">{d.failed}</Badge>,
            cod: `${d.cod.toLocaleString()} VND`,
          }))}
        />
      </Card>
    </div>
  );
};
