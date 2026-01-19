# Hierarchical Routing System Implementation Plan

**Date**: 2026-01-19
**Status**: PLANNING
**Scope**: Complete multi-level route hierarchy (MVP)

---

## Vision

Implement a **3-tier routing hierarchy** for complete order consolidation flow:

```
WARD LEVEL
┌─────────────────────────────────────────────────────────┐
│ Order at WARD POST OFFICE                               │
│ ↓                                                        │
│ ConsolidationRoute: WARD1 → WARD2 → ... → PROVINCE WH   │
│ (Multiple consolidation routes per province possible)   │
└─────────────────────────────────────────────────────────┘
                           ↓
PROVINCE LEVEL
┌─────────────────────────────────────────────────────────┐
│ Order at PROVINCE WAREHOUSE                             │
│ ↓                                                        │
│ TransferRoute: PROVINCE WH → HUB                        │
│ (Province warehouse has assigned hub)                   │
└─────────────────────────────────────────────────────────┘
                           ↓
HUB LEVEL
┌─────────────────────────────────────────────────────────┐
│ Order at HUB                                            │
│ ↓                                                        │
│ InterHubRoute: HUB1 → HUB2 → ... → DESTINATION HUB     │
│ (Already implemented - keep as-is)                      │
└─────────────────────────────────────────────────────────┘
                           ↓
                  DELIVERED TO CUSTOMER
```

---

## Phase 1: Database Schema Design

### 1.1 ConsolidationRoute Entity (NEW)
**Purpose**: Routes orders from multiple ward offices up to province warehouse

```sql
CREATE TABLE consolidation_routes (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,           -- "Route 1 - Province X"
  province_code VARCHAR(5) NOT NULL,    -- FK to province
  destination_warehouse_id UUID NOT NULL, -- FK to PROVINCE_WAREHOUSE office

  -- Route stops (ordered list of wards/ward offices)
  route_sequence JSON,                   -- [{wardCode, wardOfficeName, order: 1}, ...]

  -- Capacity
  max_weight_kg DECIMAL(10,2),
  max_volume_cm3 DECIMAL(15,2),
  max_orders INT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

**Key Fields**:
- `province_code`: Routes are organized by province
- `route_sequence`: JSON array of stop order (first ward → intermediate wards → final province warehouse)
- Multiple routes per province possible (divide workload)

### 1.2 TransferRoute Enhancements (MODIFY)
**Current**: HUB → HUB only
**New**: PROVINCE WAREHOUSE → HUB

```sql
-- Add new column to existing transfer_routes
ALTER TABLE transfer_routes ADD COLUMN route_type ENUM('PROVINCE_TO_HUB', 'HUB_TO_HUB') DEFAULT 'HUB_TO_HUB';
ALTER TABLE transfer_routes ADD COLUMN province_warehouse_id UUID; -- FK for PROVINCE_TO_HUB routes
```

**Business Logic**:
- `PROVINCE_TO_HUB`: from_hub_id = PROVINCE_WAREHOUSE, to_hub_id = HUB
- `HUB_TO_HUB`: traditional hub-to-hub (keep existing)

### 1.3 Order Route Assignment (MODIFY)
**Current**: Orders only routed at HUB level
**New**: Orders routed at each consolidation level

```sql
-- Add to orders table
ALTER TABLE orders ADD COLUMN assigned_consolidation_route_id UUID; -- FK to consolidation route
ALTER TABLE orders ADD COLUMN consolidated_at TIMESTAMP;           -- When consolidated to province
ALTER TABLE orders ADD COLUMN transferred_to_hub_at TIMESTAMP;     -- When transferred to hub
```

---

## Phase 2: Entity Models

### 2.1 ConsolidationRoute Entity (NEW)

```java
@Entity
@Table(name = "consolidation_routes")
public class ConsolidationRoute extends BaseEntity {

    @Column(name = "name")
    private String name;  // e.g., "Route 1 - Province X"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_code")
    private Province province;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_warehouse_id", nullable = false)
    private Office destinationWarehouse;  // PROVINCE_WAREHOUSE type

    @Column(name = "route_sequence", columnDefinition = "JSON")
    private String routeSequence;  // JSON: [{wardCode, order, wardOfficeName}, ...]

    @Column(name = "max_weight_kg", precision = 10, scale = 2)
    private BigDecimal maxWeightKg;

