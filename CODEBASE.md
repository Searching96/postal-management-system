# CODEBASE.md - File Dependency Tracking

> **Purpose**: Track file dependencies to ensure all affected files are updated together.

---

## Core Dependency Map

### Frontend Application

```
src/
├── App.tsx
│   └── depends: components/*, pages/*, lib/AuthContext.tsx
│
├── components/
│   ├── Layout.tsx
│   │   └── depends: lib/AuthContext, components/ui/*
│   └── ui/
│       └── index.ts (barrel export)
│           └── all UI components depend on this
│
├── lib/
│   ├── axios.ts (API client)
│   │   └── depended by: services/*
│   ├── AuthContext.tsx
│   │   └── depended by: App.tsx, Layout.tsx, ProtectedRoute
│   └── utils.ts
│       └── depended by: pages/*, components/*
│
├── models/
│   └── index.ts (type definitions)
│       └── depended by: services/*, pages/*
│
├── services/
│   ├── orderService.ts → pages/orders/*
│   ├── shipperService.ts → pages/admin/ShipperManagementPage
│   ├── provinceAdminService.ts → pages/province_admin/*
│   ├── hubAdminService.ts → pages/hub_admin/*
│   └── administrativeService.ts → pages/common/ProvincesPage
│
└── pages/
    └── (each page depends on relevant services, models, ui components)
```

---

## Backend Application

```
src/main/java/org/f3/postalmanagement/
├── controller/
│   └── depends: service/, dto/
│
├── service/
│   └── depends: repository/, entity/, mapper/
│
├── repository/
│   └── depends: entity/
│
├── entity/
│   └── core models, depended by all layers
│
├── dto/
│   ├── request/ → validated in controllers
│   └── response/ → returned by services
│
└── mapper/
    └── entity ↔ dto conversions
```

---

## Critical Dependency Rules

1. **API Contract Changes**
   - If you modify a DTO in `backend/dto/`, you MUST update the corresponding TypeScript interface in `frontend/models/`

2. **Service Layer Changes**
   - Backend service changes → may require frontend service updates
   - Frontend service interface changes → update all consuming pages

3. **UI Component Changes**
   - If modifying a component in `components/ui/`, check all pages that import it
   - Always update the barrel export in `components/ui/index.ts`

4. **Route Changes**
   - Adding a route in `App.tsx` → add nav link in `Layout.tsx`
   - Adding a backend endpoint → update frontend service + OpenAPI spec

---

## Change Impact Matrix

| If You Change... | Also Update... |
|------------------|----------------|
| `models/index.ts` | All services using the type |
| `services/*.ts` interface | All pages calling that service |
| `components/ui/*.tsx` | Pages using that component |
| `Layout.tsx` nav items | Nothing (self-contained) |
| Backend `*Controller.java` | Frontend service if endpoint changes |
| Backend `*Request.java` | Frontend request interface |
| Backend `*Response.java` | Frontend response interface |

### Messaging & Communications

```
src/main/java/org/f3/postalmanagement/
├── entity/messaging/
│   └── Message.java
│
├── repository/
│   └── MessageRepository.java → entity/messaging/Message
│
├── dto/messaging/
│   ├── SendMessageRequest.java
│   └── MessageResponse.java
│   └── ContactResponse.java
│
├── service/
│   └── MessageService.java → MessageRepository, UserRepository
│
└── controller/
    └── MessageController.java → MessageService, DTOs
```

### Dependency Rules for Messaging
- **Message DTOs**: If changed, update `frontend/src/services/messageService.ts` interfaces.
- **Search**: `UserRepository` now includes `searchByPhoneNumber`.
