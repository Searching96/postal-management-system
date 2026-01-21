import { useState } from 'react';
import { Package, Box, Truck, CheckSquare, Search, Filter, AlertCircle, Play, CheckCircle2, Container } from 'lucide-react';
import { Packing3DAnimation, PackingAnimationData } from '../../components/staff/Packing3DAnimation';

// Helper for random VN ID (VN + 6 digits)
const getRandomId = () => {
    const randomNum = Math.floor(Math.random() * 1000000);
    return `VN${randomNum.toString().padStart(6, '0')}`;
};

const BATCH_1_ID = getRandomId();
const BATCH_2_ID = getRandomId();
const BATCH_3_ID = getRandomId();

// MOCKED DATA from research (Bundle Packing)
const MOCK_BATCHES: PackingAnimationData[] = [
    {
        "id": BATCH_1_ID,
        "type": "MEDIUM",
        "dim_l": 675,
        "dim_w": 500,
        "dim_h": 416,
        "items": 4,
        "fill_rate": "69.4%",
        "placements": [
            { "order": 0, "id": getRandomId(), "x": 0, "y": 0, "z": 0, "l": 400, "w": 375, "h": 183, "color": "#42A5F5" },
            { "order": 1, "id": getRandomId(), "x": 400, "y": 0, "z": 0, "l": 183, "w": 500, "h": 300, "color": "#64B5F6" },
            { "order": 2, "id": getRandomId(), "x": 0, "y": 0, "z": 183, "l": 400, "w": 350, "h": 183, "color": "#42A5F5" },
            { "order": 3, "id": getRandomId(), "x": 0, "y": 375, "z": 0, "l": 400, "w": 110, "h": 300, "color": "#90CAF9" }
        ]
    },
    {
        "id": BATCH_2_ID,
        "type": "MEDIUM",
        "dim_l": 675,
        "dim_w": 500,
        "dim_h": 450,
        "items": 4,
        "fill_rate": "73.1%",
        "placements": [
            { "order": 0, "id": getRandomId(), "x": 0, "y": 0, "z": 0, "l": 337, "w": 400, "h": 183, "color": "#64B5F6" },
            { "order": 1, "id": getRandomId(), "x": 337, "y": 0, "z": 0, "l": 183, "w": 400, "h": 337, "color": "#64B5F6" },
            { "order": 2, "id": getRandomId(), "x": 0, "y": 0, "z": 183, "l": 337, "w": 400, "h": 183, "color": "#64B5F6" },
            { "order": 3, "id": getRandomId(), "x": 520, "y": 0, "z": 0, "l": 137, "w": 450, "h": 400, "color": "#42A5F5" }
        ]
    },
    {
        "id": BATCH_3_ID,
        "type": "SMALL",
        "dim_l": 450,
        "dim_w": 300,
        "dim_h": 400,
        "items": 16,
        "fill_rate": "95.2%",
        "placements": [
            { "order": 0, "id": getRandomId(), "x": 0, "y": 0, "z": 0, "l": 225, "w": 150, "h": 137, "color": "#BBDEFB" },
            { "order": 1, "id": getRandomId(), "x": 225, "y": 0, "z": 0, "l": 225, "w": 150, "h": 137, "color": "#BBDEFB" },
            { "order": 2, "id": getRandomId(), "x": 0, "y": 150, "z": 0, "l": 225, "w": 150, "h": 137, "color": "#BBDEFB" },
            { "order": 3, "id": getRandomId(), "x": 225, "y": 150, "z": 0, "l": 225, "w": 150, "h": 137, "color": "#BBDEFB" },
            { "order": 4, "id": getRandomId(), "x": 0, 'y': 0, "z": 137, "l": 225, "w": 150, "h": 137, "color": "#BBDEFB" },
            { "order": 5, "id": getRandomId(), "x": 225, 'y': 0, "z": 137, "l": 225, "w": 150, "h": 137, "color": "#BBDEFB" },
            { "order": 6, "id": getRandomId(), "x": 0, 'y': 150, "z": 137, "l": 225, "w": 150, "h": 137, "color": "#BBDEFB" },
            { "order": 7, "id": getRandomId(), "x": 225, 'y': 150, "z": 137, "l": 137, "w": 150, "h": 200, "color": "#BBDEFB" },
            { "order": 8, "id": getRandomId(), "x": 362, 'y': 150, "z": 137, "l": 44, "w": 150, "h": 180, "color": "#E3F2FD" },
            { "order": 9, "id": getRandomId(), "x": 406, 'y': 150, "z": 137, "l": 44, "w": 150, "h": 180, "color": "#E3F2FD" },
            { "order": 10, "id": getRandomId(), "x": 0, 'y': 0, "z": 274, "l": 180, "w": 150, "h": 43, "color": "#E3F2FD" },
            { "order": 11, "id": getRandomId(), "x": 180, 'y': 0, "z": 274, "l": 180, "w": 150, "h": 42, "color": "#E3F2FD" },
            { "order": 12, "id": getRandomId(), "x": 0, 'y': 150, "z": 274, "l": 150, "w": 150, "h": 50, "color": "#E3F2FD" },
            { "order": 13, "id": getRandomId(), "x": 180, 'y': 0, "z": 316, "l": 220, "w": 150, "h": 34, "color": "#E3F2FD" },
            { "order": 14, "id": getRandomId(), "x": 0, 'y': 0, "z": 317, "l": 180, "w": 150, "h": 33, "color": "#E3F2FD" },
            { "order": 15, "id": getRandomId(), "x": 0, 'y': 150, "z": 324, "l": 180, "w": 150, "h": 25, "color": "#E3F2FD" }
        ]
    }
];