    @Column(name = "max_volume_cm3", precision = 15, scale = 2)
    private BigDecimal maxVolumeCm3;

    @Column(name = "max_orders")
    private Integer maxOrders;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Helper methods
    public List<ConsolidationStop> getStops() {
        // Parse routeSequence JSON
    }

    public ConsolidationStop getNextStop(String currentWardCode) {
        // Get next ward in sequence after current
    }
}

@Data
public class ConsolidationStop {
    private String wardCode;
    private String wardOfficeName;
    private int order;
    private Integer distanceKm;
}
```

### 2.2 TransferRoute Enhancement (MODIFY)

```java
@Entity
@Table(name = "transfer_routes")
public class TransferRoute extends BaseEntity {

    // ... existing fields ...

    @Enumerated(EnumType.STRING)
    @Column(name = "route_type")
    private RouteType routeType;  // PROVINCE_TO_HUB or HUB_TO_HUB

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_warehouse_id")
    private Office provinceWarehouse;  // For PROVINCE_TO_HUB routes

    // Methods
    public boolean isProvinceToHubRoute() {
        return routeType == RouteType.PROVINCE_TO_HUB;
    }

    public boolean isHubToHubRoute() {
        return routeType == RouteType.HUB_TO_HUB;
    }
}

public enum RouteType {
    PROVINCE_TO_HUB,  // From province warehouse to hub
    HUB_TO_HUB        // Between hubs
}
```

### 2.3 Order Enhancement (MODIFY)

```java
@Entity
@Table(name = "orders")
public class Order extends BaseEntity {

    // ... existing fields ...

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_consolidation_route_id")
    private ConsolidationRoute assignedConsolidationRoute;

    @Column(name = "consolidated_at")
    private LocalDateTime consolidatedAt;

    @Column(name = "transferred_to_hub_at")
    private LocalDateTime transferredToHubAt;
}
```

---

## Phase 3: Services & Business Logic

### 3.1 ConsolidationRouteService (NEW)

**Responsibilities**:
- Assign orders to consolidation routes
- Track consolidation progress
- Move consolidated orders to province warehouse

```java
public interface IConsolidationRouteService {

    // Route Management
    ConsolidationRouteResponse createConsolidationRoute(
        CreateConsolidationRouteRequest request, Account currentAccount);

    List<ConsolidationRouteResponse> getRoutesByProvince(
        String provinceCode, Account currentAccount);

    // Order Assignment
    void assignOrderToRoute(UUID orderId, UUID routeId);

    List<Order> getUnassignedOrdersForWard(String wardCode);

    // Consolidation Operations
    void consolidateOrdersAtWard(String wardCode, UUID routeId);

    void moveConsolidatedOrdersToProvince(UUID routeId);

    // Tracking
    ConsolidationStatusResponse getRouteStatus(UUID routeId);
}
```

### 3.2 TransferRouteService Enhancement (MODIFY)

Add support for PROVINCE_TO_HUB routes:

```java
public interface ITransferRouteService {

    // Existing hub-to-hub methods
    List<TransferRouteResponse> getHubToHubRoutes();

    // New province-to-hub methods
    List<TransferRouteResponse> getProvinceToHubRoutes(String provinceCode);

    TransferRouteResponse createProvinceToHubRoute(
        UUID provinceWarehouseId, UUID hubId, CreateTransferRouteRequest request);

    void transferOrdersFromProvinceToHub(UUID provinceWarehouseId, UUID hubId);
}
```

### 3.3 Order Route Assignment Service (NEW)

**Orchestrates** order flow through the 3-tier system:

```java
public interface IOrderRouteAssignmentService {

    /**
     * Complete flow:
     * 1. Assign to consolidation route (WARD level)
     * 2. Consolidate to province (PROVINCE level)
     * 3. Transfer to hub (HUB level)
     * 4. Route between hubs (INTER-HUB level)
     */
    void routeOrder(UUID orderId);

    /**
     * Automatic hourly job
     */
    void processConsolidationRoutes();
    void processTransferRoutes();
    void processInterHubRoutes();
}
```

---

## Phase 4: API Controllers

### 4.1 ConsolidationRouteController (NEW)

```
GET    /api/consolidation-routes                    - List routes
POST   /api/consolidation-routes                    - Create route
GET    /api/consolidation-routes/{routeId}          - Get route
PUT    /api/consolidation-routes/{routeId}          - Update route
DELETE /api/consolidation-routes/{routeId}          - Delete route

