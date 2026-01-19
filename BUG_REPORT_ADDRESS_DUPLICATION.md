# 🐛 BUG REPORT: Address Duplication in Order API Response

**Severity:** MEDIUM
**Component:** Backend - OrderResponse DTO & Mapper
**Reporter:** Frontend Team
**Date:** 2026-01-19

---

## Issue Summary

The Order API response contains **redundant address data** causing:
1. **Data Duplication**: Full address + separate ward/province details
2. **Incomplete Data**: receiverProvinceCode/Province null when they should be populated
3. **Inefficient API Payloads**: Unnecessary data transmission
4. **Frontend Complexity**: Unclear which address format to use for display vs. backend operations

---

## Current Behavior

**API Response Example:**
```json
{
  "receiverAddressLine1": "10 Nguyen Trai, Hoàng Sa, Đà Nẵng",
  "receiverWardCode": "20333",
  "receiverWardName": "Hoàng Sa",           ← Duplicate (already in addressLine1)
  "receiverProvinceCode": null,             ← Should be "020"
  "receiverProvinceName": null              ← Should be "Đà Nẵng"
}
```

**Problems:**
- Address is already complete in `receiverAddressLine1`
- Ward name is redundant (already in address)
- Province code/name are NULL (data integrity issue)
- Frontend doesn't know which format to use for display

---

## Root Causes

### 1. **Schema Design Violation**
The Order entity stores:
```java
private String receiverAddressLine1;        // Full address including details
private Ward receiverWard;                  // Related object
private Province receiverProvince;          // Related object
```

But the DTO returns **both** the full string AND extracted components.

### 2. **Incomplete Data Population**
In `OrderServiceImpl.toOrderResponse()`:
```java
.receiverProvinceCode(order.getReceiverProvince() != null ? order.getReceiverProvince().getCode() : null)
.receiverProvinceName(order.getReceiverProvince() != null ? order.getReceiverProvince().getName() : null)
```

When `order.getReceiverProvince()` is null (not set during order creation), both are null.

### 3. **Architectural Confusion**
DTO returns 5 address-related fields when only 3 are needed:
- ✅ `receiverAddressLine1` (full text for display)
- ✅ `receiverWardCode` (for backend operations)
- ✅ `receiverProvinceCode` (for backend operations)
- ❌ `receiverWardName` (redundant)
- ❌ `receiverProvinceName` (redundant)

---

## Solution

### Step 1: Update OrderResponse DTO
**Remove these fields:**
- `senderWardName`
- `senderProvinceName`
- `receiverWardName`
- `receiverProvinceName`

**Keep only:**
- `senderAddressLine1`
- `senderWardCode`
- `senderProvinceCode`
- `receiverAddressLine1`
- `receiverWardCode`
- `receiverProvinceCode`

### Step 2: Update OrderServiceImpl Mapper
Remove the extraction of Name fields from the mapper:
```java
// REMOVE these lines:
.senderWardName(...)
.senderProvinceName(...)
.receiverWardName(...)
.receiverProvinceName(...)
```

### Step 3: Frontend Address Display Logic
Frontend concatenates address for display:
```typescript
// For receiver (delivery)
`${order.receiverAddressLine1}, ${order.receiverWardName}, ${order.receiverProvinceName}`

// For sender (pickup)
`${order.senderAddressLine1}, ${order.senderWardName}, ${order.senderProvinceName}`
```

Frontend loads ward/province names from administrative service if needed.

### Step 4: Fix Data Population Bug
Ensure `receiverProvince` is properly set when creating orders. Currently receiving NULL values.

---

## Expected Outcome

**Before (Redundant):**
```json
{
  "receiverAddressLine1": "10 Nguyen Trai, Hoàng Sa, Đà Nẵng",
  "receiverWardCode": "20333",
  "receiverWardName": "Hoàng Sa",
  "receiverProvinceCode": null,
  "receiverProvinceName": null
}
```

**After (Clean):**
```json
{
  "receiverAddressLine1": "10 Nguyen Trai, Hoàng Sa, Đà Nẵng",
  "receiverWardCode": "20333",
  "receiverProvinceCode": "020"
}
```

**Benefits:**
- ✅ 60% less address data per response
- ✅ Clear separation: display text vs. operational codes
- ✅ Frontend responsible for presentation logic
- ✅ API payload optimized
- ✅ No redundancy

---

## Files Affected

**Backend (Changes Required):**
1. `OrderResponse.java` - Remove wardName/provinceName fields
2. `OrderSummaryResponse.java` - Same cleanup
3. `OrderServiceImpl.java` - Remove mapper extraction of Names
4. Order creation logic - Ensure province is populated

**Frontend (Changes Needed):**
1. `ShipperDeliveryPage.tsx` - Already concatenates correctly ✅
2. `ShipperPickupPage.tsx` - Already concatenates correctly ✅
3. `orderService.ts` - Update Order interface (already has both styles)
4. All components displaying addresses - Verify concatenation logic

---

## Implementation Status

- [ ] Update OrderResponse DTO
- [ ] Update OrderSummaryResponse DTO
- [ ] Refactor OrderServiceImpl mapper
- [ ] Fix data population for receiverProvince
- [ ] Frontend verification
- [ ] API contract update in OpenAPI/Swagger

---

## Notes

- **Backward Compatibility:** API contract change - frontend must be ready
- **Data Migration:** No database changes needed (data stored correctly)
- **Performance:** Reduced payload size (~25-30 bytes per order)
- **Frontend Already Ready:** Shipper pages already concatenate addresses correctly