// Real container placements from bin packing algorithm (all 63 bundles)
// First 3 are linked to the demo batches for status synchronization
const CONTAINER_PLACEMENTS = [
    { "order": 0, "id": BATCH_1_ID, "x": 0, "y": 0, "z": 0, "l": 675, "w": 500, "h": 416, "color": "#FF9800" },
    { "order": 1, "id": BATCH_2_ID, "x": 675, "y": 0, "z": 0, "l": 675, "w": 500, "h": 450, "color": "#FF9800" },
    { "order": 2, "id": BATCH_3_ID, "x": 1350, "y": 0, "z": 0, "l": 450, "w": 300, "h": 400, "color": "#FFC107" },
    { "order": 3, "id": getRandomId(), "x": 2700, "y": 0, "z": 0, "l": 900, "w": 750, "h": 500, "color": "#FF5722" },
    { "order": 4, "id": getRandomId(), "x": 3600, "y": 0, "z": 0, "l": 500, "w": 900, "h": 750, "color": "#FF5722" },
    { "order": 5, "id": getRandomId(), "x": 0, "y": 750, "z": 0, "l": 900, "w": 750, "h": 500, "color": "#FF5722" },
    { "order": 6, "id": getRandomId(), "x": 900, "y": 750, "z": 0, "l": 900, "w": 750, "h": 500, "color": "#FF5722" },
    { "order": 7, "id": getRandomId(), "x": 1800, "y": 750, "z": 0, "l": 900, "w": 750, "h": 500, "color": "#FF5722" },
    { "order": 8, "id": getRandomId(), "x": 2700, "y": 750, "z": 0, "l": 900, "w": 750, "h": 500, "color": "#FF5722" },
    { "order": 9, "id": getRandomId(), "x": 3600, "y": 900, "z": 0, "l": 500, "w": 900, "h": 750, "color": "#FF5722" },
    { "order": 10, "id": getRandomId(), "x": 0, "y": 0, "z": 500, "l": 900, "w": 750, "h": 500, "color": "#FF5722" },
    { "order": 11, "id": getRandomId(), "x": 900, "y": 0, "z": 500, "l": 900, "w": 750, "h": 500, "color": "#FF5722" },
    { "order": 12, "id": getRandomId(), "x": 1800, "y": 0, "z": 500, "l": 900, "w": 750, "h": 500, "color": "#FF5722" },
    { "order": 13, "id": getRandomId(), "x": 2700, "y": 0, "z": 500, "l": 900, "w": 750, "h": 500, "color": "#FF5722" },
    { "order": 14, "id": getRandomId(), "x": 0, "y": 750, "z": 500, "l": 900, "w": 750, "h": 497, "color": "#FF5722" },
    { "order": 15, "id": getRandomId(), "x": 900, "y": 750, "z": 500, "l": 900, "w": 750, "h": 497, "color": "#FF5722" },
    { "order": 16, "id": getRandomId(), "x": 1800, "y": 750, "z": 500, "l": 900, "w": 750, "h": 491, "color": "#FF5722" },
    { "order": 17, "id": getRandomId(), "x": 2700, "y": 750, "z": 500, "l": 900, "w": 750, "h": 491, "color": "#FF5722" },
    { "order": 18, "id": getRandomId(), "x": 3600, "y": 0, "z": 750, "l": 491, "w": 900, "h": 750, "color": "#FF5722" },
    { "order": 19, "id": getRandomId(), "x": 3600, "y": 900, "z": 750, "l": 490, "w": 900, "h": 750, "color": "#FF5722" },
    { "order": 20, "id": getRandomId(), "x": 1800, "y": 750, "z": 991, "l": 900, "w": 750, "h": 450, "color": "#FF5722" },
    { "order": 21, "id": getRandomId(), "x": 2700, "y": 750, "z": 991, "l": 675, "w": 500, "h": 450, "color": "#FF9800" },
    { "order": 22, "id": getRandomId(), "x": 0, "y": 750, "z": 997, "l": 675, "w": 500, "h": 450, "color": "#FF9800" },
    { "order": 23, "id": getRandomId(), "x": 675, "y": 750, "z": 997, "l": 675, "w": 500, "h": 450, "color": "#FF9800" },
    { "order": 24, "id": getRandomId(), "x": 1350, "y": 750, "z": 997, "l": 450, "w": 675, "h": 500, "color": "#FF9800" },
    { "order": 25, "id": getRandomId(), "x": 0, "y": 0, "z": 1000, "l": 675, "w": 500, "h": 450, "color": "#FF9800" },
    { "order": 26, "id": getRandomId(), "x": 675, "y": 0, "z": 1000, "l": 675, "w": 500, "h": 450, "color": "#FF9800" },
    { "order": 27, "id": getRandomId(), "x": 1350, "y": 0, "z": 1000, "l": 675, "w": 500, "h": 450, "color": "#FF9800" },
    { "order": 28, "id": getRandomId(), "x": 2025, "y": 0, "z": 1000, "l": 675, "w": 500, "h": 450, "color": "#FF9800" },
    { "order": 29, "id": getRandomId(), "x": 2700, "y": 0, "z": 1000, "l": 675, "w": 500, "h": 450, "color": "#FF9800" },
    { "order": 30, "id": getRandomId(), "x": 2700, "y": 1250, "z": 991, "l": 675, "w": 416, "h": 500, "color": "#FF9800" },
    { "order": 31, "id": getRandomId(), "x": 0, "y": 1250, "z": 997, "l": 675, "w": 416, "h": 500, "color": "#FF9800" },
    { "order": 32, "id": getRandomId(), "x": 675, "y": 1250, "z": 997, "l": 675, "w": 416, "h": 500, "color": "#FF9800" },
    { "order": 33, "id": getRandomId(), "x": 0, "y": 1500, "z": 0, "l": 900, "w": 400, "h": 750, "color": "#FF5722" },
    { "order": 34, "id": getRandomId(), "x": 900, "y": 1500, "z": 0, "l": 900, "w": 400, "h": 750, "color": "#FF5722" },
    { "order": 35, "id": getRandomId(), "x": 1800, "y": 1500, "z": 0, "l": 900, "w": 400, "h": 750, "color": "#FF5722" },
    { "order": 36, "id": getRandomId(), "x": 2700, "y": 1500, "z": 0, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 37, "id": getRandomId(), "x": 3150, "y": 1500, "z": 0, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 38, "id": getRandomId(), "x": 2700, "y": 1500, "z": 300, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 39, "id": getRandomId(), "x": 3150, "y": 1500, "z": 300, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 40, "id": getRandomId(), "x": 2700, "y": 1500, "z": 600, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 41, "id": getRandomId(), "x": 3150, "y": 1500, "z": 600, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 42, "id": getRandomId(), "x": 1800, "y": 1500, "z": 750, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 43, "id": getRandomId(), "x": 2250, "y": 1500, "z": 750, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 44, "id": getRandomId(), "x": 1800, "y": 1500, "z": 1050, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 45, "id": getRandomId(), "x": 2250, "y": 1500, "z": 1050, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 46, "id": getRandomId(), "x": 1800, "y": 1500, "z": 1350, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 47, "id": getRandomId(), "x": 2250, "y": 1500, "z": 1350, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 48, "id": getRandomId(), "x": 1800, "y": 750, "z": 1441, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 49, "id": getRandomId(), "x": 2250, "y": 750, "z": 1441, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 50, "id": getRandomId(), "x": 2700, "y": 750, "z": 1441, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 51, "id": getRandomId(), "x": 0, "y": 750, "z": 1447, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 52, "id": getRandomId(), "x": 450, "y": 750, "z": 1447, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 53, "id": getRandomId(), "x": 900, "y": 750, "z": 1447, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 54, "id": getRandomId(), "x": 0, "y": 0, "z": 1450, "l": 450, "w": 400, "h": 300, "color": "#FFC107" },
    { "order": 55, "id": getRandomId(), "x": 450, "y": 0, "z": 1450, "l": 450, "w": 399, "h": 300, "color": "#FFC107" },
    { "order": 56, "id": getRandomId(), "x": 900, "y": 0, "z": 1450, "l": 450, "w": 399, "h": 300, "color": "#FFC107" },
    { "order": 57, "id": getRandomId(), "x": 1350, "y": 0, "z": 1450, "l": 450, "w": 399, "h": 300, "color": "#FFC107" },
    { "order": 58, "id": getRandomId(), "x": 1800, "y": 0, "z": 1450, "l": 450, "w": 399, "h": 300, "color": "#FFC107" },
    { "order": 59, "id": getRandomId(), "x": 2250, "y": 0, "z": 1450, "l": 450, "w": 399, "h": 300, "color": "#FFC107" },
    { "order": 60, "id": getRandomId(), "x": 2700, "y": 0, "z": 1450, "l": 450, "w": 399, "h": 300, "color": "#FFC107" },
    { "order": 61, "id": getRandomId(), "x": 2700, "y": 1250, "z": 1491, "l": 450, "w": 397, "h": 300, "color": "#FFC107" },
    { "order": 62, "id": getRandomId(), "x": 1350, "y": 750, "z": 1497, "l": 450, "w": 397, "h": 300, "color": "#FFC107" },
];

