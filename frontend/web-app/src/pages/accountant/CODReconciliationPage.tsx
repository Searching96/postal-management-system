import React from "react";
import { Button, Card, Table, Badge } from "@/components";
import { Calculator, CheckCircle, DollarSign, TrendingUp } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface CODRecord {
  courierId: number;
  courierName: string;
  totalOrders: number;
  cashCollected: number;
  transferCollected: number;
  totalCollected: number;
  reconciled: boolean;
  reconciledAt?: Date;
}

export const CODReconciliationPage: React.FC = () => {
  const [records, setRecords] = React.useState<CODRecord[]>([]);
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>("TODAY");

  React.useEffect(() => {
    loadCODRecords();
  }, [selectedPeriod]);

  const loadCODRecords = () => {
    // Mock COD reconciliation data
    const mockRecords: CODRecord[] = [
      {
        courierId: 1,
        courierName: "Trần Văn Bình",
        totalOrders: 45,
        cashCollected: 12500000,
        transferCollected: 8300000,
        totalCollected: 20800000,
        reconciled: false,
      },
      {
        courierId: 2,
        courierName: "Lê Thị Mai",
        totalOrders: 38,
        cashCollected: 9800000,
        transferCollected: 6500000,
        totalCollected: 16300000,
        reconciled: true,
        reconciledAt: new Date(Date.now() - 3600000),
      },
      {
        courierId: 3,
        courierName: "Nguyễn Văn Cường",
        totalOrders: 52,
        cashCollected: 15200000,
        transferCollected: 11400000,
        totalCollected: 26600000,
        reconciled: false,
      },
      {
        courierId: 4,
        courierName: "Phạm Thị Lan",
        totalOrders: 41,
        cashCollected: 10900000,
        transferCollected: 7200000,
        totalCollected: 18100000,
        reconciled: true,
        reconciledAt: new Date(Date.now() - 7200000),
      },
    ];
    setRecords(mockRecords);
  };

  const handleReconcile = (courierId: number) => {
    const confirmed = window.confirm(
      "Xác nhận đối soát COD? Sau khi xác nhận, số tiền sẽ được ghi nhận vào hệ thống."
    );

    if (confirmed) {
      setRecords(
        records.map((r) =>
          r.courierId === courierId
            ? { ...r, reconciled: true, reconciledAt: new Date() }
            : r
        )
      );
      alert("Đối soát thành công!");
    }
  };

  const getTotalStats = () => {
    return {
      totalOrders: records.reduce((sum, r) => sum + r.totalOrders, 0),
      totalCash: records.reduce((sum, r) => sum + r.cashCollected, 0),
      totalTransfer: records.reduce((sum, r) => sum + r.transferCollected, 0),
      totalCollected: records.reduce((sum, r) => sum + r.totalCollected, 0),
      reconciledCount: records.filter((r) => r.reconciled).length,
      pendingCount: records.filter((r) => !r.reconciled).length,
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <Calculator size={28} />
            Đối soát COD
          </h1>
          <p className="text-secondary-600 mt-1">
            Xác nhận số tiền thu hộ từ bưu tá
          </p>
        </div>
        <div className="flex gap-3">
          {["TODAY", "YESTERDAY", "THIS_WEEK", "THIS_MONTH"].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "primary" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {
                {
                  TODAY: "Hôm nay",
                  YESTERDAY: "Hôm qua",
                  THIS_WEEK: "Tuần này",
                  THIS_MONTH: "Tháng này",
                }[period]
              }
            </Button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-600">Tổng thu hộ</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.totalCollected)}
                </p>
              </div>
            </div>
            <p className="text-xs text-secondary-600 mt-2">
              {stats.totalOrders} đơn hàng
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-600">Tiền mặt</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalCash)}
                </p>
              </div>
            </div>
            <p className="text-xs text-secondary-600 mt-2">
              {((stats.totalCash / stats.totalCollected) * 100).toFixed(1)}%
              tổng số
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Calculator size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-600">Chuyển khoản</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.totalTransfer)}
                </p>
              </div>
            </div>
            <p className="text-xs text-secondary-600 mt-2">
              {((stats.totalTransfer / stats.totalCollected) * 100).toFixed(1)}%
              tổng số
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <CheckCircle size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-600">Tiến độ đối soát</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.reconciledCount}/{records.length}
                </p>
              </div>
            </div>
            <p className="text-xs text-secondary-600 mt-2">
              {stats.pendingCount} bưu tá chưa đối soát
            </p>
          </div>
        </Card>
      </div>

      {/* COD Records Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Chi tiết đối soát theo Bưu tá
          </h3>
          <Table
            columns={[
              { key: "courier", label: "Bưu tá" },
              { key: "orders", label: "Số đơn" },
              { key: "cash", label: "Tiền mặt" },
              { key: "transfer", label: "Chuyển khoản" },
              { key: "total", label: "Tổng cộng" },
              { key: "status", label: "Trạng thái" },
              { key: "actions", label: "Thao tác" },
            ]}
            data={records.map((record) => ({
              courier: (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {record.courierName.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium">{record.courierName}</span>
                </div>
              ),
              orders: (
                <span className="font-semibold text-secondary-900">
                  {record.totalOrders}
                </span>
              ),
              cash: (
                <span className="font-mono text-sm">
                  {formatCurrency(record.cashCollected)}
                </span>
              ),
              transfer: (
                <span className="font-mono text-sm">
                  {formatCurrency(record.transferCollected)}
                </span>
              ),
              total: (
                <span className="font-mono text-sm font-bold text-primary-600">
                  {formatCurrency(record.totalCollected)}
                </span>
              ),
              status: record.reconciled ? (
                <div>
                  <Badge variant="success">Đã đối soát</Badge>
                  <p className="text-xs text-secondary-600 mt-1">
                    {formatDate(record.reconciledAt!)}
                  </p>
                </div>
              ) : (
                <Badge variant="warning">Chưa đối soát</Badge>
              ),
              actions: record.reconciled ? (
                <Button size="sm" variant="outline" disabled>
                  <CheckCircle size={16} />
                  Đã xác nhận
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleReconcile(record.courierId)}
                >
                  <CheckCircle size={16} />
                  Xác nhận đối soát
                </Button>
              ),
            }))}
          />
        </div>
      </Card>

      {/* Summary */}
      <Card>
        <div className="p-6 bg-primary-50">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">
            Tổng kết đối soát
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-primary-700 mb-1">Tổng số bưu tá</p>
              <p className="text-3xl font-bold text-primary-900">
                {records.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-700 mb-1">Đã đối soát</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.reconciledCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-700 mb-1">Chờ đối soát</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.pendingCount}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
