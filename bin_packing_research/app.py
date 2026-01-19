import dash
from dash import dcc, html, Input, Output
import dash_bootstrap_components as dbc
import plotly.graph_objects as go
import random
from dataclasses import dataclass, field
from typing import List
import numpy as np

# ==========================================================
# 1. CORE LOGIC (COPY TỪ CODE CŨ - GIỮ NGUYÊN)
# ==========================================================
@dataclass(frozen=True)
class Box:
    l: int; w: int; h: int; id: int = -1; color: str = 'blue'
    @property
    def volume(self): return self.l * self.w * self.h
    @property
    def area(self): return self.l * self.w
    def get_orientations(self):
        unique = set()
        perms = [(self.l, self.w, self.h), (self.l, self.h, self.w), (self.w, self.l, self.h), (self.w, self.h, self.l), (self.h, self.l, self.w), (self.h, self.w, self.l)]
        res = []
        for p in perms:
            if p not in unique:
                unique.add(p); res.append(Box(*p, id=self.id, color=self.color))
        return res

@dataclass
class Placement:
    x: int; y: int; z: int; box: Box

class PackerEngine:
    def __init__(self, container_dims: Box):
        self.container = container_dims
        self.placements = []
        self.ep = [(0, 0, 0)] 
        self.occupied_volume = 0
    def intersect(self, x, y, z, b, p):
        return (x < p.x + p.box.l and x + b.l > p.x and y < p.y + p.box.w and y + b.w > p.y and z < p.z + p.box.h and z + b.h > p.z)
    def check_support(self, x, y, z, width, length):
        if z == 0: return True
        box_area = width * length; supported_area = 0
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
        best_ep, best_orient, best_score = None, None, float('inf')
        sorted_eps = sorted(self.ep, key=lambda p: (p[2], p[1], p[0]))
        for ep in sorted_eps: 
            for orient in box.get_orientations():
                if self.can_place(*ep, orient):
                    gap_x = self.container.l - (ep[0] + orient.l); gap_y = self.container.w - (ep[1] + orient.w)
                    dead_space = 0
                    if 0 < gap_x < 50: dead_space += 100000
                    if 0 < gap_y < 50: dead_space += 100000
                    score = (ep[2] * 1000000) + (ep[1] * 100) + ep[0] + dead_space + (-orient.area / 100)
                    if score < best_score: best_score = score; best_ep, best_orient = ep, orient
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
            if not (ep[0] >= x and ep[0] < x + box.l and ep[1] >= y and ep[1] < y + box.w and ep[2] >= z and ep[2] < z + box.h): valid_eps.append(ep)
        self.ep = valid_eps

@dataclass
class Bundle:
    id: int; dim_l: int = 1200; dim_w: int = 1000; dim_h: int = 950
    items: List[Box] = field(default_factory=list); packer: PackerEngine = None
    def __post_init__(self): self.packer = PackerEngine(Box(self.dim_l, self.dim_w, self.dim_h))
    def add_item(self, item: Box) -> bool:
        if self.packer.add_item(item): self.items.append(item); return True
        return False
    def as_box(self) -> Box:
        if not self.packer.placements: return Box(self.dim_l, self.dim_w, 150, id=self.id)
        if len(self.items) == 1:
            p = self.packer.placements[0]
            return Box(p.box.l, p.box.w, p.box.h + 150, id=self.id, color=p.box.color)
        max_h = max(p.z + p.box.h for p in self.packer.placements)
        return Box(self.dim_l, self.dim_w, max_h + 150, id=self.id, color=f'rgb({random.randint(50,200)},{random.randint(50,200)},{random.randint(50,200)})')

