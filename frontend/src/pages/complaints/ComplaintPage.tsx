import { useState, useEffect, useMemo } from "react";
import {
    MessageSquare,
    Phone,
    User,
    Package,
    AlertCircle,
    Check,
    Clock,
    Smile,
    Box,
    DollarSign,
    AlertTriangle,
    ThumbsUp,
    PenTool
} from "lucide-react";
import {
    Card,
    Table,
    PageHeader,
    Badge,
    PaginationControls
} from "../../components/ui";

// --- Types ---
interface AspectScores {
    time: number;
    staff: number;
    quality: number;
    price: number;
}

interface Complaint {
    id: string;
    trackingNumber: string;
    senderName: string;
    senderPhone: string;
    creatorName: string;
    creatorPhone: string;
    shipperName: string; // Changed from string | null to string
    shipperPhone: string; // Changed from string | null to string
    status: string;
    description: string;
    aspects: AspectScores;
    createdAt: string;
}

// --- CSV Source ---
const CSV_SOURCE = `text,time,staff,quality,price,topic,style
"Dù đã đối soát thời gian giao, shipper vẫn tới muộn 30 phút và thái độ thiếu chuyên nghiệp.",0,0,-1,-1,Thái độ shipper giao hàng (bưu tá) chặng cuối,"Chủ shop Online chuyên nghiệp: Dùng thuật ngữ (hoàn hàng, leadtime, đối soát)."
"Đòi hỏi một chút lịch sự, nhân viên này lại nói bới mắt, mỉa mai tôi như đồ cũ!,-1,0,-1,-1,Thái độ nhân viên bưu cục (GDV) tại quầy gửi hàng,"Khách hàng giận dữ, bức xúc, dùng từ ngữ mạnh (có thể chửi thề nhẹ)."
"Gia cuoc duoc hien thi tren website thap hon duoc cho tinh trong, nhung khi xuat hoa don la cao hon",-1,-1,-1,0,"Trải nghiệm sử dụng App/Website (tracking, tạo đơn)","Người lớn tuổi/Nông dân: Câu cú lủng củng, dài dòng, sai lỗi chính tả, không dấu."
"Phí đền bù cao, mất tiền",-1,-1,-1,0,"Quy trình xử lý khiếu nại, đền bù, hoàn hàng","Review ngắn gọn, súc tích (dưới 10 từ), cộc lốc."
"Cuoc phi COD nhan duoc hoan toan bang tien mat, rat thich",-1,-1,-1,2,Dịch vụ thu hộ (COD) và đối soát tiền,"Gen Z: Dùng teencode (k, ko, dc, j, vs), viết tắt, không dấu, slang."
"Giá cước hợp lý, nhưng leadtime giao hàng tới các tỉnh lẻ vẫn trên 6 ngày, cần cải thiện.",0,-1,-1,2,"Thời gian vận chuyển liên tỉnh (Hà Nội - SG, đi tỉnh lẻ)","Chủ shop Online chuyên nghiệp: Dùng thuật ngữ (hoàn hàng, leadtime, đối soát)."
"Quá trình đối soát nhanh, nhưng thùng hàng bị rạch nhẹ, vẫn yêu cầu đổi mới để đảm bảo chất lượng.",-1,-1,0,-1,"Tình trạng hàng hóa khi nhận (vỡ, móp, ướt, mất seal, bị rạch)","Chủ shop Online chuyên nghiệp: Dùng thuật ngữ (hoàn hàng, leadtime, đối soát)."
"Đối soát tiền sai sót liên tục, phải gọi điện hàng chục lần mới sửa được!",0,0,-1,-1,Dịch vụ thu hộ (COD) và đối soát tiền,"Khách hàng giận dữ, bức xúc, dùng từ ngữ mạnh (có thể chửi thề nhẹ)."
"GDV tại quầy rất chuyên nghiệp, giải quyết đối soát phí vận chuyển nhanh chóng, mình rất hài lòng.",-1,2,-1,-1,Thái độ nhân viên bưu cục (GDV) tại quầy gửi hàng,"Chủ shop Online chuyên nghiệp: Dùng thuật ngữ (hoàn hàng, leadtime, đối soát)."
"Giá cước vừa phải, thời gian giao hàng đúng hẹn, nhưng có phí thu thêm không rõ ràng.,2,-1,-1,0,Giá cước vận chuyển và các loại phí phát sinh,Review trung lập: Khen cái này nhưng chê cái kia (Mixed sentiment)."
"Mình rất ấn tượng với thái độ của bưu tá cuối chặng, nhanh nhẹn và luôn hỏi thăm sức khỏe người nhận.",2,2,-1,-1,Thái độ shipper giao hàng (bưu tá) chặng cuối,"Khách hàng vui vẻ, dễ tính, khen ngợi nhiệt tình."
"Chi phí bồi thường hợp lý, không quá cao.",-1,-1,-1,2,"Quy trình xử lý khiếu nại, đền bù, hoàn hàng","Review ngắn gọn, súc tích (dưới 10 từ), cộc lốc."
"Truy cap app qua dien thoai cu, van khong duoc hien thi du thong tin, doi ro gap nuoc lan",0,-1,-1,-1,"Trải nghiệm sử dụng App/Website (tracking, tạo đơn)","Người lớn tuổi/Nông dân: Câu cú lủng củng, dài dòng, sai lỗi chính tả, không dấu."
"Thái độ vui vẻ, hỗ trợ nhiệt tình",-1,2,-1,-1,"Quy trình xử lý khiếu nại, đền bù, hoàn hàng","Review ngắn gọn, súc tích (dưới 10 từ), cộc lốc."
"Giá rẻ nhưng hàng bị ướt, phải trả thêm phí làm khô.",-1,-1,0,2,"Tình trạng hàng hóa khi nhận (vỡ, móp, ướt, mất seal, bị rạch)",Review trung lập: Khen cái này nhưng chê cái kia (Mixed sentiment).
"Phi thu ho gan voi con thoi, dung 0,5 trieu",-1,-1,-1,2,Dịch vụ thu hộ (COD) và đối soát tiền,"Gen Z: Dùng teencode (k, ko, dc, j, vs), viết tắt, không dấu, slang."
"Quá trình khiếu nại chỉ mất 2 ngày, mọi thứ ổn",2,-1,-1,-1,"Quy trình xử lý khiếu nại, đền bù, hoàn hàng","Gen Z: Dùng teencode (k, ko, dc, j, vs), viết tắt, không dấu, slang."
"Sau khi hoàn hàng, tôi được hoàn tiền phí giao nhận, giá cước thực tế rất hợp lý.",-1,-1,-1,2,Giá cước vận chuyển và các loại phí phát sinh,"Chủ shop Online chuyên nghiệp: Dùng thuật ngữ (hoàn hàng, leadtime, đối soát)."
"Giá cước hợp lý, nhân viên giao nhanh, và hàng không bị vỡ nát, thực sự tốt.",2,2,2,2,"Tình trạng hàng hóa khi nhận (vỡ, móp, ướt, mất seal, bị rạch)","Khách hàng vui vẻ, dễ tính, khen ngợi nhiệt tình."
"Shipper giao hàng nhanh trong vòng 30 phút, nhân viên luôn vui vẻ và chu đáo.",2,2,-1,-1,Thái độ shipper giao hàng (bưu tá) chặng cuối,"Khách hàng vui vẻ, dễ tính, khen ngợi nhiệt tình."
"Dịch vụ khiếu nại online cực kỳ tiện lợi, mình nhận được phản hồi trong vòng 2 tiếng và được bù hoàn đầy đủ.",2,-1,-1,2,"Quy trình xử lý khiếu nại, đền bù, hoàn hàng","Khách hàng vui vẻ, dễ tính, khen ngợi nhiệt tình."
"Quy trình trả hàng cực kỳ đơn giản, chỉ cần gửi mail, staff phản hồi nhanh, không mất thời gian",2,2,-1,-1,"Quy trình xử lý khiếu nại, đền bù, hoàn hàng","Gen Z: Dùng teencode (k, ko, dc, j, vs), viết tắt, không dấu, slang."
"Giac nho lau loi moi, nhan vien ke chat khong danh thu, canh giao tiep",-1,2,-1,-1,Thái độ nhân viên bưu cục (GDV) tại quầy gửi hàng,"Người lớn tuổi/Nông dân: Câu cú lủng củng, dài dòng, sai lỗi chính tả, không dấu."
"Đội ngũ GDV trung thực, hỗ trợ xác nhận leadtime và đặt lịch giao hàng đúng hẹn",-1,2,-1,-1,Thái độ nhân viên bưu cục (GDV) tại quầy gửi hàng,"Chủ shop Online chuyên nghiệp: Dùng thuật ngữ (hoàn hàng, leadtime, đối soát)."
"Mặc dù phí thu hộ là cần thiết, nhưng công ty vẫn giữ mức phí hợp lý và giao hàng đúng hẹn.",2,-1,-1,2,Giá cước vận chuyển và các loại phí phát sinh,Review trung lập: Khen cái này nhưng chê cái kia (Mixed sentiment).
Giá cước hiển thị trên app tăng gấp đôi mà không có bất cứ giải thích nào!,-1,-1,-1,0,"Trải nghiệm sử dụng App/Website (tracking, tạo đơn)","Khách hàng giận dữ, bức xúc, dùng từ ngữ mạnh (có thể chửi thề nhẹ)."
"Bao bì ướt dính nước, seal rách, ảnh hưởng tới chất lượng sản phẩm, mong hoàn hàng và báo cáo leadtime.",-1,-1,0,-1,"Tình trạng hàng hóa khi nhận (vỡ, móp, ướt, mất seal, bị rạch)","Chủ shop Online chuyên nghiệp: Dùng thuật ngữ (hoàn hàng, leadtime, đối soát)."
"Bao gia rat thap, shipper cuoi chuyen van noi huong noi cu suong la la, cau khong muon",-1,0,-1,2,Thái độ shipper giao hàng (bưu tá) chặng cuối,"Người lớn tuổi/Nông dân: Câu cú lủng củng, dài dòng, sai lỗi chính tả, không dấu."
"Ứng dụng tạo đơn dễ dàng, nhưng giao diện còn lộn xộn, thời gian giao hàng trung bình, giá cước vừa phải.",1,-1,-1,1,"Trải nghiệm sử dụng App/Website (tracking, tạo đơn)",Review trung lập: Khen cái này nhưng chê cái kia (Mixed sentiment).
"Nhân viên làm mình cảm thấy được tôn trọng, giải quyết nhanh",2,2,-1,-1,"Quy trình xử lý khiếu nại, đền bù, hoàn hàng","Gen Z: Dùng teencode (k, ko, dc, j, vs), viết tắt, không dấu, slang."`;

