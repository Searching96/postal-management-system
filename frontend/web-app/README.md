# Hệ thống Quản lý Bưu chính - Web Application

## 📋 Tổng quan

Ứng dụng web quản lý bưu chính được xây dựng với React, TypeScript, và Tailwind CSS. Hệ thống tuân thủ kiến trúc phân tầng rõ ràng với Data Layer (Models & Services) đồng bộ 1:1 với database schema.

## 🏗️ Kiến trúc Project

```
frontend/web-app/
├── src/
│   ├── models/              # TypeScript Interfaces & Enums (1:1 với SQL schema)
│   │   ├── enums.ts         # Tất cả ENUM types
│   │   ├── user.model.ts
│   │   ├── organization.model.ts
│   │   ├── customer.model.ts
│   │   ├── order.model.ts
│   │   └── ... (20 model files)
│   │
│   ├── services/            # Service classes với Mock Data
│   │   ├── base.service.ts  # Abstract base class
│   │   ├── auth.service.ts
│   │   ├── order.service.ts
│   │   ├── customer.service.ts
│   │   ├── pricing.service.ts
│   │   ├── location.service.ts
│   │   └── organization.service.ts
│   │
│   ├── components/          # Reusable UI Components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Table.tsx
│   │   └── Modal.tsx
│   │
│   ├── layouts/             # Layout wrappers
│   │   ├── DashboardLayout.tsx  # Main app layout với sidebar
│   │   └── AuthLayout.tsx       # Login/Auth layout
│   │
│   ├── pages/               # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CreateOrderPage.tsx
│   │   └── OrderListPage.tsx
│   │
│   ├── store/               # Zustand state management
│   │   └── auth.store.ts
│   │
│   ├── lib/                 # Utilities
│   │   └── utils.ts         # Helper functions
│   │
│   ├── App.tsx              # Main app với routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống

- Node.js >= 18.x
- pnpm, npm, hoặc yarn

### Bước 1: Cài đặt dependencies

```bash
cd frontend/web-app
npm install
```

### Bước 2: Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3000**

### Bước 3: Build production

```bash
npm run build
npm run preview
```

## 🔐 Tài khoản Demo

Hệ thống có sẵn các tài khoản mock để test:

| Username    | Password   | Role    | Quyền truy cập              |
| ----------- | ---------- | ------- | --------------------------- |
| `admin`     | `password` | ADMIN   | Toàn quyền quản trị         |
| `clerk01`   | `password` | CLERK   | Tiếp nhận, quản lý đơn hàng |
| `courier01` | `password` | COURIER | Xem tuyến giao hàng         |
| `manager01` | `password` | MANAGER | Quản lý bưu cục             |

## 🎯 Chức năng Đã Triển khai

### ✅ Phase 1: Data Layer (Hoàn thành)

- [x] 20 TypeScript Models (1:1 mapping với SQL schema)
- [x] 7 Service Classes với Vietnamese Mock Data
- [x] Mock API simulation với delay 300-800ms
- [x] Pricing calculation engine
- [x] Location data (Provinces, Districts, Wards)

### ✅ Phase 2: UI Foundation (Hoàn thành)

- [x] Tailwind CSS configuration
- [x] 7 Reusable Components (Button, Input, Select, Card, Badge, Table, Modal)
- [x] DashboardLayout với role-based navigation
- [x] AuthLayout cho login
- [x] React Router với protected routes
- [x] Zustand store cho authentication

### ✅ Phase 3: Core Features (Hoàn thành)

- [x] **Login Page** - Đăng nhập với mock authentication
- [x] **Dashboard** - Tổng quan với statistics real-time
- [x] **Create Order** - Form tiếp nhận đơn hàng với:
  - Customer selection dropdown
  - Dynamic pricing calculation
  - Service type selection (Hỏa tốc, Nhanh, Tiết kiệm)
  - COD & Insurance fee calculation
  - Vietnamese address autocomplete
- [x] **Order List** - Danh sách đơn hàng với:
  - Search by tracking number, name, phone
  - Filter by status
  - Table view với pagination
  - Status badges

### 🚧 Phase 4: Advanced Features (Đang phát triển)

- [ ] Order Detail & Tracking Timeline
- [ ] Delivery Route Management
- [ ] Complaint Management
- [ ] Customer Management
- [ ] Reports & Analytics
- [ ] Settings & Configuration

## 🎨 Design System

### Colors

- **Primary**: Blue (#3b82f6) - Actions, Links
- **Secondary**: Slate Gray - Text, Borders
- **Success**: Green - Delivered status
- **Warning**: Yellow - Pending status
- **Danger**: Red - Failed status

### Typography

- Font Family: Inter (Google Fonts)
- Sizes: text-xs → text-3xl (Tailwind scale)

### Components

Tất cả components follow convention:

- Props interface exported
- React.forwardRef cho form elements
- Tailwind CSS cho styling
- Consistent sizing (sm, md, lg)

## 📦 Tech Stack

- **Framework**: React 18+ với Vite
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **State**: Zustand (Global Auth Store)
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## 🌍 Vietnamese Content

Tất cả UI content đều bằng **Tiếng Việt**:

- Labels, placeholders, buttons
- Error messages
- Mock data (names, addresses, phone numbers)
- Status labels
- Currency format (VNĐ)

## 📊 Mock Data Examples

### Customers

- Nguyễn Văn Dũng (Individual)
- Trần Thị Hoa / Thời Trang Hoa Mai (SME)
- Phạm Minh Tuấn / Công ty TNHH Điện Tử Việt (Enterprise)

### Orders

- 5 sample orders với Vietnamese data
- Tracking numbers: VN20250120000123VN
- Real addresses in TP.HCM & Hà Nội
- COD amounts: 300,000 - 1,200,000 VNĐ

### Locations

- 8 Provinces (HCM, Hanoi, Da Nang...)
- 16 Districts
- 8 Wards

## 🔧 Development Tips

### Hot Module Replacement (HMR)

Vite tự động reload khi có thay đổi code

### TypeScript Path Aliases

```typescript
import { Button } from "@/components";
import { OrderService } from "@/services";
import { Order } from "@/models";
```

### Debugging Mock Services

Mock services có artificial delay 300-800ms. Có thể điều chỉnh trong `base.service.ts`:

```typescript
protected readonly MIN_DELAY = 300;
protected readonly MAX_DELAY = 800;
```

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `DashboardLayout.tsx` với role restriction

## 📝 Coding Conventions

### File Naming

- Components: PascalCase (e.g., `Button.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- Models: kebab-case (e.g., `order.model.ts`)

### Component Structure

```typescript
// 1. Imports
import React from "react";
import { useNavigate } from "react-router-dom";

// 2. Interfaces
export interface MyComponentProps {
  title: string;
}

// 3. Component
export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  // 4. Hooks
  const navigate = useNavigate();
  const [state, setState] = React.useState();

  // 5. Effects
  React.useEffect(() => {}, []);

  // 6. Handlers
  const handleClick = () => {};

  // 7. Render
  return <div>{title}</div>;
};
```

## 🐛 Troubleshooting

### Port đã được sử dụng

```bash
# Thay đổi port trong vite.config.ts
server: { port: 3001 }
```

### Module not found

```bash
npm install
# hoặc xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tailwind styles không load

```bash
# Kiểm tra tailwind.config.js content paths
# Restart dev server
```

## 📞 Support

Liên hệ SE100 Team để được hỗ trợ.

---

**Built with ❤️ by SE100 Team | 2025**
