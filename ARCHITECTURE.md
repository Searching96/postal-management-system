# ARCHITECTURE.md - System Architecture Map

> **Purpose**: High-level overview of the postal management system architecture.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Browser   │  │   Mobile    │  │   Third-Party Systems   │  │
│  │  (React)    │  │   (Future)  │  │   (API Consumers)       │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          └────────────────┼─────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY / NGINX                          │
│                    (port 80/443 → 8080)                          │
└─────────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
┌─────────────────────┐           ┌─────────────────────┐
│   FRONTEND (Vite)   │           │  BACKEND (Spring)   │
│   Port: 5173        │           │  Port: 8080         │
│   React + TS        │    ───►   │  Java 17 + Gradle   │
│   TailwindCSS       │   HTTP    │  Spring Boot 3.x    │
│   React Router      │  /api/*   │  Spring Security    │
└─────────────────────┘           └──────────┬──────────┘
                                             │
                          ┌──────────────────┴──────────────────┐
                          ▼                                     ▼
               ┌─────────────────────┐             ┌─────────────────────┐
               │   PostgreSQL        │             │   MinIO (Future)    │
               │   Port: 5432        │             │   Object Storage    │
               │   - Users           │             │   - Avatars         │
               │   - Orders          │             │   - Documents       │
               │   - Offices         │             └─────────────────────┘
               │   - Batches         │
               └─────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.x |
| **Build Tool** | Vite | 5.x |
| **Styling** | TailwindCSS | 3.x |
| **State** | React Context + useState | - |
| **Forms** | react-hook-form | 7.x |
| **Backend** | Spring Boot | 3.x |
| **Language** | Java | 17 |
| **Security** | Spring Security + JWT | - |
| **Database** | PostgreSQL | 15+ |
| **Migrations** | Flyway | 9.x |
| **API Docs** | OpenAPI/Swagger | 3.x |

---

## User Roles Hierarchy

```
SYSTEM_ADMIN (God mode)
    │
    └── HUB_ADMIN (Regional hub management)
            │
            └── WH_PROVINCE_ADMIN (Province warehouse management)
                    │
                    └── WH_WARD_MANAGER (Ward office management)
                            │
                            └── SHIPPER (Delivery personnel)

CUSTOMER (External users - order tracking, pickup requests)
```

---

## Key Modules

### Frontend Modules

| Module | Path | Purpose |
|--------|------|---------|
| **Auth** | `lib/AuthContext.tsx` | JWT auth, role management |
| **Orders** | `pages/orders/` | Order CRUD, tracking |
| **Batches** | `pages/batches/` | Batch management |
| **Admin** | `pages/admin/` | System-wide admin functions |
| **Province Admin** | `pages/province_admin/` | Province-level management |
| **Hub Admin** | `pages/hub_admin/` | Hub-level management |
| **Shipper** | `pages/shipper/` | Shipper dashboard |

### Backend Modules

| Module | Package | Purpose |
|--------|---------|---------|
| **Auth** | `security/` | JWT, authentication |
| **Orders** | `controller/OrderController` | Order lifecycle |
| **Batches** | `controller/BatchController` | Batch operations |
| **Shippers** | `controller/ShipperController` | Shipper CRUD |
| **Offices** | `controller/OfficeController` | Office hierarchy |
| **Admin** | Various admin controllers | Role-based admin APIs |

---

## API Patterns

### Standard Response Format
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... },
  "errorCode": null
}
```

### Pagination Format
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 10,
  "size": 10,
  "number": 0
}
```

---

## Development Workflow

```
1. PLAN    → Create implementation plan in artifacts
2. CODE    → Follow frontend-guidelines.md rules
3. TEST    → Run local dev servers, test in browser
4. VERIFY  → Check for lint errors, type errors
5. DEPLOY  → Docker Compose (docker-compose.yml)
```

---

## File Locations

| Resource | Path |
|----------|------|
| **Frontend Source** | `frontend/src/` |
| **Backend Source** | `backend/src/main/java/` |
| **Database Migrations** | `backend/src/main/resources/db/migration/` |
| **Docker Config** | `docker-compose.yml` |
| **Frontend Dev Guidelines** | `.agent/workflows/frontend-guidelines.md` |
| **UI/UX Guidelines** | `.agent/workflows/ui-ux-pro-max.md` |
| **File Dependencies** | `CODEBASE.md` |