GET    /api/consolidation-routes/{routeId}/status   - Get route status
POST   /api/consolidation-routes/{routeId}/consolidate - Consolidate orders at ward
POST   /api/consolidation-routes/{routeId}/transfer    - Transfer to province
```

### 4.2 TransferRouteController Enhancement

```
GET    /api/transfer-routes?type=HUB_TO_HUB         - Filter by type
POST   /api/transfer-routes                         - Create (auto-detect type)
POST   /api/transfer-routes/{routeId}/transfer      - Transfer to next level
```

---

## Phase 5: Order Flow Changes

### Current Flow (SIMPLE):
```
Order Created (WARD POST) → HUB → InterHubRoute → DELIVERED
```

### New Flow (HIERARCHICAL):
```
Order Created (WARD POST)
    ↓
[WARD CONSOLIDATION]
    ↓
Assigned to ConsolidationRoute
    ↓
Wait for consolidation trigger
    ↓
[PROVINCE CONSOLIDATION]
    ↓
Moved to Province Warehouse (batch)
    ↓
Assigned to TransferRoute (PROVINCE → HUB)
    ↓
Wait for transfer trigger
    ↓
[HUB ROUTING]
    ↓
At HUB → InterHubRoute → Other HUB → DELIVERED
```

### Order Status Updates:
```
CREATED
    ↓
AT_ORIGIN_OFFICE (ward post office)
    ↓
SORTED_AT_ORIGIN (consolidated at ward)
    ↓
AT_DESTINATION_OFFICE (province warehouse - intermediate)
    ↓
SORTED_AT_ORIGIN (consolidated at province)
    ↓
IN_TRANSIT_TO_HUB (transferred via TransferRoute)
    ↓
AT_HUB
    ↓
IN_TRANSIT_TO_HUB (via InterHubRoute if needed)
    ↓
AT_DESTINATION_OFFICE
    ↓
OUT_FOR_DELIVERY
    ↓
DELIVERED
```

---

## Phase 6: Batch System Integration

**Current Batch System**: Simple consolidation at origin → destination

**New Integration**:
1. **Ward-Level Batching**: ConsolidationRoute acts like a "batch" for ward consolidation
2. **Province-Level Batching**: TransferRoute batching (existing concept, reused)
3. **Hub-Level Batching**: Existing batch system (unchanged)

**Changes**:
- Orders no longer go directly to hub batches
- Must first flow through consolidation → transfer → then hub batches
- Batch system becomes 3-tier (ward, province, hub)

---

## Phase 7: Scheduler Jobs (NEW)

```java
@Service
public class RouteConsolidationScheduler {

    @Scheduled(fixedDelay = 600000)  // 10 minutes
    public void consolidateAtWardLevel() {
        // 1. Find all consolidation routes with ready orders
        // 2. Trigger consolidation
        // 3. Move orders to province warehouse
    }

    @Scheduled(fixedDelay = 600000)  // 10 minutes
    public void consolidateAtProvinceLevel() {
        // 1. Find all transfer routes with ready orders
        // 2. Trigger transfer
        // 3. Move orders to hub
    }
}
```

---

## Phase 8: Authorization (EXISTING - REUSE)

The NATIONAL_MANAGER role (just implemented) already supports this:
- **NATIONAL_MANAGER**: Manages inter-hub routes
- **HUB_ADMIN**: Manages hub-level operations
- New roles needed for province/ward managers (future enhancement)

---

## Data Model Diagram

```
┌─────────────────────────────────────┐
│ Province                            │
│ - code                              │
│ - name                              │
└─────────────────────────────────────┘
         │
         ├─► ConsolidationRoutes (1 to many)
         │   - name
         │   - route_sequence (JSON)
         │   - destination_warehouse
         │   - is_active
         │
         └─► TransferRoutes (PROVINCE_TO_HUB)
             - province_warehouse_id
             - hub_id (to_hub)
             - route_type = PROVINCE_TO_HUB

Orders Flow:
  Order
  ├─ assigned_consolidation_route_id
  ├─ consolidated_at
  └─ transferred_to_hub_at
