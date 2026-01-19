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
# Thiết kế bundle để tối ưu sắp xếp cho cả 3 loại xe:
#
# Nguyên tắc thiết kế:
#   - SMALL: 600x400 (tiêu chuẩn Euro pallet fraction 1/4)
#   - MEDIUM: 800x600 (tiêu chuẩn Euro pallet fraction 1/2)
#   - LARGE: 1200x800 (tiêu chuẩn Euro pallet đầy đủ)
#
# Phân tích khả năng xếp theo floor space:
#   - Xe tập kết (2700x1500): 
#       + SMALL (600x400): 4x3 = 12 bundles/layer
#       + MEDIUM (800x600): 3x2 = 6 bundles/layer
#       + LARGE (1200x800): 2x1 = 2 bundles/layer
#
#   - Xe liên tỉnh (4200x1900):
#       + SMALL (600x400): 7x4 = 28 bundles/layer
#       + MEDIUM (800x600): 5x3 = 15 bundles/layer  
#       + LARGE (1200x800): 3x2 = 6 bundles/layer
#
#   - Xe liên miền (6200x2400):
#       + SMALL (600x400): 10x6 = 60 bundles/layer
#       + MEDIUM (800x600): 7x4 = 28 bundles/layer
#       + LARGE (1200x800): 5x3 = 15 bundles/layer

BUNDLES = {
    # Bundle nhỏ - cho hàng lẻ, bưu kiện nhỏ
    # Kích thước dựa trên 1/4 Euro pallet
    "SMALL": {
        "name": "Bundle Nhỏ (Small Parcel Bundle)",
        "description": "Gom các bưu kiện nhỏ, hàng lẻ",
        "dimensions": {
            "length": 600,    # mm
            "width": 400,     # mm
            "height": 500,    # mm - chiều cao tối đa cho phép
        },
        "max_weight_kg": 50,
        "pallet_height": 100,  # Chiều cao pallet/đế bundle
        "color": "#FFC107"     # Amber
    },
    
    # Bundle trung - cho hàng tiêu chuẩn
    # Kích thước dựa trên 1/2 Euro pallet
    "MEDIUM": {
        "name": "Bundle Trung (Standard Bundle)",
        "description": "Gom các kiện hàng tiêu chuẩn",
        "dimensions": {
            "length": 800,    # mm
            "width": 600,     # mm
            "height": 700,    # mm
        },
        "max_weight_kg": 150,
        "pallet_height": 120,
        "color": "#FF9800"     # Orange
    },
    
    # Bundle lớn - cho hàng cồng kềnh, hàng nặng
    # Kích thước dựa trên Euro pallet tiêu chuẩn (1200x800)
    "LARGE": {
        "name": "Bundle Lớn (Bulk Bundle)",
        "description": "Gom hàng cồng kềnh, kiện lớn",
        "dimensions": {
            "length": 1200,   # mm
            "width": 800,     # mm
            "height": 1000,   # mm
        },
        "max_weight_kg": 400,
        "pallet_height": 150,
        "color": "#FF5722"     # Deep Orange
    }
}

# -----------------------------
# 3. PARCEL SIZE CATEGORIES
# -----------------------------
# Phân loại kích thước bưu phẩm để tự động chọn bundle phù hợp

