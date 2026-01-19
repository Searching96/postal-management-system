import copy
import random
from dataclasses import dataclass, field
from typing import List, Dict
import numpy as np
import plotly.graph_objects as go
import base64
import io

# ==========================================================
# VEHICLE & BUNDLE CONFIGURATION - VIETNAM POSTAL LOGISTICS
# ==========================================================
# Đơn vị: mm (millimeters)
#
# Hệ thống vận tải bưu phẩm 3 cấp:
#   1. Xe tập kết (Ward → District Hub): Thu gom hàng từ các điểm giao dịch
#   2. Xe liên tỉnh (District Hub → Province Hub): Vận chuyển trong tỉnh
#   3. Xe liên miền (Province Hub → Regional Hub): Vận chuyển liên miền
#
# ==========================================================

# -----------------------------
# 1. VEHICLE SPECIFICATIONS
# -----------------------------
# Kích thước thùng xe thực tế ngành vận tải bưu phẩm Việt Nam

VEHICLES = {
    # Xe tập kết hàng - Kia Bongo / Suzuki Carry 0.5-1 tấn
    # Thùng xe nhỏ, linh hoạt di chuyển trong đô thị, thu gom hàng từ bưu cục
    "COLLECTION": {
        "name": "Xe tập kết (Collection Truck)",
        "description": "Thu gom hàng từ Ward đến District Hub",
        "capacity_kg": 800,
        "dimensions": {
            "length": 2700,   # mm - chiều dài thùng
            "width": 1500,    # mm - chiều rộng thùng  
            "height": 1400,   # mm - chiều cao thùng
        },
        "color": "#4CAF50"    # Green
    },
    
    # Xe liên tỉnh - Hyundai Porter / Isuzu QKR 2-3 tấn
    # Vận chuyển giữa các hub trong cùng tỉnh
    "INTER_DISTRICT": {
        "name": "Xe liên tỉnh (Inter-District Truck)",
        "description": "Vận chuyển từ District Hub đến Province Hub",
        "capacity_kg": 2500,
        "dimensions": {
            "length": 4200,   # mm
            "width": 1900,    # mm
            "height": 1800,   # mm
        },
        "color": "#2196F3"    # Blue
    },
    
    # Xe liên miền - Hino 500 / Isuzu FVR 5-10 tấn
    # Container nhỏ hoặc thùng kín, vận chuyển đường dài liên miền
    "INTER_REGION": {
        "name": "Xe liên miền (Inter-Region Truck)",
        "description": "Vận chuyển từ Province Hub đến Regional Hub",
        "capacity_kg": 8000,
        "dimensions": {
            "length": 6200,   # mm - tương đương container 20ft nội địa
            "width": 2400,    # mm
            "height": 2400,   # mm
        },
        "color": "#9C27B0"    # Purple
    }
}

# -----------------------------
# 2. BUNDLE SPECIFICATIONS  
# -----------------------------
# NGUYÊN TẮC THIẾT KẾ BUNDLE:
# =========================
# Bundle được đóng 1 LẦN DUY NHẤT tại điểm tập kết (Ward level)
# và giữ nguyên xuyên suốt quá trình vận chuyển qua các cấp.
#
# CONSTRAINT QUAN TRỌNG:
#   - Bundle phải vừa với xe NHỎ NHẤT (xe tập kết: 1400mm height)
#   - Max bundle total height = bundle_height + pallet_height ≤ 700mm
#   - Cho phép xếp 2 layers (700mm × 2 = 1400mm) trong xe nhỏ nhất
#   - Floor dimensions khớp HOÀN HẢO với xe tập kết (2700x1500mm)
#
# THIẾT KẾ FLOOR (L x W) - tối ưu cho xe tập kết 2700x1500:
#   - SMALL: 450x300 → 6x5=30/layer (100% floor)
#   - MEDIUM: 675x500 → 4x3=12/layer (96% floor)
#   - LARGE: 900x750 → 3x2=6/layer (100% floor)
#
# THIẾT KẾ HEIGHT (đảm bảo total ≤ 700mm):
#   - SMALL: 600mm + 100mm pallet = 700mm → 2 layers trong mọi xe
#   - MEDIUM: 600mm + 100mm pallet = 700mm → 2 layers trong mọi xe
#   - LARGE: 600mm + 100mm pallet = 700mm → 2 layers trong mọi xe
#
# PHÂN TÍCH KHẢ NĂNG XẾP:
#   Xe tập kết (2700x1500x1400):
#       + SMALL (450x300x700): 6x5=30/layer × 2 layers = 60 bundles (100% floor)
#       + MEDIUM (675x500x700): 4x3=12/layer × 2 layers = 24 bundles (96% floor)
#       + LARGE (900x750x700): 3x2=6/layer × 2 layers = 12 bundles (100% floor)
#
#   Xe liên tỉnh (4200x1900x1800):
#       + SMALL: 7x4=28/layer × 2 layers = 56 bundles
#       + MEDIUM: 5x3=15/layer × 2 layers = 30 bundles
#       + LARGE: 4x2=8/layer × 2 layers = 16 bundles
#
#   Xe liên miền (6200x2400x2400):
#       + SMALL: 10x6=60/layer × 3 layers = 180 bundles
#       + MEDIUM: 7x4=28/layer × 3 layers = 84 bundles
#       + LARGE: 6x3=18/layer × 3 layers = 54 bundles

