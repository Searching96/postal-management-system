import { useState, useEffect } from "react";
import { Plus, Search, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";
import {
    Card,
    Button,
    Input,
    Table,
    PageHeader,
    Tabs,
    TabsList,
    TabsTrigger
} from "../../components/ui";
import { batchService, BatchPackageResponse } from "../../services/batchService";
import { BatchStatusBadge } from "../../components/batch/BatchStatusBadge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function BatchListPage() {
    const navigate = useNavigate();
    const [batches, setBatches] = useState<BatchPackageResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("outgoing");
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchBatches = async () => {
        setIsLoading(true);
        try {
            const res = activeTab === "outgoing"
                ? await batchService.getBatches({ page, size: 10 })
                : await batchService.getIncomingBatches({ page, size: 10 });

            if (res.success) {
                setBatches(res.data.content);
                setTotalPages(res.data.totalPages);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách kiện hàng");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, [page, activeTab]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <PageHeader
                    title="Quản lý Kiện hàng"
                    description="Quản lý việc gom đơn và đóng gói vận chuyển giữa các bưu cục"
                />
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => toast.info("Tính năng Tự động gom kiện đang phát triển")}>
                        <Plus className="mr-2 h-4 w-4" /> Tự động gom kiện
                    </Button>
                    <Button onClick={() => toast.info("Tính năng Tạo kiện hàng đang phát triển")}>
                        <Plus className="mr-2 h-4 w-4" /> Tạo kiện hàng mới
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="outgoing">Kiện hàng gửi đi</TabsTrigger>
                    <TabsTrigger value="incoming">Kiện hàng đang đến</TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm theo mã kiện hàng..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" onClick={fetchBatches}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>

                    <Card>
                        <Table>
                            <thead>
                                <tr>
                                    <th className="text-left py-3 px-4">Mã kiện hàng</th>
                                    <th className="text-left py-3 px-4">
                                        {activeTab === "outgoing" ? "Điểm đến" : "Điểm đi"}
                                    </th>
                                    <th className="text-center py-3 px-4">Số lượng đơn</th>
                                    <th className="text-center py-3 px-4">Khối lượng</th>
                                    <th className="text-center py-3 px-4">Trạng thái</th>
                                    <th className="text-right py-3 px-4">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={6} className="text-center py-12 text-gray-500">Đang tải dữ liệu...</td></tr>
                                ) : batches.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-12 text-gray-500">Không tìm thấy kiện hàng nào</td></tr>
                                ) : (
                                    batches.map((batch) => (
                                        <tr key={batch.id} className="border-t hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-medium uppercase">{batch.batchCode}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {activeTab === "outgoing" ? (
                                                        <>
                                                            <ArrowRight className="h-3 w-3 text-gray-400" />
                                                            <span>{batch.destinationOfficeName}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ArrowLeft className="h-3 w-3 text-gray-400" />
                                                            <span>{batch.originOfficeName}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">{batch.orderCount}</td>
                                            <td className="py-3 px-4 text-center">{batch.totalWeight} kg</td>
                                            <td className="py-3 px-4 text-center">
                                                <BatchStatusBadge status={batch.status} />
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/batches/${batch.id}`)}
                                                >
                                                    Chi tiết
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Card>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                disabled={page === 0}
                                onClick={() => setPage(page - 1)}
                            >
                                Trước
                            </Button>
                            <span className="flex items-center px-4 font-medium">
                                Trang {page + 1} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(page + 1)}
                            >
                                Sau
                            </Button>
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
}
