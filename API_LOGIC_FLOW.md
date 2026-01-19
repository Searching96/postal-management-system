# API Logic Flow Documentation

> **Version**: 1.0 | **Generated**: 2026-01-18
> **Source**: OpenAPI Specification + Controller Analysis

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Authentication Flow](#authentication-flow)
3. [User Role Hierarchy](#user-role-hierarchy)
4. [Order Lifecycle Flow](#order-lifecycle-flow)
5. [Batch Management Flow](#batch-management-flow)
6. [Employee Management Hierarchy](#employee-management-hierarchy)
7. [Route & Administrative APIs](#route--administrative-apis)
8. [Endpoint Reference Matrix](#endpoint-reference-matrix)

---

## System Overview

```mermaid
flowchart TB
    subgraph External
        CUSTOMER[Customer]
        PUBLIC[Public User]
    end
    
    subgraph "Authentication Layer"
        AUTH["/api/auth"]
    end
    
    subgraph "Core Operations"
        ORDER["/api/orders"]
        BATCH["/api/batches"]
    end
    
    subgraph "Employee Management"
        HUB["/api/hub-admins"]
        PROV["/api/province-admin"]
        WARD["/api/ward-manager"]
        SHIP["/api/shippers"]
    end
    
    subgraph "Infrastructure"
        ADMIN["/api/administrative"]
        ROUTE["/api/routes"]
        UPLOAD["/api/uploads"]
    end
    
    CUSTOMER --> AUTH
    PUBLIC --> ORDER
    AUTH --> ORDER
    ORDER --> BATCH
    BATCH --> ROUTE
```

---

## Authentication Flow

### Endpoints

| Method | Path | Intention | Access |
|--------|------|-----------|--------|
| `POST` | `/api/auth/login` | Authenticate user, return JWT token | PUBLIC |
| `POST` | `/api/auth/register` | Register new customer account | PUBLIC |
| `GET` | `/api/users/me` | Get current authenticated user info | AUTHENTICATED |

### Logic Flow

```mermaid
sequenceDiagram
    participant U as User
    participant API as Auth API
    participant DB as Database
    participant JWT as JWT Service
    
    rect rgb(200, 230, 255)
        Note over U,JWT: Login Flow
        U->>API: POST /auth/login {username, password}
        API->>DB: Find account by username
        DB-->>API: Account data
        API->>API: Validate password (BCrypt)
        API->>JWT: Generate token with roles
        JWT-->>API: JWT Token
        API-->>U: AuthResponse {token, user, roles}
    end
    
    rect rgb(255, 230, 200)
        Note over U,JWT: Registration Flow
        U->>API: POST /auth/register {username, email, phone, password}
        API->>DB: Check username uniqueness
        DB-->>API: No conflict
        API->>DB: Create Account + Customer entity
        API-->>U: Success (201 Created)
    end
```

---

## User Role Hierarchy

```mermaid
flowchart TD
    SYS[SYSTEM_ADMIN<br/>God mode]
    HUB[HUB_ADMIN<br/>Regional hub management]
    
    subgraph Province Level
        WH_PROV[WH_PROVINCE_ADMIN<br/>Warehouse management]
        PO_PROV[PO_PROVINCE_ADMIN<br/>Post office management]
    end
    
    subgraph Ward Level
        WH_WARD[WH_WARD_MANAGER<br/>Warehouse ward ops]
        PO_WARD[PO_WARD_MANAGER<br/>Post office ward ops]
    end
    
    subgraph Operational
        WH_STAFF[WH_STAFF<br/>Warehouse workers]
        PO_STAFF[PO_STAFF<br/>Post office clerks]
        SHIPPER[SHIPPER<br/>Delivery personnel]
    end
    
    CUST[CUSTOMER<br/>External users]
    
    SYS --> HUB
    HUB --> WH_PROV
    HUB --> PO_PROV
    WH_PROV --> WH_WARD
    PO_PROV --> PO_WARD
    WH_WARD --> WH_STAFF
    WH_WARD --> SHIPPER
    PO_WARD --> PO_STAFF
```

### Role Permissions Summary

| Role | Scope | Key Capabilities |
|------|-------|------------------|
| `SYSTEM_ADMIN` | Global | Register HUB admins, view all data |
| `HUB_ADMIN` | Region | Manage province offices, routes |
| `WH_PROVINCE_ADMIN` | Province | Create ward managers, manage warehouses |
| `PO_PROVINCE_ADMIN` | Province | Create ward offices, manage post offices |
| `WH_WARD_MANAGER` | Ward | Manage WH staff, shippers |
| `PO_WARD_MANAGER` | Ward | Manage PO staff, create orders |
| `PO_STAFF` | Office | Accept orders, calculate prices |
| `WH_STAFF` | Office | Handle packages, transit items |
| `SHIPPER` | Assigned | Pickup/delivery operations |
| `CUSTOMER` | Self | Track orders, request pickups |

---

## Order Lifecycle Flow

### Order Status State Machine

```mermaid
stateDiagram-v2
    [*] --> CREATED: Staff creates order
    [*] --> PENDING_PICKUP: Customer requests pickup
    
    PENDING_PICKUP --> PICKED_UP: Shipper picks up
    PICKED_UP --> AT_ORIGIN_OFFICE: Arrives at office
    CREATED --> AT_ORIGIN_OFFICE: Direct drop-off
    
    AT_ORIGIN_OFFICE --> SORTED_AT_ORIGIN: Added to batch
    
    SORTED_AT_ORIGIN --> IN_TRANSIT_TO_HUB: Batch dispatched
    IN_TRANSIT_TO_HUB --> AT_HUB: Arrives at origin hub
    AT_HUB --> IN_TRANSIT_TO_DESTINATION: Inter-hub transfer
    IN_TRANSIT_TO_DESTINATION --> AT_DESTINATION_HUB: Arrives at destination hub
    
    AT_DESTINATION_HUB --> IN_TRANSIT_TO_OFFICE: Last-mile dispatch
    IN_TRANSIT_TO_OFFICE --> AT_DESTINATION_OFFICE: Arrives at local office
    
    AT_DESTINATION_OFFICE --> OUT_FOR_DELIVERY: Assigned to shipper
    OUT_FOR_DELIVERY --> DELIVERED: Successful delivery
    OUT_FOR_DELIVERY --> DELIVERY_FAILED: Failed attempt
    
    DELIVERY_FAILED --> OUT_FOR_DELIVERY: Retry
    DELIVERY_FAILED --> RETURNING: Return requested
    RETURNING --> RETURNED: Returned to sender
    
    AT_ORIGIN_OFFICE --> CANCELLED: Order cancelled
    ON_HOLD --> [*]: Resolved
    LOST --> [*]: Investigation closed
```

### Order Controller Endpoints

| Method | Path | Intention | Triggering Role |
|--------|------|-----------|-----------------|
| `POST` | `/api/orders/calculate-price` | Calculate shipping cost before creation | PO_STAFF, CUSTOMER |
| `POST` | `/api/orders` | Create new order at post office | PO_STAFF, PO_WARD_MANAGER |
| `GET` | `/api/orders/{orderId}` | Get order details by ID | All staff + CUSTOMER |
| `GET` | `/api/orders/track/{trackingNumber}` | Public tracking (sanitized) | PUBLIC |
| `GET` | `/api/orders` | List orders at current office (paginated) | Office staff |
| `GET` | `/api/orders/by-phone/{phone}` | Find orders by sender phone | Office staff |
| `GET` | `/api/orders/customer/{customerId}` | Get customer's order history | CUSTOMER (self), Staff |
| `POST` | `/api/orders/customer/pickup` | Customer requests home pickup | CUSTOMER |
| `GET` | `/api/orders/pending-pickups` | List pending pickup requests | PO_STAFF |
| `POST` | `/api/orders/assign-shipper` | Assign shipper to pickup | PO_STAFF |
| `GET` | `/api/orders/shipper/assigned` | Shipper's assigned pickups | SHIPPER |
| `POST` | `/api/orders/{orderId}/pickup` | Mark order as picked up | SHIPPER |

### Order Creation Flow

```mermaid
sequenceDiagram
    participant C as Customer/Staff
    participant API as Order API
    participant SVC as OrderService
    participant DB as Database
    
    rect rgb(230, 255, 230)
        Note over C,DB: Price Calculation (Optional)
        C->>API: POST /orders/calculate-price
        API->>SVC: Calculate based on weight, dimensions, distance
        SVC-->>API: PriceCalculationResponse
        API-->>C: Price breakdown {base, weight, distance, total}
    end
    
    rect rgb(255, 240, 200)
        Note over C,DB: Order Creation
        C->>API: POST /orders {sender, receiver, items, serviceType}
        API->>SVC: createOrder()
        SVC->>DB: Create Order entity
        SVC->>DB: Generate tracking number (VN...)
        SVC->>DB: Create StatusHistory entry
        DB-->>SVC: Order saved
        SVC-->>API: OrderResponse
        API-->>C: 201 Created + Order details
    end
```

### Customer Pickup Flow

```mermaid
sequenceDiagram
    participant CU as Customer
    participant PO as Post Office Staff
    participant SH as Shipper
    participant API as Order API
    
    CU->>API: POST /orders/customer/pickup
    Note over API: Status: PENDING_PICKUP
    
    PO->>API: GET /orders/pending-pickups
    API-->>PO: List of pending pickups
    
    PO->>API: POST /orders/assign-shipper {orderId, shipperId}
    Note over API: Shipper assigned
    
    SH->>API: GET /orders/shipper/assigned
    API-->>SH: Assigned pickup orders
    
    SH->>API: POST /orders/{orderId}/pickup
    Note over API: Status: PICKED_UP → AT_ORIGIN_OFFICE
```

---

## Batch Management Flow

### Batch Status State Machine

```mermaid
stateDiagram-v2
    [*] --> OPEN: Create batch
    OPEN --> PROCESSING: Orders being added
    PROCESSING --> OPEN: Continue accepting
    OPEN --> SEALED: Seal batch
    PROCESSING --> SEALED: Seal batch
    SEALED --> IN_TRANSIT: Dispatch
    IN_TRANSIT --> ARRIVED: Mark arrived
    ARRIVED --> DISTRIBUTED: Orders distributed
    DISTRIBUTED --> [*]
    
    OPEN --> CANCELLED: Cancel
    PROCESSING --> CANCELLED: Cancel
    CANCELLED --> [*]
```

### Batch Controller Endpoints

| Method | Path | Intention | Description |
|--------|------|-----------|-------------|
| `POST` | `/api/batches` | Create new batch | Manual batch creation for destination |
| `POST` | `/api/batches/auto-batch` | Auto-batch orders | System auto-groups by destination |
| `POST` | `/api/batches/add-orders` | Add orders to batch | Add specific orders to existing batch |
| `DELETE` | `/api/batches/{batchId}/orders/{orderId}` | Remove order | Remove order from unsealed batch |
| `POST` | `/api/batches/{batchId}/seal` | Seal batch | Lock batch, prevent modifications |
| `POST` | `/api/batches/{batchId}/dispatch` | Dispatch batch | Mark batch as in-transit |
| `POST` | `/api/batches/{batchId}/arrive` | Mark arrived | Batch arrived at destination |
| `POST` | `/api/batches/{batchId}/distribute` | Distribute | Unpack and distribute orders |
| `POST` | `/api/batches/{batchId}/cancel` | Cancel batch | Cancel batch (manager+ only) |
| `GET` | `/api/batches/{batchId}` | Get batch by ID | View batch details |
| `GET` | `/api/batches/code/{batchCode}` | Get by code | Lookup by batch code |
| `GET` | `/api/batches` | List batches | Batches at current office |
| `GET` | `/api/batches/incoming` | Incoming batches | Batches destined for this office |
| `GET` | `/api/batches/open` | Open batches | Unsealed batches for adding orders |
| `GET` | `/api/batches/destinations` | Batchable destinations | Offices with unbatched orders |

### Batch Lifecycle Flow

```mermaid
sequenceDiagram
    participant S as Staff
    participant B as Batch API
    participant O as Order
    participant R as Route System
    
    rect rgb(200, 230, 255)
        Note over S,R: Batch Creation
        S->>B: POST /batches {destinationOfficeId, notes}
        B-->>S: Batch created (OPEN)
        
        S->>B: POST /batches/add-orders {batchId, orderIds[]}
        B->>O: Update orders → SORTED_AT_ORIGIN
        B-->>S: Orders added
    end
    
    rect rgb(255, 230, 200)
        Note over S,R: Dispatch Phase
        S->>B: POST /batches/{id}/seal
        B-->>S: Batch SEALED
        
        S->>B: POST /batches/{id}/dispatch
        B->>O: Update orders → IN_TRANSIT_TO_HUB
        B-->>S: Batch IN_TRANSIT
    end
    
    rect rgb(230, 255, 230)
        Note over S,R: Arrival & Distribution
        S->>B: POST /batches/{id}/arrive
        B-->>S: Batch ARRIVED
        
        S->>B: POST /batches/{id}/distribute
        B->>O: Update orders → AT_DESTINATION_OFFICE
        B-->>S: Batch DISTRIBUTED
    end
```

---

## Employee Management Hierarchy

### Management APIs by Level

```mermaid
flowchart LR
    subgraph "System Level"
        D_REG["/api/dashboard/register-admin"]
    end
    
    subgraph "Hub Level"
        H_REG["/api/hub-admins/register"]
        H_OFF["/api/hub-admins/province-offices"]
    end
    
    subgraph "Province Level"
        P_ADMIN["/api/province-admin/employees/province-admin"]
        P_WARD["/api/province-admin/employees/ward-manager"]
        P_STAFF["/api/province-admin/employees/staff"]
        P_OFFICE["/api/province-admin/ward-offices"]
    end
    
    subgraph "Ward Level"
        W_LIST["/api/ward-manager/employees"]
        W_STAFF["/api/ward-manager/employees/staff"]
        W_MGR["/api/ward-manager/employees/ward-manager"]
    end
    
    subgraph "Shipper Management"
        S_CRUD["/api/shippers"]
    end
    
    D_REG --> H_REG
    H_REG --> P_ADMIN
    P_ADMIN --> P_WARD
    P_WARD --> W_STAFF
    P_WARD --> S_CRUD
```

### Province Admin Endpoints

| Method | Path | Intention |
|--------|------|-----------|
| `POST` | `/api/province-admin/employees/province-admin` | Create Province Admin |
| `POST` | `/api/province-admin/employees/ward-manager` | Create Ward Manager |
| `POST` | `/api/province-admin/employees/staff` | Create Staff member |
| `POST` | `/api/province-admin/ward-offices` | Create ward office pair (PO+WH) |
| `POST` | `/api/province-admin/ward-offices/assign-wards` | Assign wards to office pair |
| `GET` | `/api/province-admin/ward-offices` | List ward office pairs |
| `GET` | `/api/province-admin/wards/assignment-status` | Check ward coverage |
| `GET` | `/api/province-admin/employees` | List employees |
| `GET/PUT/DELETE` | `/api/province-admin/employees/{staffId}` | CRUD operations |

### Ward Manager Endpoints

| Method | Path | Intention |
|--------|------|-----------|
| `GET` | `/api/ward-manager/employees` | List staff in office |
| `GET` | `/api/ward-manager/employees/{staffId}` | Get staff details |
| `PUT` | `/api/ward-manager/employees/{staffId}` | Update staff |
| `DELETE` | `/api/ward-manager/employees/{staffId}` | Soft delete staff |
| `POST` | `/api/ward-manager/employees/staff` | Create new staff |
| `POST` | `/api/ward-manager/employees/ward-manager` | Create peer manager |

### Shipper CRUD

| Method | Path | Intention | Roles |
|--------|------|-----------|-------|
| `POST` | `/api/shippers` | Create shipper | HUB_ADMIN, WH_*_ADMIN, WH_WARD_MANAGER |
| `GET` | `/api/shippers` | List shippers (paginated) | Same + PO_* |
| `GET` | `/api/shippers/{id}` | Get shipper details | Same |
| `PUT` | `/api/shippers/{id}` | Update shipper | HUB_ADMIN, WH_*_ADMIN, WH_WARD_MANAGER |
| `DELETE` | `/api/shippers/{id}` | Soft delete shipper | Same |

---

## Route & Administrative APIs

### Administrative Data APIs

```mermaid
flowchart LR
    subgraph "Geographic Hierarchy"
        R[Regions] --> P[Provinces]
        P --> W[Wards]
        W --> O[Offices]
    end
    
    subgraph "API Endpoints"
        A1["/api/administrative/regions"]
        A2["/api/administrative/provinces"]
        A3["/api/administrative/provinces/{code}/wards"]
        A4["/api/administrative/provinces/{code}/post-offices"]
    end
    
    R -.-> A1
    P -.-> A2
    W -.-> A3
    O -.-> A4
```

| Method | Path | Intention | Access |
|--------|------|-----------|--------|
| `GET` | `/api/administrative/regions` | Get all regions (6 Vietnam regions) | PUBLIC |
| `GET` | `/api/administrative/regions/{id}/provinces` | Get provinces in region | PUBLIC |
| `GET` | `/api/administrative/provinces` | Get all provinces | PUBLIC |
| `GET` | `/api/administrative/provinces/paginated` | Paginated province list | PUBLIC |
| `GET` | `/api/administrative/provinces/{code}/wards` | Get wards in province | PUBLIC |
| `GET` | `/api/administrative/provinces/{code}/wards/paginated` | Paginated ward list | PUBLIC |
| `GET` | `/api/administrative/provinces/{code}/post-offices` | Get post offices | PUBLIC |

### Route Management APIs

| Method | Path | Intention | Roles |
|--------|------|-----------|-------|
| `GET` | `/api/routes` | Get all transfer routes | SYSTEM_ADMIN, HUB_ADMIN |
| `GET` | `/api/routes/{id}` | Get route details | SYSTEM_ADMIN, HUB_ADMIN |
| `GET` | `/api/routes/{id}/impact` | Preview disable impact | SYSTEM_ADMIN, HUB_ADMIN |
| `POST` | `/api/routes/{id}/disable` | Disable route (disruption) | SYSTEM_ADMIN, HUB_ADMIN |
| `POST` | `/api/routes/{id}/enable` | Re-enable route | SYSTEM_ADMIN, HUB_ADMIN |
| `GET` | `/api/routes/disruptions` | Get active disruptions | SYSTEM_ADMIN, HUB_ADMIN |
| `GET` | `/api/routes/{id}/disruptions/history` | Route disruption history | SYSTEM_ADMIN, HUB_ADMIN |

### Route Disruption Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant R as Route API
    participant B as Batches
    participant O as Orders
    
    A->>R: GET /routes/{id}/impact
    R-->>A: Affected batches, orders count
    
    A->>R: POST /routes/{id}/disable {reason, estimatedDuration}
    R->>B: Find IN_TRANSIT batches on route
    R->>O: Mark affected orders for rerouting
    R-->>A: DisruptionResponse
    
    Note over R: Route marked DISABLED
    Note over B: Batches rerouted via alternate path
    
    A->>R: POST /routes/{id}/enable
    R-->>A: Route restored
```

---

## Endpoint Reference Matrix

### By Controller (67 Total Endpoints)

| Controller | Endpoints | Primary Function |
|------------|-----------|------------------|
| `AuthController` | 2 | Authentication (login/register) |
| `OrderController` | 20 | Order lifecycle management |
| `BatchController` | 16 | Batch consolidation & transit |
| `ProvinceAdminController` | 14 | Province-level employee & office mgmt |
| `WardManagerController` | 6 | Ward-level staff management |
| `ShipperController` | 5 | Shipper CRUD |
| `HubAdminController` | 2 | Hub admin registration, province view |
| `AdministrativeController` | 9 | Geographic data queries |
| `RouteManagementController` | 7 | Transfer route & disruption mgmt |
| `UserController` | 1 | Current user info |
| `UploadController` | 3 | Avatar, evidence, attachments |
| `DashboardController` | 1 | System admin registration |

### Authentication Summary

| Access Level | Description |
|--------------|-------------|
| `PUBLIC` | No authentication required |
| `AUTHENTICATED` | Any logged-in user |
| `CUSTOMER` | Customer role only (self-service) |
| `PO_STAFF` | Post office staff operations |
| `WH_STAFF` | Warehouse staff operations |
| `SHIPPER` | Delivery personnel |
| `*_WARD_MANAGER` | Ward-level management |
| `*_PROVINCE_ADMIN` | Province-level management |
| `HUB_ADMIN` | Regional hub management |
| `SYSTEM_ADMIN` | Full system access |

---

## Quick Reference: Common Workflows

### 1. Create & Ship Order

```
POST /orders/calculate-price → GET price
POST /orders → Create order (CREATED)
POST /batches → Create batch
POST /batches/add-orders → Add to batch (SORTED_AT_ORIGIN)
POST /batches/{id}/seal → Seal batch
POST /batches/{id}/dispatch → Dispatch (IN_TRANSIT_TO_HUB)
```

### 2. Receive & Deliver

```
POST /batches/{id}/arrive → Mark arrived (ARRIVED)
POST /batches/{id}/distribute → Distribute (AT_DESTINATION_OFFICE)
Assign to shipper for delivery (OUT_FOR_DELIVERY)
POST /orders/{id}/deliver → Mark delivered (DELIVERED)
```

### 3. Customer Home Pickup

```
POST /orders/customer/pickup → Request pickup (PENDING_PICKUP)
GET /orders/pending-pickups → Staff views requests
POST /orders/assign-shipper → Assign shipper
GET /orders/shipper/assigned → Shipper views tasks
POST /orders/{id}/pickup → Complete pickup (PICKED_UP)
```

---

> **Document maintained in**: `/postal-management-system-1/API_LOGIC_FLOW.md`