# --- CHẠY TÍNH TOÁN 1 LẦN DUY NHẤT KHI KHỞI ĐỘNG APP ---
def run_simulation():
    print("⏳ Calculating packing layout... (This runs once)")
    items = []
    colors = ['#EF5350', '#AB47BC', '#5C6BC0', '#29B6F6', '#66BB6A', '#FFA726', '#8D6E63']
    for i in range(160):
        type_id = random.randint(1, 3)
        dims = (600,400,400) if type_id==1 else (400,300,300) if type_id==2 else (300,200,200)
        items.append(Box(*dims, id=len(items), color=colors[i%len(colors)]))
    for i in range(160):
        items.append(Box(random.randint(20,70)*10, random.randint(15,50)*10, random.randint(10,40)*10, id=len(items), color=colors[i%len(colors)]))
    for i in range(40): items.append(Box(1100, 200, 150, id=len(items), color='#FFD700'))
    for i in range(40): items.append(Box(1200, 500, 600, id=len(items), color='#795548'))

    # Phase 1
    bundles = []
    loose, full = [], []
    for item in items: (full if item.l >= 1000 and item.w >= 800 else loose).append(item)
    for item in full:
        b = Bundle(id=len(bundles)); b.add_item(item); bundles.append(b)
    loose.sort(key=lambda x: x.l*x.w, reverse=True)
    if loose: bundles.append(Bundle(id=len(bundles)))
    for item in loose:
        placed = False
        for b in bundles:
            if len(b.items) == 1 and b.items[0] in full: continue
            if b.add_item(item): placed = True; break
        if not placed:
            b = Bundle(id=len(bundles)); b.add_item(item); bundles.append(b)
    
    # Phase 2
    container_20ft = Box(5898, 2352, 2393)
    container_packer = PackerEngine(container_20ft)
    bundle_boxes = [b.as_box() for b in bundles]
    bundle_boxes.sort(key=lambda b: (b.h, b.area), reverse=True)
    
    for b_box in bundle_boxes: container_packer.add_item(b_box)
    
    print("✅ Simulation Done!")
    return bundles, container_packer, container_20ft

# Biến toàn cục lưu kết quả
BUNDLES, CONTAINER_PACKER, CONTAINER_DIMS = run_simulation()

# ==========================================================
# 2. DASHBOARD APP
# ==========================================================
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])

# --- Layout ---
app.layout = dbc.Container([
    dbc.Row([
        dbc.Col(html.H1("📦 Warehouse Packing Assistant", className="text-center mb-4"), width=12)
    ]),
    
    dbc.Row([
        # Cột điều khiển bên trái
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("1. Select Unit to View"),
                dbc.CardBody([
                    dcc.RadioItems(
                        id='view-mode',
                        options=[
                            {'label': '🚛 Main Container', 'value': 'container'},
                            {'label': '📦 Specific Bundle', 'value': 'bundle'}
                        ],
                        value='container',
                        labelStyle={'display': 'block', 'marginBottom': '10px'}
                    ),
                    html.Div(id='bundle-selector-container', children=[
                        html.Label("Select Bundle ID:"),
                        dcc.Dropdown(
                            id='bundle-dropdown',
                            options=[{'label': f"Bundle #{b.id} ({len(b.items)} items)", 'value': b.id} for b in BUNDLES],
                            value=BUNDLES[0].id if BUNDLES else None,
                            clearable=False
                        )
                    ], style={'display': 'none'})
                ])
            ], className="mb-3"),

            dbc.Card([
                dbc.CardHeader("2. Loading Sequence (Step-by-Step)"),
                dbc.CardBody([
                    html.Label("Drag slider to see packing order:"),
                    dcc.Slider(
                        id='step-slider',
                        min=0, max=10, step=1, value=0,
                        marks=None,
                        tooltip={"placement": "bottom", "always_visible": True}
                    ),
                    html.Div(id='step-info', className="mt-2 text-primary font-weight-bold")
                ])
            ])
        ], width=3),

        # Cột hiển thị 3D bên phải
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    dcc.Graph(id='3d-plot', style={'height': '75vh'})
                ])
            ])
        ], width=9)
    ])
], fluid=True, className="mt-3")

# --- Callbacks ---

# 1. Ẩn/Hiện Dropdown chọn Bundle
@app.callback(
    Output('bundle-selector-container', 'style'),
    Input('view-mode', 'value')
)
def toggle_dropdown(mode):
    return {'display': 'block'} if mode == 'bundle' else {'display': 'none'}

# 2. Cập nhật Slider Max Value dựa trên đối tượng đang chọn
@app.callback(
    [Output('step-slider', 'max'), Output('step-slider', 'value')],
    [Input('view-mode', 'value'), Input('bundle-dropdown', 'value')]
)
def update_slider_max(mode, bundle_id):
    if mode == 'container':
        max_val = len(CONTAINER_PACKER.placements)
        return max_val, max_val # Mặc định hiển thị full
    else:
        # Tìm bundle được chọn
        selected_bundle = next((b for b in BUNDLES if b.id == bundle_id), None)
        if selected_bundle:
            max_val = len(selected_bundle.packer.placements)
            return max_val, max_val
    return 0, 0