PARCEL_SIZES = {
    "XS": {  # Extra Small - Thư từ, tài liệu
        "max_dimensions": (300, 200, 100),
        "max_weight_kg": 2,
        "preferred_bundle": "SMALL"
    },
    "S": {   # Small - Điện thoại, phụ kiện nhỏ
        "max_dimensions": (400, 300, 200),
        "max_weight_kg": 5,
        "preferred_bundle": "SMALL"
    },
    "M": {   # Medium - Giày dép, quần áo
        "max_dimensions": (500, 400, 300),
        "max_weight_kg": 15,
        "preferred_bundle": "MEDIUM"
    },
    "L": {   # Large - Đồ gia dụng nhỏ
        "max_dimensions": (600, 500, 400),
        "max_weight_kg": 30,
        "preferred_bundle": "MEDIUM"
    },
    "XL": {  # Extra Large - Đồ điện tử, nội thất nhỏ
        "max_dimensions": (800, 600, 500),
        "max_weight_kg": 50,
        "preferred_bundle": "LARGE"
    },
    "XXL": { # Bulky - Nội thất, đồ cồng kềnh
        "max_dimensions": (1000, 800, 600),
        "max_weight_kg": 100,
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
        """
        if not self.packer.placements: 
            return Box(self.dim_l, self.dim_w, self.pallet_height, id=self.id)
        if len(self.items) == 1:
            p = self.packer.placements[0]
            return Box(p.box.l, p.box.w, p.box.h + self.pallet_height, id=self.id, color=p.box.color)
        max_h = max(p.z + p.box.h for p in self.packer.placements)
        # Màu theo bundle type
        colors = {"SMALL": "#FFC107", "MEDIUM": "#FF9800", "LARGE": "#FF5722"}
        c = colors.get(self.bundle_type, f'rgb({random.randint(50,200)},{random.randint(50,200)},{random.randint(50,200)})')
        return Box(self.dim_l, self.dim_w, max_h + self.pallet_height, id=self.id, color=c)

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
    
    # Sắp xếp items theo diện tích (lớn trước)
    loose_items.sort(key=lambda x: x.l * x.w, reverse=True)
    
    # Gom items vào bundles
    for item in loose_items:
        # Xác định bundle type phù hợp
        parcel_size = classify_parcel(item.l, item.w, item.h)
        preferred_bundle = get_preferred_bundle_type(parcel_size) if auto_bundle_type else "MEDIUM"
        
        placed = False
        
        # Thử xếp vào bundle cùng loại đã có
        for b in bundles:
            if b.bundle_type == preferred_bundle:
                if b.add_item(item):
                    placed = True
                    break
        
        # Nếu không xếp được, thử các bundle loại khác
        if not placed:
            for b in bundles:
                if b.bundle_type in ["SMALL", "MEDIUM", "LARGE"]:
                    if b.add_item(item):
                        placed = True
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
            print(f"      - {bt}: {actual} bundles")
    oversized_count = len([b for b in bundles if b.bundle_type == "OVERSIZED"])
    if oversized_count > 0:
        print(f"      - OVERSIZED: {oversized_count} bundles")
    print(f"   => Total: {len(bundles)} bundles created")

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
    loaded_bundles_volume = sum(container_packer.occupied_volume for _ in [0])  # Volume của bundles (box)
    loaded_bundles_floor = sum(p.box.l * p.box.w for p in container_packer.placements)
    volume_efficiency = (packed_volume / container_volume) * 100  # Volume items thực
    volume_efficiency_bundle = (container_packer.occupied_volume / container_volume) * 100  # Volume bundles
    floor_efficiency = (loaded_bundles_floor / container_floor) * 100
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
    print(f"   Volume (Items):   {volume_efficiency:6.2f}% - thể tích thực tế items")
    print(f"   Volume (Bundles): {volume_efficiency_bundle:6.2f}% - thể tích bundles (bao gồm khoảng trống)")
    print(f"   Floor Space:      {floor_efficiency:6.2f}% - diện tích sàn sử dụng")
    print(f"   Weight:           {weight_utilization:6.2f}% - {total_weight_kg:.1f}/{vehicle['capacity_kg']} kg")
    print("="*70)
    
    # Tạo báo cáo HTML
    generate_full_report(bundles, container, container_packer.placements, 
                        f"Packing_Report_{vehicle_type}.html")
    
    return {
        "bundles": bundles,
        "loaded_count": loaded_count,
        "failed_bundles": failed_bundles,
        "efficiency": packed_volume / container.volume * 100,
        "container_placements": container_packer.placements
    }

if __name__ == "__main__":
    # In phân tích vehicle-bundle trước
    print_vehicle_bundle_analysis()
    
    # Tạo dataset mô phỏng bưu phẩm thực tế
    items = []
    colors = ['#EF5350', '#AB47BC', '#5C6BC0', '#29B6F6', '#66BB6A', '#FFA726', '#8D6E63']
    
    print("\n🔄 Generating Realistic Postal Parcel Dataset...")
    
    # 1. XS parcels - Thư từ, tài liệu (30%)
    for i in range(180):
        l = random.randint(15, 30) * 10  # 150-300mm
        w = random.randint(10, 20) * 10  # 100-200mm
        h = random.randint(2, 10) * 10   # 20-100mm
        items.append(Box(l, w, h, id=len(items), color='#E3F2FD'))
    
    # 2. S parcels - Điện thoại, phụ kiện (25%)
    for i in range(150):
        l = random.randint(25, 40) * 10  # 250-400mm
        w = random.randint(15, 30) * 10  # 150-300mm
        h = random.randint(10, 20) * 10  # 100-200mm
        items.append(Box(l, w, h, id=len(items), color='#BBDEFB'))
    
    # 3. M parcels - Giày dép, quần áo (20%)
    for i in range(120):
        l = random.randint(35, 50) * 10  # 350-500mm
        w = random.randint(25, 40) * 10  # 250-400mm
        h = random.randint(15, 30) * 10  # 150-300mm
        items.append(Box(l, w, h, id=len(items), color='#90CAF9'))
    
    # 4. L parcels - Đồ gia dụng nhỏ (15%)
    for i in range(90):
        l = random.randint(45, 60) * 10  # 450-600mm
        w = random.randint(35, 50) * 10  # 350-500mm
        h = random.randint(25, 40) * 10  # 250-400mm
        items.append(Box(l, w, h, id=len(items), color='#64B5F6'))
    
    # 5. XL parcels - Đồ điện tử (7%)
    for i in range(42):
        l = random.randint(55, 80) * 10  # 550-800mm
        w = random.randint(45, 60) * 10  # 450-600mm
        h = random.randint(35, 50) * 10  # 350-500mm
        items.append(Box(l, w, h, id=len(items), color='#42A5F5'))
    
    # 6. XXL parcels - Nội thất nhỏ (3%)
    for i in range(18):
        l = random.randint(70, 100) * 10  # 700-1000mm
        w = random.randint(50, 80) * 10   # 500-800mm
        h = random.randint(40, 60) * 10   # 400-600mm
        items.append(Box(l, w, h, id=len(items), color='#1E88E5'))
    
    print(f"📦 Total Parcels Generated: {len(items)}")
    print(f"   - XS (thư từ): 180")
    print(f"   - S (phụ kiện): 150")
    print(f"   - M (quần áo): 120")
    print(f"   - L (gia dụng): 90")
    print(f"   - XL (điện tử): 42")
    print(f"   - XXL (nội thất): 18")
    
    # Test cho 3 loại xe với datasets phù hợp
    print("\n" + "="*70)
    print("🚛 TEST 1: COLLECTION TRUCK - Xe tập kết (Ward → District Hub)")
    print("="*70)
    print("Dataset: 80 parcels (mostly XS, S, M - hàng nhỏ)\n")
    result1 = run_packing(items[:80], vehicle_type="COLLECTION")
    
    print("\n" + "="*70)
    print("🚛 TEST 2: INTER-DISTRICT TRUCK - Xe liên tỉnh (District → Province Hub)")
    print("="*70)
    print("Dataset: 250 parcels (mixed sizes)\n")
    result2 = run_packing(items[:250], vehicle_type="INTER_DISTRICT")
    
    print("\n" + "="*70)
    print("🚛 TEST 3: INTER-REGION TRUCK - Xe liên miền (Province → Regional Hub)")
    print("="*70)
    print("Dataset: 600 parcels (all sizes)\n")
    result3 = run_packing(items, vehicle_type="INTER_REGION")
    
    # Tóm tắt so sánh
    print("\n" + "="*70)
    print("📊 COMPARISON SUMMARY")
    print("="*70)
    print(f"Xe tập kết:    {result1['loaded_count']:3d} bundles, {result1['efficiency']:5.1f}% volume efficiency")
    print(f"Xe liên tỉnh:  {result2['loaded_count']:3d} bundles, {result2['efficiency']:5.1f}% volume efficiency")
    print(f"Xe liên miền:  {result3['loaded_count']:3d} bundles, {result3['efficiency']:5.1f}% volume efficiency")
    print("="*70)