```

---

## MVP Scope (Phase 1-4 Only)

**MUST HAVE**:
- [x] ConsolidationRoute entity & repository
- [x] ConsolidationRouteService
- [x] ConsolidationRouteController (REST API)
- [x] TransferRoute enhancement (route_type field)
- [x] Order assignment to consolidation routes
- [x] Consolidation trigger & order movement

**NICE TO HAVE** (Phase 5+):
- Automatic scheduler jobs
- Complete order status flow redesign
- Advanced analytics per route
- Performance optimization

**OUT OF SCOPE** (Future):
- Real-time tracking UI
- Mobile app integration
- Province/Ward manager roles
- Advanced rerouting logic

---

## Success Criteria

1. Can create consolidation routes (1+ per province)
2. Can assign orders to consolidation routes
3. Can trigger consolidation (move to province)
4. Can transfer from province to hub
5. Orders flow through all 3 levels correctly
6. Batch system still works with new hierarchy

---

## File Structure

```
backend/src/main/java/org/f3/postalmanagement/

entity/unit/
  ├─ ConsolidationRoute.java (NEW)
  └─ TransferRoute.java (MODIFY)

entity/order/
  └─ Order.java (MODIFY - add route fields)

service/
  ├─ IConsolidationRouteService.java (NEW)
  ├─ impl/ConsolidationRouteServiceImpl.java (NEW)
  ├─ ITransferRouteService.java (MODIFY)
  ├─ impl/TransferRouteServiceImpl.java (MODIFY)
  └─ IOrderRouteAssignmentService.java (NEW)

controller/
  ├─ ConsolidationRouteController.java (NEW)
  └─ TransferRouteController.java (MODIFY)

repository/
  ├─ ConsolidationRouteRepository.java (NEW)
  └─ TransferRouteRepository.java (MODIFY)

dto/request/
  └─ consolidation/CreateConsolidationRouteRequest.java (NEW)

dto/response/
  ├─ consolidation/ConsolidationRouteResponse.java (NEW)
  └─ consolidation/ConsolidationStatusResponse.java (NEW)
```

---

## Design Decisions (USER CONFIRMED)

✅ **Fixed Sequence**: Each ward is permanently assigned to one consolidation route per province
   - Ward A → Consolidation Route 1 (always)
   - Ward B → Consolidation Route 1 (always)
   - Ward C → Consolidation Route 2 (always)

✅ **Multiple Routes per Province**: Support 2-5 routes per province
   - Example: Province X has 20 wards → split into 2-3 routes
   - Load balancing and parallel consolidation

✅ **Replace Batch System**: Consolidation Routes become primary grouping
   - Old `batch_packages` system deprecated
   - New order flow: Consolidation → Transfer → Inter-Hub
   - Massive simplification: 1 grouping mechanism instead of 2 (batches + routes)

---

## Architecture Impact: OLD vs NEW

### OLD ARCHITECTURE
```
Order (WARD POST)
  ↓
Manual batch creation at origin office
  ↓
Batch status: OPEN → PROCESSING → SEALED → IN_TRANSIT → ARRIVED → DISTRIBUTED
  ↓
Individual order delivery
```

### NEW ARCHITECTURE (SIMPLER)
```
Order (WARD POST)
  ↓
Pre-assigned to ConsolidationRoute (fixed, at province setup time)
  ↓
Automatic consolidation flow:
  OPEN (waiting) → CONSOLIDATED (at province) → TRANSFERRED (at hub) → ROUTED → DELIVERED
```

---

## Implementation Impact

### Phase 1: Create Consolidation Route Entities
- ConsolidationRoute (replace batches for WARD→PROVINCE)
- TransferRoute enhancement (PROVINCE→HUB)
- InterHubRoute (already exists, unchanged)

### Phase 2: Remove/Deprecate Batch System
- Disable batch creation APIs
- Keep batch read-only for historical data
- Migrate active batches to consolidation routes

### Phase 3: Update Order Flow
- Remove: `AT_ORIGIN_OFFICE` (orders auto-assigned)
- Add: `CONSOLIDATION_PENDING`, `CONSOLIDATED`, `TRANSFER_PENDING`, `TRANSFERRED`
- Simplify: 4 states instead of 10+

### Phase 4: Scheduler Jobs (Automate Everything)
- Ward-level consolidation (hourly)
- Province-level transfer (hourly)
- Hub-level routing (existing)

---

## Configuration: Province Setup

**Setup Example: Province X with 20 wards**

```
Province: DA NANG

ConsolidationRoute 1:
  - Name: "Tuyến tập kết 1 - Đà Nẵng"
  - Stops: [Hòa Vang, Ngũ Hành Sơn, Liên Chiểu]
  - Max: 100 orders, 500 kg
  - Destination: DA NANG Province Warehouse

