import copy
import random
from dataclasses import dataclass, field
from typing import List
import numpy as np
import plotly.graph_objects as go
import base64
import io

# ==========================================================
# 1. DATA STRUCTURES & 2. ENGINE (Unchanged)
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
    id: int
    dim_l: int = 1200 
    dim_w: int = 1000 
    dim_h: int = 950
    items: List[Box] = field(default_factory=list)
    packer: PackerEngine = None
    
    def __post_init__(self):
        self.packer = PackerEngine(Box(self.dim_l, self.dim_w, self.dim_h))
        
    def add_item(self, item: Box) -> bool:
        if self.packer.add_item(item):
            self.items.append(item)
            return True
        return False
    
    @property
    def current_volume(self): return self.packer.occupied_volume
    
    def as_box(self) -> Box:
        if not self.packer.placements: return Box(self.dim_l, self.dim_w, 150, id=self.id)
        if len(self.items) == 1:
            p = self.packer.placements[0]
            return Box(p.box.l, p.box.w, p.box.h + 150, id=self.id, color=p.box.color)
        max_h = max(p.z + p.box.h for p in self.packer.placements)
        c = f'rgb({random.randint(50,200)},{random.randint(50,200)},{random.randint(50,200)})'
        return Box(self.dim_l, self.dim_w, max_h + 150, id=self.id, color=c)

def run_packing(items: List[Box], container: Box):
    print("\n📦 PHASE 1: Palletizing...")
    bundles = []
    loose_items, full_pallet_items = [], []
    for item in items:
        if item.l >= 1000 and item.w >= 800: full_pallet_items.append(item)
        else: loose_items.append(item)
    
    for item in full_pallet_items:
        b = Bundle(id=len(bundles))
        b.items.append(item)
        b.packer.placements.append(Placement(0,0,0, item))
        b.packer.occupied_volume = item.volume
        bundles.append(b)
        
    loose_items.sort(key=lambda x: x.l*x.w, reverse=True)
    if loose_items and not bundles: bundles.append(Bundle(id=0))
    
    for item in loose_items:
        placed = False
        for b in bundles:
            if len(b.items) == 1 and b.items[0] in full_pallet_items: continue
            if b.add_item(item):
                placed = True; break
        if not placed:
            new_b = Bundle(id=len(bundles))
            if new_b.add_item(item): bundles.append(new_b)
            else: print(f"⚠️ Item too big!")

    print(f"   => Created {len(bundles)} Bundles.")

    print("\n🚛 PHASE 2: Loading Bundles into Container 20ft...")
    container_packer = PackerEngine(container)
    bundle_boxes = [b.as_box() for b in bundles]
    bundle_boxes.sort(key=lambda b: (b.h, b.area), reverse=True)
    
    loaded_count = 0
    packed_volume = 0
    for b_box in bundle_boxes:
        if container_packer.add_item(b_box):
            loaded_count += 1
            original_bundle = next(b for b in bundles if b.id == b_box.id)
            packed_volume += original_bundle.current_volume
        else:
            print(f"   ❌ Failed: Bundle {b_box.id} (Size: {b_box.l}x{b_box.w}x{b_box.h})")

    print("\n" + "="*50)
    print("🏆 FINAL REPORT")
    print(f"Volume Efficiency:   {packed_volume / container.volume * 100:.2f}% (True Items)")
    
    generate_full_report(bundles, container, container_packer.placements)

if __name__ == "__main__":
    items = []
    print("🔄 Generating CHAOS Dataset...")
    colors = ['#EF5350', '#AB47BC', '#5C6BC0', '#29B6F6', '#66BB6A', '#FFA726', '#8D6E63']
    for i in range(160):
        type_id = random.randint(1, 3)
        dims = (600,400,400) if type_id==1 else (400,300,300) if type_id==2 else (300,200,200)
        items.append(Box(*dims, id=len(items), color=colors[i%len(colors)]))
    for i in range(160):
        l, w, h = random.randint(20,70)*10, random.randint(15,50)*10, random.randint(10,40)*10
        items.append(Box(l, w, h, id=len(items), color=colors[i%len(colors)]))
    for i in range(40): items.append(Box(1100, 200, 150, id=len(items), color='#FFD700'))
    for i in range(40): items.append(Box(1200, 500, 600, id=len(items), color='#795548'))

    print(f"📦 Total Items: {len(items)}")
    container_20ft = Box(5898, 2352, 2393)
    run_packing(items, container_20ft)