BUNDLES = {
    # Bundle nhỏ - cho thư từ, phụ kiện nhỏ, mỹ phẩm
    # Thiết kế để khớp tốt với tất cả xe:
    #   Xe tập kết 2700x1500: 6x5=30/layer (100% floor)
    #   Xe liên tỉnh 4200x1900: 9x6=54/layer (96.4% floor)
    #   Xe liên miền 6200x2400: 13x8=104/layer (93.5% floor)
    "SMALL": {
        "name": "Bundle Nhỏ (Small Parcel Bundle)",
        "description": "Gom bưu phẩm XS, S - thư từ, phụ kiện nhỏ",
        "dimensions": {
            "length": 450,    # mm - 2700/6=450 khớp hoàn hảo
            "width": 300,     # mm - 1500/5=300 khớp hoàn hảo
            "height": 350,    # mm - giảm để khớp với XS/S parcels (50-150mm)
        },
        "max_weight_kg": 40,
        "pallet_height": 50,   # Total: 400mm max - 3 layers trong 1400mm
        "color": "#FFC107"     # Amber
    },
    
    # Bundle trung - cho quần áo, giày dép, đồ gia dụng nhỏ
    # Thiết kế để khớp tốt với tất cả xe:
    #   Xe tập kết 2700x1500: 4x3=12/layer (96% floor)
    #   Xe liên tỉnh 4200x1900: 6x3=18/layer (91.4% floor)
    #   Xe liên miền 6200x2400: 9x4=36/layer (96.8% floor)
    "MEDIUM": {
        "name": "Bundle Trung (Standard Bundle)",
        "description": "Gom bưu phẩm M, L - quần áo, gia dụng nhỏ",
        "dimensions": {
            "length": 675,    # mm - 2700/4=675 khớp hoàn hảo
            "width": 500,     # mm - 1500/3=500 khớp hoàn hảo
            "height": 400,    # mm - giảm để khớp với M/L parcels (110-220mm)
        },
        "max_weight_kg": 100,
        "pallet_height": 50,   # Total: 450mm max - 3 layers trong 1400mm
        "color": "#FF9800"     # Orange
    },
    
    # Bundle lớn - cho điện tử, nội thất nhỏ
    # Thiết kế để khớp tốt với tất cả xe:
    #   Xe tập kết 2700x1500: 3x2=6/layer (100% floor)
    #   Xe liên tỉnh 4200x1900: 4x2=8/layer (76.2% floor)
    #   Xe liên miền 6200x2400: 6x3=18/layer (96.8% floor)
    "LARGE": {
        "name": "Bundle Lớn (Bulk Bundle)",
        "description": "Gom bưu phẩm XL, XXL - điện tử, nội thất",
        "dimensions": {
            "length": 900,    # mm - 2700/3=900 khớp hoàn hảo
            "width": 750,     # mm - 1500/2=750 khớp hoàn hảo
            "height": 450,    # mm - giảm để khớp với parcel heights
        },
        "max_weight_kg": 200,
        "pallet_height": 50,   # Total: 500mm - 2 layers trong 1400mm
        "color": "#FF5722"     # Deep Orange
    }
}

# -----------------------------
# 3. PARCEL SIZE CATEGORIES
# -----------------------------
# Phân loại kích thước bưu phẩm để tự động chọn bundle phù hợp
# Kích thước parcel phải <= bundle dimensions để đảm bảo fit
#
# MAPPING: Parcel Size → Bundle Type (với bundle dimensions mới)
#   XS, S → SMALL bundle (450x300x600)
#   M, L → MEDIUM bundle (675x500x600)
#   XL, XXL → LARGE bundle (900x750x600)

PARCEL_SIZES = {
    # Parcels phải fit vào bundle tương ứng
    # SMALL bundle: 450x300x600 → parcels XS, S
    # MEDIUM bundle: 675x500x600 → parcels M, L  
    # LARGE bundle: 900x750x600 → parcels XL, XXL
    
    "XS": {  # Extra Small - Thư từ, tài liệu, phong bì
        "max_dimensions": (220, 150, 50),   # Fit nhiều trong SMALL bundle (450x300x600)
        "max_weight_kg": 1,
        "preferred_bundle": "SMALL"
    },
    "S": {   # Small - Điện thoại, mỹ phẩm, phụ kiện nhỏ
        "max_dimensions": (300, 200, 150),  # ~6-10 items/SMALL bundle
        "max_weight_kg": 3,
        "preferred_bundle": "SMALL"
    },
    "M": {   # Medium - Giày dép, quần áo, sách
        "max_dimensions": (400, 300, 200),  # ~4-6 items/MEDIUM bundle (675x500x600)
        "max_weight_kg": 10,
        "preferred_bundle": "MEDIUM"
    },
    "L": {   # Large - Đồ gia dụng nhỏ, túi xách
        "max_dimensions": (500, 400, 300),  # ~2-3 items/MEDIUM bundle
        "max_weight_kg": 20,
        "preferred_bundle": "MEDIUM"
    },
    "XL": {  # Extra Large - Đồ điện tử, monitor, lò vi sóng
        "max_dimensions": (600, 500, 350),  # ~2-4 items/LARGE bundle (900x750x600)
        "max_weight_kg": 35,
        "preferred_bundle": "LARGE"
    },
    "XXL": { # Bulky - Tivi nhỏ, máy in, đồ nội thất nhỏ
        "max_dimensions": (800, 650, 500),  # 1-2 items/LARGE bundle (900x750x600)
        "max_weight_kg": 60,
        "preferred_bundle": "LARGE"
    }
}

# -----------------------------
# 4. HELPER FUNCTIONS
# -----------------------------

def get_vehicle_box(vehicle_type: str) -> 'Box':
    """Tạo Box object từ vehicle config"""
    v = VEHICLES[vehicle_type]
    dims = v["dimensions"]
    return Box(dims["length"], dims["width"], dims["height"])

def get_bundle_config(bundle_type: str) -> Dict:
    """Lấy config của bundle type"""
    return BUNDLES[bundle_type]