ConsolidationRoute 2:
  - Name: "Tuyến tập kết 2 - Đà Nẵng"
  - Stops: [Thanh Khê, Hải Châu, Sơn Trà]
  - Max: 100 orders, 500 kg
  - Destination: DA NANG Province Warehouse

TransferRoute:
  - From: DA NANG Province Warehouse
  - To: HUB Region 1
  - Type: PROVINCE_TO_HUB
  - Max: 500 orders, 2000 kg
```

When order is created at "Hòa Vang" ward:
- ✅ Auto-assigned to ConsolidationRoute 1
- ✅ No manual batching needed
- ✅ Flows automatically: Consolidation → Transfer → Hub → Delivery


---

# IMPLEMENTATION STATUS: PHASE 1-3 COMPLETE ✅

## What Was Implemented

### Phase 1: Database & Entities ✅
- **ConsolidationRoute Entity** (NEW)
  - Represents WARD → PROVINCE consolidation routes
  - JSON route sequence for ward stops
  - Capacity tracking (weight, volume, orders)
  - Metrics (consolidation count, last consolidation time)

- **TransferRoute Enhancement** (MODIFIED)
  - Added `routeType` field: PROVINCE_TO_HUB | HUB_TO_HUB
  - Added `provinceWarehouse` FK for province-to-hub routes
  - Backward compatible (defaults to HUB_TO_HUB)

- **Order Enhancement** (MODIFIED)
  - Added `assignedConsolidationRoute` FK
  - Added `consolidatedAt` timestamp
  - Added `transferredToHubAt` timestamp
  - Maintains backward compatibility with batch system

### Phase 2: Service Layer ✅
**IConsolidationRouteService** - Complete implementation:
- Route CRUD operations
- Order assignment (auto-assign on order creation)
- Consolidation readiness checking (threshold-based)
- Consolidation trigger (move orders to province warehouse)
- Status monitoring and analytics
- Scheduled consolidation support

**Business Logic**:
- Orders fixed to consolidation route at creation
- Consolidation triggered when:
  - 50% order count threshold reached, OR
  - 50% weight capacity reached, OR
  - 1-2 hours elapsed since first order
- Automatic order status updates during consolidation

### Phase 3: API Layer ✅
**ConsolidationRouteController** - 13 endpoints:

**Route Management**:
```
POST   /api/consolidation-routes                  Create route
GET    /api/consolidation-routes/province/{code}  List routes by province
GET    /api/consolidation-routes/{id}             Get route details
PUT    /api/consolidation-routes/{id}             Update route
POST   /api/consolidation-routes/{id}/activate    Activate route
POST   /api/consolidation-routes/{id}/deactivate  Deactivate route
DELETE /api/consolidation-routes/{id}             Delete route
```

**Status & Monitoring**:
```
GET    /api/consolidation-routes/{id}/status               Get route status
GET    /api/consolidation-routes/province/{code}/status    Get province status
```

**Consolidation Operations**:
```
POST   /api/consolidation-routes/{id}/consolidate         Trigger consolidation
POST   /api/consolidation-routes/province/{code}/consolidate-ready   Consolidate ready routes
POST   /api/consolidation-routes/consolidate-all-ready    Admin: consolidate all
```

**Authorization**:
- Create/Update: SYSTEM_ADMIN, PO_PROVINCE_ADMIN, WH_PROVINCE_ADMIN
- Read: All warehouse staff and managers
- Consolidate: Province/Hub managers

---

## Architecture: Before & After

### BEFORE (Manual Batch System)
```
Order Created
  ↓
Manual batch creation (OPEN status)
  ↓
Staff manually triggers batching
  ↓
Batch consolidation (SEALED, IN_TRANSIT, etc.)
  ↓
Delivery
```

### AFTER (Automatic Consolidation Hierarchy)
```
Order Created
  ↓
Auto-assigned to ConsolidationRoute (based on origin ward)
  ↓
Scheduled job checks consolidation readiness
  ↓
Automatic consolidation (move to province warehouse)
  ↓
Automatic transfer (move to hub)
  ↓
Automatic inter-hub routing (existing system)
  ↓
