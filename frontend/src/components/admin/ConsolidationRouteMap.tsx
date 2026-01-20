import { useMemo } from 'react';
import { ConsolidationRoute } from '../../models/consolidationRoute';
import { VietnamMap, MapMarker, MapPolyline } from '../common/VietnamMap';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet-arrowheads';
import { WARD_COORDINATES, getWardCoordinates } from '../../constants/wardCoordinates';

interface ConsolidationRouteMapProps {
    routes: ConsolidationRoute[];
    selectedRoute?: ConsolidationRoute | null;
    onRouteClick?: (route: ConsolidationRoute) => void;
}

// 1. DATA SOURCE: Extracted names from your SQL Dump
const HARDCODED_WARD_NAMES: Record<string, string> = {
    // ... (keep your existing ward names)
    '00103': 'Tây Hồ',
    '00091': 'Phú Thượng',
    '00611': 'Xuân Đỉnh',
    '00619': 'Phú Diễn',
    '00622': 'Xuân Phương',
    '00634': 'Tây Mỗ',
    '00199': 'Láng',
    '00226': 'Văn Miếu - QTGiám',
    '00229': 'Kim Liên',
    '00364': 'Khương Đình',
    '00664': 'Đại Thanh',
    '00679': 'Ngọc Hồi',
    '00340': 'Yên Sở',
    '00283': 'Vĩnh Tuy',
    '00577': 'Bát Tràng',
    '00565': 'Gia Lâm',
    '00541': 'Phù Đổng',
    '00127': 'Việt Hưng',
    '00118': 'Bồ Đề',
    '00145': 'Long Biên',
    // ... add any other wards you need
};

const PROVINCE_COORDINATES: Record<string, [number, number]> = {
    '01': [21.0285, 105.8542], // Hà Nội Center (Warehouse)
};

function createOfficeIcon(type: string, isSelected: boolean = false): L.DivIcon {
    let color = type === 'PROVINCE_WAREHOUSE' ? '#ea580c' : '#16a34a';
    let size = type === 'PROVINCE_WAREHOUSE' ? 32 : 24;
    let label = type === 'PROVINCE_WAREHOUSE' ? 'PW' : 'WO';
    let zIndex = type === 'PROVINCE_WAREHOUSE' ? 1000 : 100;

    return L.divIcon({
        className: 'custom-office-marker',
        html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 2px solid ${isSelected ? '#fbbf24' : 'white'};
        border-radius: 50% 50% 50% 0;
        box-shadow: 0 3px 5px rgba(0,0,0,0.3);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: ${zIndex};
      ">
        <span style="color: white; font-weight: bold; font-size: ${size * 0.4}px; transform: rotate(45deg);">
          ${label}
        </span>
      </div>
    `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size * 0.8],
    });
}

export function ConsolidationRouteMap({ routes, selectedRoute, onRouteClick }: ConsolidationRouteMapProps) {
    // Markers (Warehouse + All Wards)
    const markers = useMemo<MapMarker[]>(() => {
        const markerList: MapMarker[] = [];

        // Warehouse
        markerList.push({
            id: 'warehouse-01',
            position: PROVINCE_COORDINATES['01'],
            icon: createOfficeIcon('PROVINCE_WAREHOUSE'),
            popupContent: <div className="p-1 text-sm font-bold">Hanoi Central Warehouse</div>,
        });

        // Ward markers
        Object.entries(HARDCODED_WARD_NAMES).forEach(([code, name]) => {
            const position = getWardCoordinates(code);
            if (position) {
                markerList.push({
                    id: `ward-${code}`,
                    position,
                    icon: createOfficeIcon('WARD_OFFICE'),
                    popupContent: (
                        <div className="p-1 min-w-[120px]">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-green-600" />
                                <h3 className="font-bold text-sm text-gray-900">{name}</h3>
                            </div>
                            <p className="text-xs text-gray-500">Code: {code}</p>
                        </div>
                    ),
                });
            } else {
                console.warn(`Missing coordinates for ward: ${name} (${code})`);
            }
        });

        return markerList;
    }, []);

    // Polylines: 3 closed loops with arrows along the lines
    const polylines = useMemo<MapPolyline[]>(() => {
        const warehousePos = PROVINCE_COORDINATES['01'];
        const getPos = (code: string) => getWardCoordinates(code) || warehousePos;

        const routesData = [
            {
                id: 'vong-1',
                name: 'Vòng 1 - Tây Bắc',
                color: '#22c55e', // green
                codes: ['00103', '00091', '00611', '00619', '00622', '00634', '00199', '00226'],
            },
            {
                id: 'vong-2',
                name: 'Vòng 2 - Nam',
                color: '#3b82f6', // blue ← fixed from green
                codes: ['00229', '00364', '00664', '00679', '00340', '00283'],
            },
            {
                id: 'vong-3',
                name: 'Vòng 3 - Đông',
                color: '#ef4444', // red ← fixed from green
                codes: ['00577', '00565', '00541', '00127', '00118'],
            },
        ];

        return routesData.map((route) => {
            // Create closed loop: start ward → other wards → warehouse → back to start ward
            const positions = [
                ...route.codes.map(getPos),
                warehousePos,
                getPos(route.codes[0]), // close the loop
            ];

            return {
                id: route.id,
                positions,
                color: route.color,
                weight: 3,
                opacity: 0.9,
                // Arrows appear repeatedly along the line (in the middle of segments)
                arrowheads: {
                    size: '20px',      // Use pixels (approx 15-25px is good)
                    frequency: '100px', // Draw an arrow every 100 pixels on screen
                    fill: true,
                    color: route.color,
                    // 'repeat' is NOT supported by this library, use 'frequency'
                    // 'm' (meters) units are NOT supported, use 'px'
                },
                popupContent: (
                    <div className="p-1 text-xs font-bold">
                        {route.name} ({route.codes.length} wards)
                    </div>
                ),
            };
        });
    }, []);

    return (
        <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-sm h-[650px] bg-slate-50">
            {/* Legend */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 p-3 rounded-lg shadow border text-sm">
                <div className="font-bold mb-2">Tuyến thu gom Hà Nội</div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    <span>Kho tỉnh (PW)</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span>Phường/Xã (WO)</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    Mũi tên chỉ hướng di chuyển
                </div>
            </div>

            <VietnamMap markers={markers} polylines={polylines} height="100%" />
        </div>
    );
}