def create_bundle(bundle_id: int, bundle_type: str = "MEDIUM") -> 'Bundle':
    """Factory function tạo bundle với type cụ thể"""
    config = BUNDLES[bundle_type]
    dims = config["dimensions"]
    return Bundle(
        id=bundle_id,
        bundle_type=bundle_type,
        dim_l=dims["length"],
        dim_w=dims["width"],
        dim_h=dims["height"],
        pallet_height=config["pallet_height"],
        max_weight=config["max_weight_kg"]
    )

def classify_parcel(length: int, width: int, height: int, weight_kg: float = 0) -> str:
    """Phân loại bưu phẩm theo kích thước"""
    dims = sorted([length, width, height], reverse=True)
    for size_code, spec in PARCEL_SIZES.items():
        max_dims = sorted(spec["max_dimensions"], reverse=True)
        if dims[0] <= max_dims[0] and dims[1] <= max_dims[1] and dims[2] <= max_dims[2]:
            if weight_kg <= spec["max_weight_kg"] or weight_kg == 0:
                return size_code
    return "XXL"

def get_preferred_bundle_type(parcel_size: str) -> str:
    """Lấy bundle type phù hợp cho loại bưu phẩm"""
    return PARCEL_SIZES.get(parcel_size, {"preferred_bundle": "LARGE"})["preferred_bundle"]

def print_vehicle_bundle_analysis():
    """In phân tích khả năng xếp bundle vào các loại xe"""
    print("\n" + "="*70)
    print("📊 VEHICLE-BUNDLE COMPATIBILITY ANALYSIS")
    print("="*70)
    
    for v_name, v_config in VEHICLES.items():
        dims = v_config["dimensions"]
        v_l, v_w, v_h = dims["length"], dims["width"], dims["height"]
        print(f"\n🚛 {v_config['name']}")
        print(f"   Thùng xe: {v_l} x {v_w} x {v_h} mm")
        print(f"   Tải trọng: {v_config['capacity_kg']} kg")
        print(f"   Khả năng xếp bundle:")
        
        for b_name, b_config in BUNDLES.items():
            b_dims = b_config["dimensions"]
            b_l, b_w, b_h = b_dims["length"], b_dims["width"], b_dims["height"]
            
            # Tính số bundle xếp được
            # Thử cả 2 chiều xoay của bundle trên mặt sàn
            fit1_l = v_l // b_l
            fit1_w = v_w // b_w
            fit2_l = v_l // b_w
            fit2_w = v_w // b_l
            
            # Lấy cách xếp tốt nhất
            bundles_per_layer = max(fit1_l * fit1_w, fit2_l * fit2_w)
            layers = v_h // (b_h + b_config["pallet_height"])
            total_bundles = bundles_per_layer * layers
            
            efficiency = (bundles_per_layer * b_l * b_w) / (v_l * v_w) * 100
            
            print(f"      - {b_name} ({b_l}x{b_w}x{b_h}): "
                  f"{bundles_per_layer}/layer × {layers} layers = {total_bundles} bundles "
                  f"({efficiency:.1f}% floor efficiency)")
    
    print("\n" + "="*70)


# ==========================================================
# 1. DATA STRUCTURES & 2. ENGINE
# ==========================================================
@dataclass(frozen=True)
class Box:
    l: int
    w: int
    h: int
    id: int = -1
    color: str = 'blue'
    
    @property
    def volume(self): return self.l * self.w * self.h
    @property
    def area(self): return self.l * self.w

    def get_orientations(self):
        unique = set()
        perms = [
            (self.l, self.w, self.h), (self.l, self.h, self.w),
            (self.w, self.l, self.h), (self.w, self.h, self.l),
            (self.h, self.l, self.w), (self.h, self.w, self.l)
        ]
        res = []
        for p in perms:
            if p not in unique:
                unique.add(p)
                res.append(Box(*p, id=self.id, color=self.color))
        return res

@dataclass
class Placement:
    x: int
    y: int
    z: int
    box: Box

class PackerEngine:
    def __init__(self, container_dims: Box):
        self.container = container_dims
        self.placements = []
        self.ep = [(0, 0, 0)] 
        self.occupied_volume = 0
    
    def intersect(self, x, y, z, b, p):
        return (x < p.x + p.box.l and x + b.l > p.x and
                y < p.y + p.box.w and y + b.w > p.y and
                z < p.z + p.box.h and z + b.h > p.z)

    def check_support(self, x, y, z, width, length):
        if z == 0: return True
        box_area = width * length
        supported_area = 0
        for p in self.placements:
            if abs((p.z + p.box.h) - z) < 1:
                ix = max(x, p.x); iy = max(y, p.y)
                ix2 = min(x + length, p.x + p.box.l); iy2 = min(y + width, p.y + p.box.w)
                if ix < ix2 and iy < iy2: supported_area += (ix2 - ix) * (iy2 - iy)
        return (supported_area / box_area) >= 0.60

    def can_place(self, x, y, z, box):
        if x + box.l > self.container.l or y + box.w > self.container.w or z + box.h > self.container.h: return False
        for p in self.placements:
            if self.intersect(x, y, z, box, p): return False
        if not self.check_support(x, y, z, box.w, box.l): return False
        return True

    def add_item(self, box: Box) -> bool:
        best_ep, best_orient = None, None
        best_score = float('inf')
        sorted_eps = sorted(self.ep, key=lambda p: (p[2], p[1], p[0]))

        for ep in sorted_eps: 
            for orient in box.get_orientations():
                if self.can_place(*ep, orient):
                    gap_x = self.container.l - (ep[0] + orient.l)
                    gap_y = self.container.w - (ep[1] + orient.w)
                    dead_space_penalty = 0
                    if 0 < gap_x < 50: dead_space_penalty += 100000
                    if 0 < gap_y < 50: dead_space_penalty += 100000
                    area_score = -orient.area 
                    score = (ep[2] * 1000000) + (ep[1] * 100) + ep[0] + dead_space_penalty + (area_score / 100)
                    if score < best_score:
                        best_score = score
                        best_ep, best_orient = ep, orient
            if best_ep and best_ep[2] == 0 and best_score < -100: break
        
        if best_ep:
            self.placements.append(Placement(*best_ep, best_orient))
            self.occupied_volume += best_orient.volume
            self._update_eps(*best_ep, best_orient)
            return True
        return False

    def _update_eps(self, x, y, z, box):
        new_candidates = [(x + box.l, y, z), (x, y + box.w, z), (x, y, z + box.h)]
        for nc in new_candidates:
            if nc[0] < self.container.l and nc[1] < self.container.w and nc[2] < self.container.h:
                if not any(self.intersect(nc[0], nc[1], nc[2], Box(1,1,1), p) for p in self.placements):
                    if nc not in self.ep: self.ep.append(nc)
        valid_eps = []
        for ep in self.ep:
            if (ep[0] >= x and ep[0] < x + box.l and
                ep[1] >= y and ep[1] < y + box.w and
                ep[2] >= z and ep[2] < z + box.h): continue
            valid_eps.append(ep)
        self.ep = valid_eps