// MOCK CONTAINER DATA (Loading Bundles into Truck)
const MOCK_CONTAINER: PackingAnimationData = {
    id: getRandomId(),
    type: 'TRUCK 2.5T',
    dim_l: 4200,
    dim_w: 1900,
    dim_h: 1800,
    items: 63,
    fill_rate: "57.83%",
    placements: CONTAINER_PLACEMENTS
};

export function PackingRequestPage() {
    const [selectedBatch, setSelectedBatch] = useState<PackingAnimationData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'BUNDLE' | 'CONTAINER'>('BUNDLE');
    const [packedBatches, setPackedBatches] = useState<(string | number)[]>([]);
    const [containerStep, setContainerStep] = useState(0);

    const [isContainerLoaded, setIsContainerLoaded] = useState(() => {
        return localStorage.getItem(`container_loaded_${MOCK_CONTAINER.id}`) === 'true';
    });

    const filteredBatches = MOCK_BATCHES.filter(batch =>
        batch.id.toString().includes(searchTerm) ||
        batch.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleConfirmPacked = (id: string | number) => {
        if (!packedBatches.includes(id)) {
            setPackedBatches([...packedBatches, id]);
            localStorage.setItem(`batch_packed_${id}`, 'true');
        }
        setSelectedBatch(null);
    };

    const handleConfirmContainer = () => {
        setIsContainerLoaded(true);
        localStorage.setItem(`container_loaded_${MOCK_CONTAINER.id}`, 'true');
    };

    const handleCompleteAllBundles = () => {
        const allIds = MOCK_CONTAINER.placements.map(p => p.id);
        const newPacked = [...new Set([...packedBatches, ...allIds])];
        setPackedBatches(newPacked);
        allIds.forEach(id => localStorage.setItem(`batch_packed_${id}`, 'true'));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Yêu cầu đóng gói
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Quản lý các kiện hàng đi và xem hướng dẫn đóng gói.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('BUNDLE')}
                        className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                    ${activeTab === 'BUNDLE'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                `}
                    >
                        <Package className="w-4 h-4" />
                        Đóng gói kiện hàng
                        <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium ml-2">
                            {Math.max(MOCK_BATCHES.length - packedBatches.length, 0)} Đang chờ
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('CONTAINER')}
                        className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                    ${activeTab === 'CONTAINER'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                `}
                    >
                        <Container className="w-4 h-4" />
                        Tải kiện lên container
                    </button>
                </nav>
            </div>

            {/* Content based on Tab */}
            {activeTab === 'BUNDLE' ? (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Đang chờ đóng gói</p>
                                <h3 className="text-2xl font-bold text-gray-900">{MOCK_BATCHES.length - packedBatches.length}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <CheckSquare className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Hoàn thành hôm nay</p>
                                <h3 className="text-2xl font-bold text-gray-900">{packedBatches.length}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-amber-50 rounded-lg">
                                <Truck className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Xe tiếp theo</p>
                                <h3 className="text-xl font-bold text-gray-900">16:30</h3>
                                {/* License Plate Style */}
                                <div className="px-2 py-0.5 bg-yellow-400 border-2 border-black rounded shadow-sm">
                                    <span className="text-lg font-mono font-bold text-black tracking-wider uppercase">
                                        50AB-26244
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full sm:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo Mã kiện hoặc Loại..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                <Filter className="w-4 h-4" />
                                Lọc trạng thái
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Mã kiện</th>
                                        <th className="px-6 py-3 font-medium">Loại kiện</th>
                                        <th className="px-6 py-3 font-medium">Kích thước (mm)</th>
                                        <th className="px-6 py-3 font-medium">Số lượng</th>
                                        <th className="px-6 py-3 font-medium">Tỷ lệ lấp đầy</th>
                                        <th className="px-6 py-3 font-medium">Trạng thái</th>
                                        <th className="px-6 py-3 font-medium text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredBatches.map((batch) => {
                                        const isPacked = packedBatches.includes(batch.id);
                                        return (
                                            <tr key={batch.id} className="hover:bg-gray-50 group transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    #{batch.id}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                ${batch.type === 'SMALL' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            batch.type === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                'bg-purple-50 text-purple-700 border-purple-200'
                                                        }`}>
                                                        {batch.type === 'SMALL' ? 'NHỎ' : batch.type === 'MEDIUM' ? 'TRUNG BÌNH' : batch.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {batch.dim_l} x {batch.dim_w} x {batch.dim_h}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <Box className="w-4 h-4 text-gray-400" />
                                                        <span>{batch.items} món</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-500 rounded-full"
                                                                style={{ width: batch.fill_rate }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium">{batch.fill_rate}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isPacked ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200 gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Đã đóng gói
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                                                            Chờ đóng gói
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedBatch(batch)}
                                                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-colors shadow-sm ${isPacked ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
                                                            }`}
                                                    >
                                                        <Play className="w-3 h-3 fill-current" />
                                                        {isPacked ? 'Xem lại đóng gói' : 'Hướng dẫn đóng gói'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {filteredBatches.length === 0 && (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                                    <AlertCircle className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Không tìm thấy kiện hàng nào</h3>
                                <p className="text-gray-500 mt-1">Vui lòng thử điều chỉnh tiêu chí tìm kiếm.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Container Packing View */
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-gray-900">Kế hoạch xếp hàng xe tải #{MOCK_CONTAINER.id}</h2>
                                {isContainerLoaded ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Đã xếp xong
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Chờ xếp hàng
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Hình ảnh minh họa các kiện hàng được xếp vào xe vận chuyển.</p>

                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm font-medium text-gray-500">Tỷ lệ lấp đầy thể tích:</span>
                                <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                    <div
                                        className="h-full bg-blue-600 rounded-full"
                                        style={{ width: MOCK_CONTAINER.fill_rate }}
                                    />
                                </div>
                                <span className="text-sm font-bold text-blue-700">{MOCK_CONTAINER.fill_rate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-1 bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col h-[500px]">
                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                <h3 className="text-sm font-semibold text-gray-700">Danh sách kiện hàng</h3>
                                <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                    SẴN SÀNG: {MOCK_CONTAINER.placements.filter(p => packedBatches.includes(p.id)).length}/{MOCK_CONTAINER.items}
                                </span>
                            </div>
                            <div className="overflow-y-auto flex-1 pr-1 space-y-2">
                                {MOCK_CONTAINER.placements.map((p, idx) => {
                                    const isPacked = packedBatches.includes(p.id);
                                    const isBeingPlaced = idx === containerStep;
                                    const hasBeenPlaced = idx < containerStep;

                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-center justify-between text-sm p-3 rounded-lg border transition-all ${isBeingPlaced ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' :
                                                isPacked ? 'bg-green-50 border-green-200 text-green-900' :
                                                    'bg-white border-gray-100 text-gray-700 shadow-sm'
                                                }`}
                                        >
                                            <span className="font-medium flex items-center gap-2">
                                                {isPacked ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                ) : (
                                                    <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                                )}
                                                Kiện #{p.id}
                                                {hasBeenPlaced && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">ĐÃ XẾP XE</span>}
                                            </span>
                                            <span className={`text-xs ${isPacked ? 'text-green-700' : 'text-gray-400'}`}>
                                                {p.l}x{p.w}x{p.h}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="col-span-2 flex flex-col bg-gray-100 rounded-lg min-h-[500px] border border-gray-200 shadow-inner overflow-hidden">
                            <Packing3DAnimation
                                data={MOCK_CONTAINER}
                                isOpen={true}
                                onClose={() => { }}
                                onConfirm={!isContainerLoaded ? handleConfirmContainer : undefined}
                                title="Hình ảnh minh họa kế hoạch xếp xe tải"
                                type="CONTAINER"
                                embedded={true}
                                onStepChange={setContainerStep}
                                onCompleteAll={handleCompleteAllBundles}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Bundle Animation Modal */}
            {selectedBatch && (
                <Packing3DAnimation
                    data={selectedBatch}
                    isOpen={!!selectedBatch}
                    onClose={() => setSelectedBatch(null)}
                    onConfirm={!packedBatches.includes(selectedBatch.id) ? () => handleConfirmPacked(selectedBatch.id) : undefined}
                    onCompleteAll={handleCompleteAllBundles}
                    title={`Đóng gói kiện hàng #${selectedBatch.id}`}
                    type="BUNDLE"
                />
            )}
        </div>
    );
}

export default PackingRequestPage;