Delivery
```

**Key Improvement**: No manual batching needed. Orders flow automatically through the hierarchy.

---

## Data Model

### Consolidation Routes (NEW)
```
ConsolidationRoute
├─ name: "Tuyến tập kết 1 - Hà Nội"
├─ province: Province (FK)
├─ destinationWarehouse: Office (FK)
├─ routeSequence: JSON  [{wardCode, wardOfficeName, order}, ...]
├─ maxWeightKg: 500
├─ maxOrders: 100
├─ isActive: true
├─ totalConsolidatedOrders: 1234
└─ lastConsolidationAt: 2026-01-19T14:30:00

Orders in route:
├─ assignedConsolidationRoute: ConsolidationRoute (FK)
├─ consolidatedAt: 2026-01-19T14:35:00
└─ transferredToHubAt: 2026-01-19T15:00:00
```

### Transfer Routes (ENHANCED)
```
TransferRoute
├─ routeType: PROVINCE_TO_HUB | HUB_TO_HUB
├─ fromHub: Office (Province warehouse OR Hub)
├─ toHub: Office (always Hub)
├─ provinceWarehouse: Office (FK, nullable)
└─ ... (existing fields unchanged)
```

---

## Consolidation Readiness Thresholds

A consolidation route is ready when ANY of these conditions met:

1. **Order Count**: ≥ 50% of maxOrders
2. **Weight**: ≥ 50% of maxWeightKg
3. **Time**: 1+ hour since first order (or 2+ hours since last consolidation)

Example (Route with maxOrders=100, maxWeightKg=500kg):
- Ready when: 50+ orders, OR 250+ kg, OR 1+ hour old

---

## Files Structure

```
backend/src/main/java/org/f3/postalmanagement/

entity/unit/
  ├─ ConsolidationRoute.java (NEW)
  └─ TransferRoute.java (MODIFIED)

entity/order/
  └─ Order.java (MODIFIED)

service/
  ├─ IConsolidationRouteService.java (NEW)
  └─ impl/ConsolidationRouteServiceImpl.java (NEW)

controller/
  └─ ConsolidationRouteController.java (NEW)

repository/
  ├─ ConsolidationRouteRepository.java (NEW)
  └─ OrderRepository.java (MODIFIED)

dto/request/consolidation/
  └─ CreateConsolidationRouteRequest.java (NEW)

dto/response/consolidation/
  ├─ ConsolidationRouteResponse.java (NEW)
  └─ ConsolidationStatusResponse.java (NEW)

enums/
  └─ RouteType.java (NEW)

db/migration/
  └─ V1_5__add_consolidation_routes.sql (NEW)
```

**Total**: 12 new files, 3 modified files, ~1,500+ lines of code

---

## Next Steps: Phase 4-5

### Phase 4: Scheduler Jobs
- ConsolidationScheduler for automatic consolidation
- Time-based triggers (hourly)
- Error handling and retry logic

### Phase 5: Advanced Features
- Transfer route integration (PROVINCE → HUB)
- Inter-hub routing integration
- Analytics and reporting
- Performance optimization

### Already Functional:
- ✅ Batch system (backward compatible)
- ✅ Manual order entry
- ✅ Hub-to-hub routing
- ✅ Delivery tracking

---

## Testing Scenarios

### MVP Flow Test
1. Create consolidation route for province (2-3 stops)
2. Create order at first stop ward
3. Check order is auto-assigned to route
4. Wait or trigger consolidation
5. Verify order moved to province warehouse
6. Check order status updated correctly

### Province Setup Test
1. Create Province X with 3 ward offices
2. Create 2 consolidation routes (divide wards)
3. Create 30 orders across wards
4. Verify auto-assignment distribution
5. Trigger consolidation on each route
6. Verify all orders moved to warehouse

---

## Production Readiness Checklist

- [x] Database schema defined
- [x] Entity models created
- [x] Repository queries implemented
- [x] Service business logic complete
- [x] REST API endpoints created
- [x] Authorization/access control added
- [ ] Scheduler jobs implemented (Phase 4)
- [ ] Database migration tested
- [ ] Error handling comprehensive
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] Integration tests written

---

## Deployment Notes

1. **No Breaking Changes**: Batch system remains functional
2. **Gradual Migration**: Can run both systems in parallel
3. **Data Migration**: Existing batches not affected
4. **Database**: Run migration V1_5 before deployment
5. **Services**: New ConsolidationRouteService enabled via Spring
6. **APIs**: New endpoints available immediately after deployment

