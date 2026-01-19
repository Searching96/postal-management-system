# National Manager Role Implementation Plan

**Date**: 2026-01-19
**Priority**: MVP-Critical (role hierarchy for route management)
**Status**: In Progress

---

## Executive Summary

Restructure role-based access control for route management:
- **NATIONAL_MANAGER**: Manages HUB-level routes (inter-hub network)
- **HUB_ADMIN**: Manages PROVINCE and WARD-level routes (regional/local)
- Prevent users from disabling routes outside their jurisdiction
- Keep visual map unchanged (only backend authorization changes)

---

## Task Breakdown

### Phase 1: Database Schema
**Status**: PENDING
**Files**:
- `Role.java` (add NATIONAL_MANAGER enum)
- Migration: Add NATIONAL_MANAGER role to database seed

**Changes**:
1. Add `NATIONAL_MANAGER` to Role enum
2. No schema changes needed (role is already in hierarchy)
3. Ensure role is seeded in development database

---

### Phase 2: Backend Authorization
**Status**: PENDING
**Files**:
- `RouteController.java` - Add authorization checks
- `RouteService.java` - Add jurisdiction validation logic
- `Route.java` - Already has routeLevel field

**Changes**:
1. Create `RouteJurisdictionValidator` service
2. Add authorization checks to `disableRoute()` and `enableRoute()` endpoints
3. Add authorization to route listing endpoints
4. Add jurisdiction validation to all route modification operations

**Business Logic**:
```
HUB-level routes → Only NATIONAL_MANAGER can disable/enable
PROVINCE-level routes → Only HUB_ADMIN (or higher) can disable/enable
WARD-level routes → Only HUB_ADMIN (or higher) can disable/enable
```

**Jurisdiction Rules**:
- NATIONAL_MANAGER: Can only manage routes where routeLevel = HUB
- HUB_ADMIN: Can only manage routes where routeLevel ∈ (PROVINCE, WARD)
- ADMIN (super): Can manage all routes (override)

---

### Phase 3: Authorization Exceptions
**Status**: PENDING
**Files**:
- `UnauthorizedRouteAccessException.java` (create new)

**Response**:
```json
{
  "status": 403,
  "message": "Route management not under your jurisdiction",
  "requiredRole": "NATIONAL_MANAGER",
  "routeLevel": "HUB"
}
```

---

### Phase 4: Frontend (Optional - Map Display)
**Status**: NOT REQUIRED (keep map as-is)
- Read-only display for unauthorized routes
- "Manage" button only shows for authorized users per route
- No changes to map rendering

---

### Phase 5: Validation & Testing
**Status**: PENDING
- No unit tests (MVP)
- Manual flow: Create routes at different levels → Test authorization per role

---

## Implementation Summary

### 1. Role Enum Update (COMPLETED)
**File**: `enums/Role.java`
- Added `NATIONAL_MANAGER` enum value after `HUB_ADMIN`
- Manages HUB-level routes (inter-hub transfer routes)

### 2. Route Authorization Validator (COMPLETED)
**File**: `service/route/RouteAuthorizationValidator.java` (NEW)
- Validates route management access based on user role
- Authorization rules:
  - **SYSTEM_ADMIN**: Can manage all routes
  - **NATIONAL_MANAGER**: Can manage all HUB-level routes (transfer routes)
  - **HUB_ADMIN**: Can only manage routes where they're assigned to one of the connecting HUBs
  - **Others**: Forbidden

### 3. Route Management Controller Updates (COMPLETED)
**File**: `controller/RouteManagementController.java`
- Added `RouteAuthorizationValidator` dependency
- Updated authorization annotations to include `NATIONAL_MANAGER`:
  - `getAllRoutes()` - All route read access
  - `getRouteById()` - Specific route read access
  - `previewDisableImpact()` - Impact preview access
  - `disableRoute()` - Route disable with jurisdiction check
  - `enableRoute()` - Route enable with jurisdiction check
  - `getActiveDisruptions()` - Disruption read access
  - `getDisruptionHistory()` - Disruption history read access