# ==========================================================
# 3. REPORT GENERATOR (OPTIMIZED - STATIC IMAGES)
# ==========================================================
def create_plotly_figure(container_dims, placements, title, static=False):
    """
    Creates a Plotly figure.
    If static=True, layout is optimized for a static image snapshot.
    """
    fig = go.Figure()
    
    # 1. Items
    for p in placements:
        x, y, z = p.x, p.y, p.z
        l, w, h = p.box.l, p.box.w, p.box.h
        
        # Vertices
        x_coords = [x, x+l, x+l, x, x, x+l, x+l, x]
        y_coords = [y, y, y+w, y+w, y, y, y+w, y+w]
        z_coords = [z, z, z, z, z+h, z+h, z+h, z+h]
        
        i = [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2]
        j = [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3]
        k = [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6]

        # Use lighter rendering for static images
        fig.add_trace(go.Mesh3d(
            x=x_coords, y=y_coords, z=z_coords,
            i=i, j=j, k=k,
            color=p.box.color, opacity=1.0, flatshading=True,
            name=f"ID:{p.box.id}", hoverinfo='name' if not static else 'skip'
        ))
        
        # Wireframe
        lines_x = [x, x+l, x+l, x, x, None, x, x, None, x+l, x+l, None, x+l, x+l, None, x, x, x+l, x+l, x, x]
        lines_y = [y, y, y+w, y+w, y, None, y, y, None, y, y, None, y+w, y+w, None, y+w, y+w, y, y, y+w, y+w]
        lines_z = [z, z, z, z, z, None, z, z+h, None, z, z+h, None, z, z+h, None, z, z+h, z+h, z+h, z+h, z+h]
        
        fig.add_trace(go.Scatter3d(
            x=lines_x, y=lines_y, z=lines_z,
            mode='lines', line=dict(color='black', width=2),
            showlegend=False, hoverinfo='skip'
        ))

    # 2. Container Frame
    cx, cy, cz = container_dims.l, container_dims.w, container_dims.h
    fig.add_trace(go.Mesh3d(
        x=[0, cx, cx, 0, 0, cx, cx, 0],
        y=[0, 0, cy, cy, 0, 0, cy, cy],
        z=[0, 0, 0, 0, cz, cz, cz, cz],
        i=[7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2],
        j=[3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3],
        k=[0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
        color='gray', opacity=0.1, name='Frame', hoverinfo='skip'
    ))

    # Layout optimization
    layout_args = dict(
        title=title,
        margin=dict(l=0, r=0, b=0, t=30),
        scene=dict(
            xaxis=dict(range=[0, max(cx,cy,cz)], title='L'),
            yaxis=dict(range=[0, max(cx,cy,cz)], title='W'),
            zaxis=dict(range=[0, max(cx,cy,cz)], title='H'),
            aspectmode='data',
            camera=dict(eye=dict(x=1.5, y=1.5, z=1.5)) # Better angle
        )
    )
    
    if static:
        layout_args['height'] = 400
        layout_args['width'] = 500
        layout_args['title'] = None # Remove title from image, use HTML text instead
    else:
        layout_args['height'] = 600

    fig.update_layout(**layout_args)
    return fig

def generate_full_report(bundles, container, container_placements, filename="Full_Packing_Report.html"):
    print(f"\n📊 Generating Optimized Report (Images for Bundles, 3D for Container)...")
    
    html_content = """
    <html>
    <head>
        <title>3D Packing Report</title>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background-color: #f0f2f5; }
            .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
            .container-section { background: white; margin: 20px; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .bundle-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; padding: 20px; }
            .bundle-card { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.2s; }
            .bundle-card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .card-header { background-color: #ecf0f1; padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; font-size: 0.9em; }
            .card-img { width: 100%; display: block; }
            h2 { border-bottom: 2px solid #3498db; padding-bottom: 10px; color: #2c3e50; }
        </style>
    </head>
    <body>
        <div class="header"><h1>📦 Smart Logistics: 3D Packing Report</h1></div>
    """
    
    # 1. Container Section (Interactive 3D)
    html_content += '<div class="container-section"><h2>🚛 Final Container Load (Interactive)</h2>'
    fig_container = create_plotly_figure(container, container_placements, "Container 20ft Overview")
    html_content += fig_container.to_html(full_html=False, include_plotlyjs=False)
    html_content += '</div>'
    
    # 2. Bundles Section (Static Images to prevent crashing)
    html_content += '<div style="margin: 20px;"><h2>📦 Bundle Details (Snapshot Gallery)</h2></div><div class="bundle-grid">'
    
    for i, b in enumerate(bundles):
        if len(b.items) == 0: continue
        
        print(f"   📷 Snapshotting Bundle {b.id}...", end="\r")
        dims = b.as_box()
        title_text = f"Bundle #{b.id} | Items: {len(b.items)} | Size: {dims.l}x{dims.w}x{dims.h}"
        
        # Create figure
        fig = create_plotly_figure(Box(dims.l, dims.w, dims.h), b.packer.placements, title_text, static=True)
        
        # Convert to static image (base64 string)
        # Requires 'kaleido' package
        try:
            img_bytes = fig.to_image(format="png", scale=2)
            img_str = base64.b64encode(img_bytes).decode('utf-8')
            img_tag = f'<img src="data:image/png;base64,{img_str}" class="card-img" alt="Bundle {b.id}">'
        except Exception as e:
            print(f"\n⚠️ Error generating image for Bundle {b.id}: {e}")
            img_tag = "<div style='padding:50px; text-align:center;'>Image generation failed (Install kaleido)</div>"

        html_content += f"""
        <div class="bundle-card">
            <div class="card-header">{title_text}</div>
            {img_tag}
        </div>
        """
        
    html_content += '</div></body></html>'
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print(f"\n✅ Report saved to: {filename}")

# ==========================================================
# 4. LOGIC
# ==========================================================
@dataclass
class Bundle:
    """
    Bundle - Đơn vị gom hàng trung gian
    
    Bundle giúp giảm fragmentation khi xếp hàng vào xe:
    - Thay vì xếp từng bưu phẩm riêng lẻ vào xe (gây lãng phí không gian)
    - Ta gom các bưu phẩm vào bundle trước, rồi xếp bundle vào xe
    - Bundle có kích thước chuẩn, dễ xếp và tối ưu không gian xe
    """
    id: int
    bundle_type: str = "MEDIUM"  # SMALL, MEDIUM, LARGE
    dim_l: int = 800   # Default MEDIUM bundle
    dim_w: int = 600 
    dim_h: int = 700
    pallet_height: int = 120  # Chiều cao đế bundle
    max_weight: float = 150   # kg
    items: List[Box] = field(default_factory=list)
    packer: PackerEngine = None
    current_weight: float = 0
    
    def __post_init__(self):
        self.packer = PackerEngine(Box(self.dim_l, self.dim_w, self.dim_h))
        
    def add_item(self, item: Box, weight_kg: float = 0) -> bool:
        """Thêm bưu phẩm vào bundle, kiểm tra cả không gian và trọng lượng"""
        if self.current_weight + weight_kg > self.max_weight:
            return False
        if self.packer.add_item(item):
            self.items.append(item)
            self.current_weight += weight_kg
            return True
        return False
    
    @property
    def current_volume(self): 
        return self.packer.occupied_volume
    
    @property
    def fill_rate(self) -> float:
        """Tỷ lệ lấp đầy bundle"""
        total_volume = self.dim_l * self.dim_w * self.dim_h
        return self.current_volume / total_volume if total_volume > 0 else 0
    
    def as_box(self) -> Box:
        """
        Chuyển bundle thành Box để xếp vào xe.
        Chiều cao = max height của items + pallet_height
        QUAN TRỌNG: Cap height để không vượt max bundle height
        """
        if not self.packer.placements: 
            return Box(self.dim_l, self.dim_w, self.pallet_height, id=self.id)
        
        max_h = max(p.z + p.box.h for p in self.packer.placements)
        # Cap height: không vượt bundle max height + pallet
        max_allowed_height = self.dim_h + self.pallet_height
        actual_height = min(max_h + self.pallet_height, max_allowed_height)
        
        # Màu theo bundle type
        colors = {"SMALL": "#FFC107", "MEDIUM": "#FF9800", "LARGE": "#FF5722"}
        c = colors.get(self.bundle_type, f'rgb({random.randint(50,200)},{random.randint(50,200)},{random.randint(50,200)})')
        return Box(self.dim_l, self.dim_w, actual_height, id=self.id, color=c)

def run_packing(items: List[Box], vehicle_type: str = "INTER_REGION", auto_bundle_type: bool = True):
    """
    Thuật toán đóng gói 2 pha:
    
    Phase 1 - Palletizing: Gom các bưu phẩm vào bundles
    Phase 2 - Loading: Xếp bundles vào xe tải
    
    Args:
        items: Danh sách bưu phẩm cần đóng gói
        vehicle_type: Loại xe (COLLECTION, INTER_DISTRICT, INTER_REGION)
        auto_bundle_type: Tự động chọn bundle type dựa trên kích thước item
    """
    # Lấy thông tin xe
    vehicle = VEHICLES[vehicle_type]
    container = get_vehicle_box(vehicle_type)
    
    print(f"\n{'='*60}")
    print(f"🚛 PACKING FOR: {vehicle['name']}")
    print(f"   Container: {container.l} x {container.w} x {container.h} mm")
    print(f"   Capacity: {vehicle['capacity_kg']} kg")
    print(f"{'='*60}")
    
    print("\n📦 PHASE 1: Palletizing (Gom hàng vào bundles)...")
    bundles = []
    bundle_counters = {"SMALL": 0, "MEDIUM": 0, "LARGE": 0}
    
    # Phân loại items
    loose_items = []
    oversized_items = []  # Items quá lớn, không vào được bundle nào
    
    # Xác định bundle type phù hợp cho từng item
    for item in items:
        # Kiểm tra item có vừa với bundle LARGE không
        large_dims = BUNDLES["LARGE"]["dimensions"]
        if (item.l <= large_dims["length"] and 
            item.w <= large_dims["width"] and 
            item.h <= large_dims["height"]):
            loose_items.append(item)
        else:
            oversized_items.append(item)
            print(f"   ⚠️ Oversized item {item.id}: {item.l}x{item.w}x{item.h} - packed directly")
    
    # Tạo bundles cho oversized items (mỗi item 1 bundle riêng)
    for item in oversized_items:
        b = Bundle(
            id=len(bundles),
            bundle_type="OVERSIZED",
            dim_l=item.l,
            dim_w=item.w,
            dim_h=item.h,
            pallet_height=150
        )
        b.items.append(item)
        b.packer.placements.append(Placement(0, 0, 0, item))
        b.packer.occupied_volume = item.volume
        bundles.append(b)
    
    # Sắp xếp items theo diện tích (lớn trước) - giúp bin packing hiệu quả hơn
    loose_items.sort(key=lambda x: x.l * x.w * x.h, reverse=True)
    
    # TARGET_FILL_RATE: Khi bundle đạt tỷ lệ này, tạo bundle mới
    # Điều này giúp tránh việc cố nhồi quá nhiều vào 1 bundle (gây fragmentation)
    TARGET_FILL_RATE = 0.65  # 65% - realistic target
    
    # Gom items vào bundles với chiến lược mới
    for item in loose_items:
        # Xác định bundle type phù hợp
        parcel_size = classify_parcel(item.l, item.w, item.h)
        preferred_bundle = get_preferred_bundle_type(parcel_size) if auto_bundle_type else "MEDIUM"
        
        placed = False
        
        # Thử xếp vào bundle cùng loại đã có (ưu tiên bundle chưa đầy)
        candidate_bundles = [b for b in bundles if b.bundle_type == preferred_bundle and b.fill_rate < TARGET_FILL_RATE]
        candidate_bundles.sort(key=lambda b: b.fill_rate, reverse=True)  # Ưu tiên bundle gần đầy
        
        for b in candidate_bundles:
            if b.add_item(item):
                placed = True
                break
        
        # Nếu không xếp được vào bundle ưu tiên, thử các bundle khác cùng type
        if not placed:
            for b in bundles:
                if b.bundle_type == preferred_bundle and b.fill_rate < 0.95:  # Chừa 5% margin
                    if b.add_item(item):
                        placed = True
                        break
        
        # Thử xếp vào bundle loại khác (lớn hơn)
        if not placed:
            bundle_order = ["SMALL", "MEDIUM", "LARGE"]
            start_idx = bundle_order.index(preferred_bundle) if preferred_bundle in bundle_order else 0
            
            for bt in bundle_order[start_idx:]:
                for b in bundles:
                    if b.bundle_type == bt and b.fill_rate < 0.95:
                        if b.add_item(item):
                            placed = True
                            break
                if placed:
                    break
        
        # Tạo bundle mới nếu cần
        if not placed:
            # Thử tạo bundle theo preferred type
            new_b = create_bundle(len(bundles), preferred_bundle)
            if new_b.add_item(item):
                bundles.append(new_b)
                bundle_counters[preferred_bundle] += 1
            else:
                # Thử bundle lớn hơn
                for bt in ["MEDIUM", "LARGE"]:
                    if bt != preferred_bundle:
                        new_b = create_bundle(len(bundles), bt)
                        if new_b.add_item(item):
                            bundles.append(new_b)
                            bundle_counters[bt] += 1
                            break
                else:
                    print(f"   ⚠️ Cannot pack item {item.id}: {item.l}x{item.w}x{item.h}")
    
    # Thống kê bundles
    print(f"\n   📊 Bundle Statistics:")
    for bt, count in bundle_counters.items():
        actual = len([b for b in bundles if b.bundle_type == bt])
        if actual > 0:
            avg_fill = sum(b.fill_rate for b in bundles if b.bundle_type == bt) / actual * 100
            print(f"      - {bt}: {actual} bundles (avg fill: {avg_fill:.1f}%)")
    oversized_count = len([b for b in bundles if b.bundle_type == "OVERSIZED"])
    if oversized_count > 0:
        print(f"      - OVERSIZED: {oversized_count} bundles")
    print(f"   => Total: {len(bundles)} bundles created")
    
    # Tính bundle fill rate tổng
    total_items_volume = sum(item.volume for item in items)
    total_bundle_capacity = sum(b.dim_l * b.dim_w * b.dim_h for b in bundles)
    avg_bundle_fill = (total_items_volume / total_bundle_capacity * 100) if total_bundle_capacity > 0 else 0
    print(f"   📈 Average Bundle Fill Rate: {avg_bundle_fill:.1f}%")

    print(f"\n🚛 PHASE 2: Loading bundles into {vehicle['name']}...")
    container_packer = PackerEngine(container)
    
    # Chuyển bundles thành boxes để xếp
    bundle_boxes = [b.as_box() for b in bundles]
    # Sắp xếp: ưu tiên bundle lớn và thấp (dễ xếp chồng)
    bundle_boxes.sort(key=lambda b: (b.h, b.area), reverse=True)
    
    loaded_count = 0
    packed_volume = 0
    total_weight_kg = 0
    failed_bundles = []
    bundle_type_stats = {"SMALL": {"count": 0, "volume": 0}, 
                        "MEDIUM": {"count": 0, "volume": 0}, 
                        "LARGE": {"count": 0, "volume": 0},
                        "OVERSIZED": {"count": 0, "volume": 0}}
    
    for b_box in bundle_boxes:
        if container_packer.add_item(b_box):
            loaded_count += 1
            original_bundle = next(b for b in bundles if b.id == b_box.id)
            packed_volume += original_bundle.current_volume
            total_weight_kg += original_bundle.current_weight
            
            # Track per bundle type
            bt = original_bundle.bundle_type
            if bt in bundle_type_stats:
                bundle_type_stats[bt]["count"] += 1
                bundle_type_stats[bt]["volume"] += original_bundle.current_volume
        else:
            failed_bundles.append(b_box)
            print(f"   ❌ Failed: Bundle {b_box.id} (Size: {b_box.l}x{b_box.w}x{b_box.h})")

    # Tính các metrics
    container_volume = container.volume
    container_floor = container.l * container.w
    
    # Volume của items thực tế đã load
    loaded_items_volume = sum(
        next(b for b in bundles if b.id == p.box.id).current_volume 
        for p in container_packer.placements
    )
    
    # Volume của bundles (boxes) đã load
    loaded_bundles_volume = container_packer.occupied_volume
    
    # Floor utilization: Chỉ tính layer đầu tiên (z=0)
    floor_placements = [p for p in container_packer.placements if p.z == 0]
    floor_area_used = sum(p.box.l * p.box.w for p in floor_placements)
    
    volume_efficiency = (loaded_items_volume / container_volume) * 100  # Volume items thực
    volume_efficiency_bundle = (loaded_bundles_volume / container_volume) * 100  # Volume bundles
    floor_efficiency = min((floor_area_used / container_floor) * 100, 100)  # Cap at 100%
    weight_utilization = (total_weight_kg / vehicle['capacity_kg']) * 100
    
    # Báo cáo cuối cùng
    print("\n" + "="*70)
    print("🏆 FINAL PACKING REPORT")
    print("="*70)
    print(f"📦 Container: {vehicle['name']}")
    print(f"   Dimensions: {container.l} x {container.w} x {container.h} mm")
    print(f"   Capacity: {vehicle['capacity_kg']} kg")
    print()
    print(f"📊 Items & Bundles:")
    print(f"   Total parcels: {len(items)}")
    print(f"   Bundles created: {len(bundles)}")
    print(f"   Bundles loaded: {loaded_count}/{len(bundles)}")
    if len(failed_bundles) > 0:
        print(f"   ❌ Failed bundles: {len(failed_bundles)}")
    print()
    print(f"📈 Bundle Type Breakdown:")
    for bt, stats in bundle_type_stats.items():
        if stats["count"] > 0:
            print(f"   {bt:12s}: {stats['count']:3d} bundles, Volume: {stats['volume']/1000000:8.2f} L")
    print()
    print(f"✅ Efficiency Metrics:")
    print(f"   Volume (Items):   {volume_efficiency:6.2f}% - thể tích thực tế items trong xe")
    print(f"   Volume (Bundles): {volume_efficiency_bundle:6.2f}% - thể tích bundles (bao gồm khoảng trống)")
    print(f"   Floor Space:      {floor_efficiency:6.2f}% - diện tích sàn layer đầu")
    print(f"   Weight:           {weight_utilization:6.2f}% - {total_weight_kg:.1f}/{vehicle['capacity_kg']} kg")
    print(f"   Bundle Fill Rate: {avg_bundle_fill:6.2f}% - hiệu quả sử dụng không gian bundle")
    print("="*70)
    
    # Tạo báo cáo HTML (commented out for faster testing)
    # generate_full_report(bundles, container, container_packer.placements, 
    #                     f"Packing_Report_{vehicle_type}.html")
    
    return {
        "bundles": bundles,
        "loaded_count": loaded_count,
        "failed_bundles": failed_bundles,
        "efficiency": volume_efficiency,
        "bundle_fill_rate": avg_bundle_fill,
        "floor_efficiency": floor_efficiency,
        "container_placements": container_packer.placements
    }

def generate_realistic_parcels(count: int, seed: int = 42) -> List[Box]:
    """
    Tạo dataset bưu phẩm thực tế với kích thước phù hợp để fill bundles tốt.
    
    Nguyên tắc:
    - Parcels phải có kích thước sát với fraction của bundle dimensions
    - Để đạt 70%+ fill rate, parcels cần "khớp" với nhau khi xếp
    - Phân bố kích thước theo thực tế ngành bưu chính VN
    """
    random.seed(seed)
    items = []
    
    # Phân bố theo thực tế:
    # - 25% XS: Thư từ, tài liệu (rất mỏng, dễ xếp chồng)
    # - 30% S: Điện thoại, phụ kiện, sách
    # - 25% M: Giày dép, quần áo, hộp trung
    # - 12% L: Đồ gia dụng nhỏ
    # - 6% XL: Đồ điện tử lớn
    # - 2% XXL: Nội thất, hàng cồng kềnh
    
    dist = {
        'XS': int(count * 0.25),
        'S': int(count * 0.30),
        'M': int(count * 0.25),
        'L': int(count * 0.12),
        'XL': int(count * 0.06),
        'XXL': int(count * 0.02)
    }
    
    # Điều chỉnh để tổng = count
    total = sum(dist.values())
    dist['S'] += count - total
    
    colors = {
        'XS': '#E3F2FD', 'S': '#BBDEFB', 'M': '#90CAF9',
        'L': '#64B5F6', 'XL': '#42A5F5', 'XXL': '#1E88E5'
    }
    
    # XS parcels - Thư từ, tài liệu, envelopes
    # Phải fit SMALL bundle (450x300x600)
    # Kích thước: ~1/4 bundle floor, thin height → nhiều items chồng được
    for _ in range(dist['XS']):
        l = random.choice([150, 180, 220])   # 450/3=150, 450/2=225
        w = random.choice([100, 120, 150])   # 300/3=100, 300/2=150
        h = random.randint(10, 50)           # Rất mỏng - xếp chồng nhiều
        items.append(Box(l, w, h, id=len(items), color=colors['XS']))
    
    # S parcels - Điện thoại, phụ kiện nhỏ, sách
    # Phải fit SMALL bundle (450x300x550)
    # Kích thước: ~1/2 - 1/4 bundle floor
    for _ in range(dist['S']):
        l = random.choice([150, 225, 300])   # 450/3, 450/2, 450/1.5
        w = random.choice([100, 150, 200])   # 300/3, 300/2, 300/1.5
        h = random.choice([91, 110, 137])    # 550/6, 550/5, 550/4 - reduced
        items.append(Box(l, w, h, id=len(items), color=colors['S']))
    
    # M parcels - Giày dép, quần áo
    # Phải fit MEDIUM bundle (675x500x550)
    # Kích thước: ~1/2 - 1/4 bundle floor
    for _ in range(dist['M']):
        l = random.choice([225, 337, 400])   # 675/3, 675/2, ~
        w = random.choice([166, 250, 300])   # 500/3, 500/2, ~
        h = random.choice([110, 137, 183])   # 550/5, 550/4, 550/3 - reduced
        items.append(Box(l, w, h, id=len(items), color=colors['M']))
    
    # L parcels - Đồ gia dụng nhỏ
    # Phải fit MEDIUM bundle (675x500x550)
    # Kích thước: ~1/2 bundle floor
    for _ in range(dist['L']):
        l = random.choice([337, 400, 500])   # 675/2, ~, ~
        w = random.choice([250, 300, 400])   # 500/2, ~, ~
        h = random.choice([137, 183, 220])   # 550/4, 550/3, ~ - reduced
        items.append(Box(l, w, h, id=len(items), color=colors['L']))
    
    # XL parcels - Đồ điện tử lớn (monitor, lò vi sóng)
    # Phải fit LARGE bundle (900x750x550)
    # Kích thước: ~1/2 bundle floor
    for _ in range(dist['XL']):
        l = random.choice([400, 450, 500])   # 900/2=450
        w = random.choice([350, 375, 450])   # 750/2=375
        h = random.choice([137, 183, 220])   # 550/4, 550/3, ~ - reduced
        items.append(Box(l, w, h, id=len(items), color=colors['XL']))
    
    # XXL parcels - Nội thất, hàng cồng kềnh
    # Phải fit LARGE bundle (900x750x550)
    # Kích thước: gần full bundle
    for _ in range(dist['XXL']):
        l = random.choice([600, 700, 800])   # <=900
        w = random.choice([500, 600, 650])   # <=750
        h = random.choice([220, 275, 350])   # 550/2.5, 550/2, ~ - reduced
        items.append(Box(l, w, h, id=len(items), color=colors['XXL']))
    
    random.shuffle(items)  # Xáo trộn để thực tế hơn
    
    print(f"📦 Total Parcels Generated: {len(items)}")
    for size, cnt in dist.items():
        desc = {'XS': 'thư từ', 'S': 'phụ kiện', 'M': 'quần áo', 
                'L': 'gia dụng', 'XL': 'điện tử', 'XXL': 'nội thất'}
        print(f"   - {size} ({desc[size]}): {cnt}")
    
    return items


if __name__ == "__main__":
    # In phân tích vehicle-bundle trước
    print_vehicle_bundle_analysis()
    
    print("\n🔄 Generating Realistic Postal Parcel Dataset...")
    
    # Tạo dataset với số lượng khác nhau cho từng loại xe
    # Xe tập kết: ~100-150 parcels (thu gom từ ward nhỏ)
    # Xe liên tỉnh: ~300-500 parcels (gom từ nhiều ward)
    # Xe liên miền: ~800-1500 parcels (gom từ nhiều province)
    
    all_items = generate_realistic_parcels(3000, seed=42)
    
    # Test cho 3 loại xe với datasets phù hợp quy mô
    print("\n" + "="*70)
    print("🚛 TEST 1: COLLECTION TRUCK - Xe tập kết (Ward → District Hub)")
    print("="*70)
    print("Scenario: Thu gom 600 bưu phẩm từ 1 ward\n")
    result1 = run_packing(all_items[:600], vehicle_type="COLLECTION")
    
    print("\n" + "="*70)
    print("🚛 TEST 2: INTER-DISTRICT TRUCK - Xe liên tỉnh (District → Province Hub)")
    print("="*70)
    print("Scenario: Vận chuyển 1500 bưu phẩm từ district hub\n")
    result2 = run_packing(all_items[:1500], vehicle_type="INTER_DISTRICT")
    
    print("\n" + "="*70)
    print("🚛 TEST 3: INTER-REGION TRUCK - Xe liên miền (Province → Regional Hub)")
    print("="*70)
    print("Scenario: Vận chuyển 3000 bưu phẩm từ province hub\n")
    result3 = run_packing(all_items[:3000], vehicle_type="INTER_REGION")
    
    # Tóm tắt so sánh
    print("\n" + "="*70)
    print("📊 COMPARISON SUMMARY")
    print("="*70)
    print(f"{'Vehicle':<20} {'Bundles':>10} {'Loaded':>10} {'Volume Eff.':>12} {'Bundle Fill':>12}")
    print("-"*70)
    
    for name, result in [("Xe tập kết", result1), ("Xe liên tỉnh", result2), ("Xe liên miền", result3)]:
        bundles = result['bundles']
        loaded = result['loaded_count']
        eff = result['efficiency']
        
        # Tính average bundle fill rate
        total_fill = sum(b.fill_rate for b in bundles if b.fill_rate > 0)
        avg_fill = (total_fill / len(bundles) * 100) if bundles else 0
        
        print(f"{name:<20} {len(bundles):>10} {loaded:>10} {eff:>11.1f}% {avg_fill:>11.1f}%")
    
    print("="*70)