# 3. Vẽ biểu đồ 3D chính
@app.callback(
    [Output('3d-plot', 'figure'), Output('step-info', 'children')],
    [Input('view-mode', 'value'), 
     Input('bundle-dropdown', 'value'),
     Input('step-slider', 'value')]
)
def update_graph(mode, bundle_id, step):
    fig = go.Figure()
    
    # Xác định đối tượng cần vẽ (Container hay Bundle)
    target_placements = []
    target_dims = None
    title = ""
    
    if mode == 'container':
        target_placements = CONTAINER_PACKER.placements
        target_dims = CONTAINER_DIMS
        title = "🚛 Container 20ft Loading Plan"
    else:
        selected_bundle = next((b for b in BUNDLES if b.id == bundle_id), None)
        if selected_bundle:
            target_placements = selected_bundle.packer.placements
            # Lấy kích thước thật (đã shrink nếu cần) để vẽ khung đẹp
            box_rep = selected_bundle.as_box()
            # Trừ đế pallet 150mm để ra kích thước hàng hóa cho dễ nhìn
            target_dims = Box(box_rep.l, box_rep.w, box_rep.h - 150 if len(selected_bundle.items)==1 else selected_bundle.dim_h)
            title = f"📦 Bundle #{selected_bundle.id} (Items: {len(selected_bundle.items)})"
    
    # Lọc placements theo step (sequence)
    # Step = 0: Rỗng. Step = 1: Item đầu tiên.
    current_placements = target_placements[:step]
    
    info_text = f"Showing {step}/{len(target_placements)} items."
    if step > 0 and step <= len(target_placements):
        last_item = current_placements[-1]
        info_text += f" Last added: ID {last_item.box.id} ({last_item.box.l}x{last_item.box.w}x{last_item.box.h})"

    # --- VẼ ITEMS ---
    for p in current_placements:
        x, y, z = p.x, p.y, p.z
        l, w, h = p.box.l, p.box.w, p.box.h
        
        # Vertices
        x_c = [x, x+l, x+l, x, x, x+l, x+l, x]
        y_c = [y, y, y+w, y+w, y, y, y+w, y+w]
        z_c = [z, z, z, z, z+h, z+h, z+h, z+h]
        
        i_idx = [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2]
        j_idx = [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3]
        k_idx = [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6]

        # Khối màu
        fig.add_trace(go.Mesh3d(
            x=x_c, y=y_c, z=z_c, i=i_idx, j=j_idx, k=k_idx,
            color=p.box.color, opacity=1.0, flatshading=True,
            name=f"ID:{p.box.id}", hoverinfo='name'
        ))
        
        # Viền đen
        lines_x = [x, x+l, x+l, x, x, None, x, x, None, x+l, x+l, None, x+l, x+l, None, x, x, x+l, x+l, x, x]
        lines_y = [y, y, y+w, y+w, y, None, y, y, None, y, y, None, y+w, y+w, None, y+w, y+w, y, y, y+w, y+w]
        lines_z = [z, z, z, z, z, None, z, z+h, None, z, z+h, None, z, z+h, None, z, z+h, z+h, z+h, z+h, z+h]
        
        fig.add_trace(go.Scatter3d(
            x=lines_x, y=lines_y, z=lines_z,
            mode='lines', line=dict(color='black', width=3),
            hoverinfo='skip', showlegend=False
        ))
        
        # ID Text
        fig.add_trace(go.Scatter3d(
            x=[x+l/2], y=[y+w/2], z=[z+h/2],
            mode='text', text=[str(p.box.id)],
            textfont=dict(color='black', size=10),
            hoverinfo='skip', showlegend=False
        ))

    # --- VẼ KHUNG CHỨA (Wireframe) ---
    if target_dims:
        cx, cy, cz = target_dims.l, target_dims.w, target_dims.h
        fig.add_trace(go.Mesh3d(
            x=[0, cx, cx, 0, 0, cx, cx, 0],
            y=[0, 0, cy, cy, 0, 0, cy, cy],
            z=[0, 0, 0, 0, cz, cz, cz, cz],
            i=[7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2],
            j=[3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3],
            k=[0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
            color='gray', opacity=0.1, name='Boundary', hoverinfo='skip'
        ))
        
        # Layout Settings
        max_dim = max(cx, cy, cz)
        fig.update_layout(
            title=title,
            scene=dict(
                xaxis=dict(range=[0, max_dim], title='Length'),
                yaxis=dict(range=[0, max_dim], title='Width'),
                zaxis=dict(range=[0, max_dim], title='Height'),
                aspectmode='data',
                camera=dict(eye=dict(x=1.6, y=1.6, z=1.6))
            ),
            margin=dict(l=0, r=0, b=0, t=40)
        )

    return fig, info_text

if __name__ == '__main__':
    # Mở browser tự động
    import webbrowser
    webbrowser.open("http://127.0.0.1:8050/")
    app.run(debug=False)