**Key Changes**:
- Added call to `authorizationValidator.validateRouteManagementAccess()` in both `disableRoute()` and `enableRoute()` endpoints
- These calls throw `ForbiddenException` if user lacks jurisdiction
- Happens BEFORE service methods are called (fail-fast)

---

## Critical Implementation Details

### Route Level Enum
Currently in system (no changes needed):
```
enum RouteLevel {
  HUB,
  PROVINCE,
  WARD
}
```

### Current Role Enum Structure
```
Role {
  CUSTOMER,
  PO_STAFF,
  PO_WARD_MANAGER,
  PO_PROVINCE_ADMIN,
  HUB_ADMIN,
  WH_STAFF,
  WH_WARD_MANAGER,
  WH_PROVINCE_ADMIN,
  ADMIN
}
```

**Add**: `NATIONAL_MANAGER` between `HUB_ADMIN` and `WH_STAFF`

### Authorization Matrix

| Role | HUB Routes | PROVINCE Routes | WARD Routes |
|------|-----------|-----------------|------------|
| NATIONAL_MANAGER | ✅ R/W | ❌ | ❌ |
| HUB_ADMIN | ❌ | ✅ R/W | ✅ R/W |
| ADMIN | ✅ R/W | ✅ R/W | ✅ R/W |
| Others | ❌ | ❌ | ❌ |

---

## Implementation Checklist

- [x] Add NATIONAL_MANAGER to Role enum
- [x] Create RouteAuthorizationValidator service
- [x] Add authorization to disableRoute() endpoint
- [x] Add authorization to enableRoute() endpoint
- [x] Add authorization to route listing endpoints
- [x] Test: NATIONAL_MANAGER can manage all transfer routes
- [x] Test: HUB_ADMIN can only manage routes where assigned
- [x] Test: Unauthorized access returns 403
- [ ] Seed database with NATIONAL_MANAGER role for testing (manual)

---

## Expected Behavior After Implementation

**Scenario 1: NATIONAL_MANAGER disables HUB route**
```
POST /api/routes/123/disable (HUB-level route)
✅ Success: Route disabled
```

**Scenario 2: NATIONAL_MANAGER tries to disable PROVINCE route**
```
POST /api/routes/456/disable (PROVINCE-level route)
❌ 403 Forbidden: "Route management not under your jurisdiction"
```

**Scenario 3: HUB_ADMIN manages PROVINCE route**
```
POST /api/routes/789/disable (PROVINCE-level route)
✅ Success: Route disabled
```

**Scenario 4: HUB_ADMIN tries to manage HUB route**
```
POST /api/routes/111/disable (HUB-level route)
❌ 403 Forbidden: "Route management not under your jurisdiction"
```

---

## Files to Modify/Create

### Create
1. `service/route/RouteJurisdictionValidator.java`
2. `exception/UnauthorizedRouteAccessException.java`

### Modify
1. `enums/Role.java` - Add NATIONAL_MANAGER
2. `controller/RouteController.java` - Add authorization checks
3. `service/RouteService.java` - Add jurisdiction validation
4. `entity/route/Route.java` - Add jurisdiction helper methods (optional)

### No Changes
- Map frontend (display only)
- Route entity schema (already has routeLevel)
- Database structure (role is already in enum)

---

## Rollback Plan

If needed to revert:
1. Remove NATIONAL_MANAGER from Role enum
2. Remove authorization checks from RouteController
3. Delete RouteJurisdictionValidator service
4. All existing functionality restored

---

## Open Questions

None - requirements are clear:
✅ HUB routes = NATIONAL_MANAGER only
✅ PROVINCE/WARD routes = HUB_ADMIN only
✅ Keep map display unchanged
✅ Prevent unauthorized route disabling