// --- Helpers ---
const randomItem = <T,>(arr: T[]): T | undefined => {
    if (!arr || arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const FIRST_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng"];
const MIDDLE_NAMES = ["Văn", "Thị", "Hữu", "Minh", "Thanh", "Đức", "Quốc", "Ngọc", "Xuân"];
const LAST_NAMES = ["An", "Bình", "Cường", "Dung", "Giang", "Hải", "Hùng", "Hương", "Khánh", "Lan", "Minh", "Nam", "Nghĩa", "Phúc", "Quân", "Sơn", "Thảo", "Trang", "Tùng", "Vinh"];

const generateName = () => {
    const first = randomItem(FIRST_NAMES) || "Nguyễn";
    const middle = randomItem(MIDDLE_NAMES) || "Văn";
    const last = randomItem(LAST_NAMES) || "An";
    return `${first} ${middle} ${last}`;
};
const generatePhone = () => `09${randomInt(10000000, 99999999)}`;
const generateTracking = () => `VN${randomInt(100000000, 999999999)}`;

// Safe integer parsing
const safeParseInt = (val: string): number => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? -1 : parsed;
};

const parseCSVData = (csv: string) => {
    if (!csv) return [];

    const rows = csv.split('\n').slice(1);

    return rows.map(line => {
        if (!line.trim()) return null;

        const matches = line.match(/(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g);
        if (!matches || matches.length < 7) return null;

        const cols = matches.map(m => m.replace(/^,/, '').replace(/^"|"$/g, '').trim());
        const [text, time, staff, quality, price, topic, style] = cols;

        if (!text) return null;

        return {
            description: text,
            aspects: {
                time: safeParseInt(time),
                staff: safeParseInt(staff),
                quality: safeParseInt(quality),
                price: safeParseInt(price)
            },
        };
    }).filter((item): item is { description: string, aspects: AspectScores } => item !== null);
};

export function ComplaintPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [page, setPage] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        const parsedItems = parseCSVData(CSV_SOURCE);

        if (parsedItems.length === 0) {
            console.warn("No data parsed from CSV");
            return;
        }

        const now = new Date();

        // 1. Complaint Items: At least one aspect is 0
        const complaintItems = parsedItems.filter(item =>
            Object.values(item.aspects).some(score => score === 0)
        );

        // 2. Predefined User Item
        // Ensure shipper name is real
        const predefinedItem: Complaint = {
            id: "predefined-1",
            trackingNumber: "VN918273645",
            senderName: "Trần Nguyễn Đức Phúc",
            senderPhone: "0912345678",
            creatorName: "Trần Thị Hồng",
            creatorPhone: "0993334444",
            shipperName: "Lê Văn Hùng", // Real Name
            shipperPhone: "0979000008",
            status: "PENDING",
            description: "Shipper thái độ thô lỗ, trả lời cọc cằn, cũng may la hang giao nhanh chứ ko thì ko dung dịch vụ nãy nữa.",
            aspects: { time: 2, staff: 0, quality: -1, price: -1 },
            createdAt: now.toISOString()
        };

        // 3. Random 1 Pending Item
        let randomSource = randomItem(complaintItems);
        if (!randomSource) {
            randomSource = randomItem(parsedItems) || {
                description: "Không có dữ liệu",
                aspects: { time: 0, staff: -1, quality: -1, price: -1 },
            };
        }

        const randomPendingItem: Complaint = {
            id: "pending-1",
            trackingNumber: generateTracking(),
            senderName: generateName(),
            senderPhone: generatePhone(),
            creatorName: "Trần Thị Hồng",
            creatorPhone: "0993334444",
            shipperName: generateName(), // Always present, real name
            shipperPhone: generatePhone(),
            status: "PENDING",
            description: randomSource.description,
            aspects: randomSource.aspects,
            createdAt: new Date(now.getTime() - randomInt(1, 24) * 60 * 60 * 1000).toISOString()
        };

        // 4. Random 36 History Items
        const historyItems: Complaint[] = Array.from({ length: 36 }).map((_, idx) => {
            const source = randomItem(parsedItems)!;
            return {
                id: `history-${idx}`,
                trackingNumber: generateTracking(),
                senderName: generateName(),
                senderPhone: generatePhone(),
                creatorName: generateName(),
                creatorPhone: generatePhone(),
                shipperName: generateName(), // Always present, real name
                shipperPhone: generatePhone(),
                status: "RESOLVED",
                description: source.description,
                aspects: source.aspects,
                createdAt: new Date(now.getTime() - randomInt(2, 30) * 24 * 60 * 60 * 1000).toISOString()
            };
        });

        setComplaints([predefinedItem, randomPendingItem, ...historyItems]);
    }, []);

    const pendingComplaints = useMemo(() =>
        complaints.filter(c => c.status === "PENDING"),
        [complaints]);

    const resolvedComplaints = useMemo(() =>
        complaints.filter(c => c.status !== "PENDING"),
        [complaints]);

    const paginatedHistory = useMemo(() => {
        const start = page * pageSize;
        return resolvedComplaints.slice(start, start + pageSize);
    }, [resolvedComplaints, page]);

    const handleResolve = (id: string) => {
        setComplaints(prev => prev.map(c =>
            c.id === id ? { ...c, status: "RESOLVED" } : c
        ));
    };

    const renderAspectBadges = (aspects: AspectScores, targetScore: number) => {
        const badgeConfig: Record<string, { label: string; icon: any }> = {
            time: { label: "Thời gian", icon: Clock },
            staff: { label: "Nhân viên", icon: Smile },
            quality: { label: "Hàng hóa", icon: Box },
            price: { label: "Giá cước", icon: DollarSign },
        };

        const activeAspects = Object.entries(aspects).filter(([_, score]) => score === targetScore);

        if (activeAspects.length === 0) return <span className="text-gray-300 text-xs">-</span>;

        return (
            <div className="flex flex-wrap gap-1.5 justify-center">
                {activeAspects.map(([key]) => {
                    const config = badgeConfig[key];
                    const Icon = config.icon;
                    return (
                        <Badge
                            key={key}
                            variant={targetScore === 0 ? "destructive" : "success"}
                            className="flex items-center gap-1 text-xs whitespace-nowrap px-2 py-0.5"
                        >
                            <Icon className="h-3 w-3" />
                            {config.label}
                        </Badge>
                    );
                })}
            </div>
        );
    };

    const ComplaintTable = ({ data, showActions = false }: { data: Complaint[], showActions?: boolean }) => (
        <div className="overflow-x-auto">
            <Table>
                <thead>
                    <tr>
                        <th className="py-3 px-4 text-left w-[120px]">Mã đơn hàng</th>

                        <th className="py-3 px-4 text-left">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                Người gửi
                            </div>
                        </th>

                        {/* Creator Column */}
                        <th className="py-3 px-4 text-left">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                Nhân viên tạo
                            </div>
                        </th>

                        {/* Shipper Column */}
                        <th className="py-3 px-4 text-left">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                Bưu tá
                            </div>
                        </th>

                        <th className="py-3 px-4 text-left">Nội dung chi tiết</th>

                        <th className="py-3 px-4 text-center w-[160px]">
                            <div className="flex items-center justify-center gap-2 text-red-600 font-semibold">
                                <AlertTriangle className="h-4 w-4" />
                                Phản ánh
                            </div>
                        </th>

                        <th className="py-3 px-4 text-center w-[160px]">
                            <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                                <ThumbsUp className="h-4 w-4" />
                                Khen ngợi
                            </div>
                        </th>

                        {showActions && <th className="py-3 px-4 text-right w-[80px]">Xử lý</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={showActions ? 8 : 7} className="text-center py-8 text-gray-500">
                                <div className="flex flex-col items-center justify-center p-4">
                                    <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                                    <p>Không có dữ liệu</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((complaint) => (
                            <tr key={complaint.id} className="border-t hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4 align-top">
                                    <div className="font-medium text-primary-600 flex items-center gap-1">
                                        <Package className="h-3.5 w-3.5" />
                                        {complaint.trackingNumber}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(complaint.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>

                                {/* Sender */}
                                <td className="py-4 px-4 align-top">
                                    <div className="text-sm font-medium text-gray-900">
                                        {complaint.senderName}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Phone className="h-3 w-3" />
                                        {complaint.senderPhone}
                                    </div>
                                </td>

                                {/* Creator */}
                                <td className="py-4 px-4 align-top">
                                    <div className="text-sm font-medium text-gray-900">
                                        {complaint.creatorName}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Phone className="h-3 w-3" />
                                        {complaint.creatorPhone}
                                    </div>
                                </td>

                                {/* Shipper - Guaranteed to be present */}
                                <td className="py-4 px-4 align-top">
                                    <div className="text-sm font-medium text-gray-900">
                                        {complaint.shipperName}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Phone className="h-3 w-3" />
                                        {complaint.shipperPhone}
                                    </div>
                                </td>

                                <td className="py-4 px-4 align-top">
                                    <p className="text-sm text-gray-700 leading-relaxed" title={complaint.description}>
                                        {complaint.description}
                                    </p>
                                </td>

                                <td className="py-4 px-4 text-center align-top bg-red-50/40 border-l border-red-100">
                                    {renderAspectBadges(complaint.aspects, 0)}
                                </td>

                                <td className="py-4 px-4 text-center align-top bg-green-50/40 border-l border-green-100">
                                    {renderAspectBadges(complaint.aspects, 2)}
                                </td>

                                {showActions && (
                                    <td className="py-4 px-4 text-right align-top">
                                        <button
                                            onClick={() => handleResolve(complaint.id)}
                                            className="p-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors shadow-sm border border-green-200"
                                            title="Đánh dấu đã giải quyết"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="Phân tích ý kiến khách hàng"
                description="Hệ thống tự động phân loại khiếu nại (0) và khen ngợi (2) từ phản hồi"
            />

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
                    Phê bình gần đây
                    <Badge variant="warning" className="ml-2">{pendingComplaints.length}</Badge>
                </h2>
                <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                    <ComplaintTable data={pendingComplaints} showActions={true} />
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                    Lịch sử ghi nhận
                    <Badge variant="secondary" className="ml-2">{resolvedComplaints.length}</Badge>
                </h2>
                <Card className="p-0 overflow-hidden shadow-sm">
                    <ComplaintTable data={paginatedHistory} />
                    {resolvedComplaints.length > 0 && (
                        <div className="border-t border-gray-100 bg-gray-50/50">
                            <PaginationControls
                                page={page}
                                totalPages={Math.ceil(resolvedComplaints.length / pageSize)}
                                totalElements={resolvedComplaints.length}
                                pageSize={pageSize}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}