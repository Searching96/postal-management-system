import { useState, useEffect } from "react";
import { Search, MapPin, Phone, Clock, Building2, ChevronRight } from "lucide-react";
import { Card, Input, Button, Badge, LoadingSpinner, Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui";
import { officeService, Office } from "../../services/officeService";

export function OfficeSearchPage() {
    const [search, setSearch] = useState("");
    const [offices, setOffices] = useState<Office[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const handleSearch = async (isNewSearch = false) => {
        if (isNewSearch) {
            setPage(0);
            setOffices([]);
            setHasMore(true);
        }

        setIsLoading(true);
        try {
            const currentPage = isNewSearch ? 0 : page;
            const res = await officeService.searchOffices(search, currentPage, 10);

            if (isNewSearch) {
                setOffices(res.content);
            } else {
                setOffices(prev => [...prev, ...res.content]);
            }

            setHasMore(!res.last);
            if (!isNewSearch) setPage(p => p + 1);
        } catch (error) {
            console.error("Failed to search offices", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        handleSearch(true);
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch(true);
    };

    const getStatusBadge = (office: Office) => {
        if (!office.isAcceptingOrders) {
            return <Badge variant="danger">Ngưng nhận hàng</Badge>;
        }
        if (office.isOpen) {
            return <Badge variant="success">Đang mở cửa</Badge>;
        }
        return <Badge variant="secondary">Đã đóng cửa</Badge>;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <div className="bg-white shadow">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Tra cứu Bưu cục</h1>
                    <p className="text-gray-500 mb-6">Tìm kiếm bưu cục gần bạn và kiểm tra giờ làm việc</p>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tên bưu cục, địa chỉ..."
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={() => handleSearch(true)} disabled={isLoading}>
                            Tìm kiếm
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
                {offices.length === 0 && !isLoading ? (
                    <div className="text-center py-10 text-gray-500">
                        <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Không tìm thấy bưu cục nào</p>
                    </div>
                ) : (
                    offices.map(office => (
                        <Card
                            key={office.officeId}
                            className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                            onClick={() => setSelectedOffice(office)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                        {office.officeName}
                                        {getStatusBadge(office)}
                                    </h3>
                                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>{office.officeAddressLine1}</span>
                                        </div>
                                        {office.officePhoneNumber && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 shrink-0" />
                                                <span>{office.officePhoneNumber}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 shrink-0" />
                                            <span>Giờ làm việc: {office.workingHours}</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400 mt-2" />
                            </div>
                        </Card>
                    ))
                )}

                {isLoading && (
                    <div className="flex justify-center py-4">
                        <LoadingSpinner />
                    </div>
                )}

                {!isLoading && hasMore && offices.length > 0 && (
                    <div className="text-center">
                        <Button variant="outline" onClick={() => handleSearch(false)}>
                            Xem thêm
                        </Button>
                    </div>
                )}
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedOffice} onOpenChange={(open) => !open && setSelectedOffice(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thông tin Bưu cục</DialogTitle>
                    </DialogHeader>

                    {selectedOffice && (
                        <div className="space-y-6 px-6 pb-6">
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <span className="font-medium text-gray-700">Trạng thái hoạt động</span>
                                {getStatusBadge(selectedOffice)}
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 border-b pb-2">Thông tin liên hệ</h4>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex items-start gap-3">
                                        <Building2 className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                                        <span className="font-bold text-gray-900">{selectedOffice.officeName}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                                        <span className="leading-relaxed">{selectedOffice.officeAddressLine1}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                                        <a href={`tel:${selectedOffice.officePhoneNumber}`} className="text-primary-600 hover:underline font-medium">
                                            {selectedOffice.officePhoneNumber}
                                        </a>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                                        <span>{selectedOffice.workingHours}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 border-b pb-2">Thông tin bổ sung</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Loại đơn vị</span>
                                        <span className="font-medium text-gray-900">{selectedOffice.officeType}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Khu vực</span>
                                        <span className="font-medium text-gray-900">{selectedOffice.provinceName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
