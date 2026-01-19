# 🔧 BACKEND CONTEXT GUIDELINES - Postal Management System

**Version**: 1.0 | **Last Updated**: 2026-01-19 | **Authority**: Backend Specification

---

## 📋 MASTER DATA STRUCTURE (Token Object Oriented Notation)

### ⚙️ UNIVERSAL PATTERNS

```
base_entity{inherited by all models}:
  id: UUID (auto-generated, strategy=GenerationType.UUID)
  created_at: LocalDateTime (auto on @PrePersist)
  updated_at: LocalDateTime (auto on @PostUpdate)
  deleted_at: LocalDateTime (soft delete, SQLDelete/SQLRestriction)

soft_delete_rule: ALL entities use @SQLDelete + @SQLRestriction
                  WHERE deleted_at IS NULL
naming_convention:
  database_columns: snake_case (created_at, office_phone_number)
  java_fields: camelCase (createdAt, officePhoneNumber)
```

---

## 🏛️ ADMINISTRATIVE ENTITIES

```
context:
  domain: Geographic hierarchy for routing
  scope: Vietnam regions, provinces, wards, units

AdministrativeRegion{id:UUID, created_at, updated_at, deleted_at}:
  id: UUID (PK)
  name: String (non-null) - e.g., "Đông Bắc Bộ"
  code: String (unique, non-null)
  relationships:
    ↔ provinces: 1-to-many
    ↔ admin_units: 1-to-many

Province{code:String, created_at, updated_at, deleted_at}:
  code: String (PK, e.g., "050" for Thanh Hóa) - NOT numeric id
  name: String (non-null) - e.g., "Thanh Hóa"
  administrative_region_id: UUID (FK, non-null)
  administrative_unit_id: UUID (FK, optional)
  relationships:
    → region: ManyToOne(FetchType.LAZY)
    ↔ wards: 1-to-many

Ward{id:UUID, created_at, updated_at, deleted_at}:
  id: UUID (PK)
  code: String (unique) - e.g., "05000001"
  name: String (non-null) - e.g., "Phường 1"
  province_code: String (FK to Province.code)
  administrative_unit_id: UUID (FK, optional)
  relationships:
    → province: ManyToOne(FetchType.LAZY)

AdministrativeUnit{id:UUID, created_at, updated_at, deleted_at}:
  id: UUID (PK)
  name: String (non-null)
  relationships:
    ↔ provinces: 1-to-many
    ↔ wards: 1-to-many
```

---

## 👥 ACTOR ENTITIES

```
context:
  domain: User identity, roles, and contacts
  scope: Employees, Customers, Accounts

Account{id:UUID, created_at, updated_at, deleted_at}:
  id: UUID (PK)
  username: String (unique, non-null) - for employees: number; for customers: phone
  password: String (non-null, bcrypt encoded)
  email: String (unique, non-null)
  role_name: Enum(SYSTEM_ADMIN, HUB_ADMIN, WH_PROVINCE_ADMIN, PO_PROVINCE_ADMIN,
                   WH_WARD_MANAGER, PO_WARD_MANAGER, SHIPPER, CUSTOMER)
  is_active: Boolean (non-null, default=true)
  soft_delete: deleted_at

Employee{id:UUID (PK=Account.id MapsId), created_at, updated_at, deleted_at}:
  id: UUID (PK, @MapsId, OneToOne to Account)
  account_id: UUID (FK, unique)
  full_name: String (non-null)
  phone_number: String (unique, non-null) - 10 digits (09XXXXXXX)
  office_id: UUID (FK, non-null)
  soft_delete: deleted_at
  relationships:
    → account: OneToOne(@MapsId)
    → office: ManyToOne(FetchType.LAZY)
  validation:
    phone_number must be 10 digits starting with 09

Customer{id:UUID, created_at, updated_at, deleted_at}:
  id: UUID (PK)
  account_id: UUID (FK, unique, optional)
  full_name: String (non-null)
  phone_number: String (non-null, 10 digits)
  address: String (non-null)
  subscription_plan: Enum(BASIC, STANDARD, PREMIUM)
  soft_delete: deleted_at
  relationships:
    → account: OneToOne(optional)
```

---

## 🏢 UNIT & OFFICE ENTITIES

```
context:
  domain: Physical locations for operations
  hierarchy: HUB → PROVINCE_WAREHOUSE/PROVINCE_POST → WARD_WAREHOUSE/WARD_POST

Office{id:UUID, created_at, updated_at, deleted_at}:
  id: UUID (PK)
  office_name: String (non-null)
  office_email: String (unique, non-null)
  office_phone_number: String (non-null) - 10 digits (09XXXXXXX)
  office_address: String (non-null)
  region_id: UUID (FK, non-null)
  parent_id: UUID (FK, optional) - for hierarchy
  province_code: String (FK to Province.code, optional)
  office_type: Enum(HUB, PROVINCE_WAREHOUSE, PROVINCE_POST,
                    WARD_WAREHOUSE, WARD_POST, DISTRIBUTION_CENTER)
  capacity: Integer (kg capacity)
  is_accepting_orders: Boolean (default=true)
  working_hours: String (default="07:00-17:00")
  soft_delete: deleted_at
  relationships:
    → region: ManyToOne(FetchType.LAZY, non-null)
    → parent: ManyToOne(FetchType.LAZY) - self-referential hierarchy
    → province: ManyToOne(FetchType.LAZY)

TransferRoute{id:UUID, created_at, updated_at, deleted_at}:
  id: UUID (PK)
  from_hub_id: UUID (FK, non-null)
  to_hub_id: UUID (FK, non-null)
  distance_km: Integer (non-null)
  transit_hours: Integer (non-null)
  priority: Integer (1=primary, 2=secondary)
  is_active: Boolean (default=true)
  soft_delete: deleted_at
  relationships:
    → from_hub: ManyToOne(Office)
    → to_hub: ManyToOne(Office)
  constraints:
    unique(from_hub_id, to_hub_id)

OfficePair{id:UUID, created_at, updated_at, deleted_at}:
  id: UUID (PK)
  wh_office_id: UUID (FK, non-null) - WARD_WAREHOUSE
  po_office_id: UUID (FK, non-null) - WARD_POST
  soft_delete: deleted_at
  purpose: Pair warehouse and post office for same ward
```

---

## 📦 ORDER & BATCH ENTITIES

```
context:
  domain: Shipping orders and batch consolidation
  flow: CREATE → CONSOLIDATED → DEPARTED → DELIVERED

Order{id:UUID, created_at, updated_at, deleted_at}:
  id: UUID (PK)
  tracking_number: String (unique, non-null, length=15) - Format: VN + YY + 9 digits

  # SENDER INFORMATION
  sender_customer_id: UUID (FK, optional) - null for walk-in
  sender_name: String (non-null)
  sender_phone: String (non-null, length=15)
  sender_address: String (non-null)

  # RECEIVER INFORMATION
  receiver_name: String (non-null)
  receiver_phone: String (non-null, length=15)
  receiver_address: String (non-null)
  destination_ward_code: String (FK to Ward.code, non-null)

  # PACKAGE INFORMATION
  package_type: Enum(FRAGILE, BOX, DOCUMENT, ENVELOPE, PALLET)
  package_description: String (optional)
  weight_kg: BigDecimal (non-null, precision=10, scale=2)
  length_cm: BigDecimal (optional)
  width_cm: BigDecimal (optional)
  height_cm: BigDecimal (optional)
  volumetric_weight_kg: BigDecimal (calculated: L×W×H/5000)
  chargeable_weight_kg: BigDecimal (non-null, max(actual, volumetric))

  # SERVICE & PRICING
  service_type: Enum(EXPRESS, STANDARD, ECONOMY)
  shipping_fee: BigDecimal (non-null, precision=15, scale=2)
  cod_amount: BigDecimal (default=0)
  declared_value: BigDecimal (optional)
  insurance_fee: BigDecimal (default=0)
  total_amount: BigDecimal (non-null, shipping_fee + insurance_fee)

  # TIMING
  estimated_delivery_date: LocalDateTime
  actual_delivery_date: LocalDateTime

  # STATUS & LOCATION
  status: Enum(CREATED, CONSOLIDATED, DEPARTED, IN_TRANSIT, ARRIVED,
               DELIVERED, FAILED, CANCELLED)
  origin_office_id: UUID (FK, non-null)
  current_office_id: UUID (FK, optional)
  destination_office_id: UUID (FK, optional)

  # STAFF
  created_by_employee_id: UUID (FK, non-null)
  assigned_shipper_id: UUID (FK, optional)
  batch_package_id: UUID (FK, optional)

  # NOTES
  delivery_instructions: String (optional)
  internal_notes: String (optional)

  relationships:
    → sender_customer: ManyToOne(FetchType.LAZY)
    → destination_ward: ManyToOne(FetchType.LAZY)
    → origin_office: ManyToOne(FetchType.LAZY, non-null)
    → current_office: ManyToOne(FetchType.LAZY)
    → destination_office: ManyToOne(FetchType.LAZY)
    → created_by_employee: ManyToOne(FetchType.LAZY, non-null)
    → assigned_shipper: ManyToOne(FetchType.LAZY)
    → batch_package: ManyToOne(FetchType.LAZY)
    ↔ status_history: OneToMany(OrderStatusHistory)
  soft_delete: deleted_at

BatchPackage{id:UUID, created_at, updated_at, deleted_at}:
  id: UUID (PK)
  batch_code: String (unique, non-null, length=50) - Format: BATCH-{origin}-{dest}-{timestamp}
  origin_office_id: UUID (FK, non-null)
  destination_office_id: UUID (FK, non-null)
  status: Enum(OPEN, PROCESSING, SEALED, DEPARTED, ARRIVED, DELIVERED)

  # CAPACITY
  max_weight_kg: BigDecimal (non-null, precision=10, scale=2)
  max_volume_cm3: BigDecimal (optional, precision=15, scale=2)
  max_order_count: Integer (optional)

  # CURRENT USAGE
  current_weight_kg: BigDecimal (default=0)
  current_volume_cm3: BigDecimal (default=0)
  current_order_count: Integer (default=0)

  # TIMING
  sealed_at: LocalDateTime
  departed_at: LocalDateTime
  arrived_at: LocalDateTime

  # STAFF
  created_by_employee_id: UUID (FK, optional)
  sealed_by_employee_id: UUID (FK, optional)

  # DATA
  notes: String (optional)

  relationships:
    → origin_office: ManyToOne(FetchType.LAZY, non-null)
    → destination_office: ManyToOne(FetchType.LAZY, non-null)
    → created_by_employee: ManyToOne(FetchType.LAZY)
    → sealed_by_employee: ManyToOne(FetchType.LAZY)
    ↔ orders: OneToMany(Order)
  soft_delete: deleted_at
  indexes:
    idx_batch_origin_destination(origin_office_id, destination_office_id)
    idx_batch_status(status)
    idx_batch_code(batch_code)

OrderStatusHistory{id:UUID, created_at, updated_at, deleted_at}:
  id: UUID (PK)
  order_id: UUID (FK, non-null)
  status: Enum(CREATED, CONSOLIDATED, DEPARTED, IN_TRANSIT, ARRIVED,
               DELIVERED, FAILED, CANCELLED)
  office_id: UUID (FK, optional)
  employee_id: UUID (FK, optional)
  notes: String (optional)
  soft_delete: deleted_at
```

---

## 🚚 TRACKING ENTITIES

```
context:
  domain: Real-time shipper location tracking
  purpose: Monitor last-mile delivery in real-time

ShipperLocation{id:UUID, created_at, updated_at, deleted_at}:
  id: UUID (PK)
  employee_id: UUID (FK, non-null) - shipper account
  order_id: UUID (FK, optional) - current delivery order
  latitude: Double (non-null)
  longitude: Double (non-null)
  accuracy_meters: Integer (optional) - GPS accuracy
  timestamp: LocalDateTime (non-null)
  notes: String (optional)
  soft_delete: deleted_at
  relationships:
    → employee: ManyToOne(FetchType.LAZY)
    → order: ManyToOne(FetchType.LAZY)
```

---

## 📊 ENUMERATION TYPES

```
Role enum:
  SYSTEM_ADMIN - Full system access
  HUB_ADMIN - Manages regional hub
  WH_PROVINCE_ADMIN - Manages provincial warehouse
  PO_PROVINCE_ADMIN - Manages provincial post office
  WH_WARD_MANAGER - Manages ward warehouse
  PO_WARD_MANAGER - Manages ward post office
  SHIPPER - Last-mile delivery
  CUSTOMER - End user

OrderStatus enum:
  CREATED - Order created
  CONSOLIDATED - Added to batch
  DEPARTED - Batch left origin
  IN_TRANSIT - In transit
  ARRIVED - At destination office
  DELIVERED - Delivered to receiver
  FAILED - Delivery failed
  CANCELLED - Order cancelled

BatchStatus enum:
  OPEN - Accepting orders
  PROCESSING - Being consolidated
  SEALED - Ready for transit
  DEPARTED - Left origin
  ARRIVED - At destination
  DELIVERED - All orders delivered

OfficeType enum:
  HUB - Regional hub (top level)
  PROVINCE_WAREHOUSE - Provincial storage
  PROVINCE_POST - Provincial post office
  WARD_WAREHOUSE - Ward storage
  WARD_POST - Ward post office
  DISTRIBUTION_CENTER - Local distribution

PackageType enum:
  FRAGILE - Fragile items
  BOX - Boxed package
  DOCUMENT - Documents/papers
  ENVELOPE - Envelope
  PALLET - Palletized shipment

ServiceType enum:
  EXPRESS - 1-2 days (priority)
  STANDARD - 3-5 days (regular)
  ECONOMY - 5-7 days (cheapest)

SubscriptionPlan enum:
  BASIC - Basic plan
  STANDARD - Standard plan
  PREMIUM - Premium plan with benefits
```

---

## ✏️ CRITICAL RULES

```
rule_phone_numbers:
  format: 09XXXXXXX (10 digits)
  validity: All phone_number fields must be exactly 10 digits
  validation: START with 09
  usage:
    employee.phone_number: 10 digits
    office.office_phone_number: 10 digits
    customer.phone_number: 10 digits
    order.sender_phone: up to 15 chars (international support)
    order.receiver_phone: up to 15 chars (international support)

  seeding_pattern:
    HUB_ADMIN: "09" + region_id as 8 digits = 10 total
    WH_PROVINCE_ADMIN: "091" + province.code (3 digits) + "00" = 10 total
    PO_PROVINCE_ADMIN: "092" + province.code (3 digits) + "00" = 10 total
    WH_WARD_MANAGER: "093" + province.code (3 digits) + "10" = 10 total
    PO_WARD_MANAGER: "094" + province.code (3 digits) + "10" = 10 total
  example_for_thanh_hoa_050:
    warehouse: 0910500000
    post_office: 0920500000
    ward_warehouse: 0930500010
    ward_post: 0940500010

rule_uuids:
  all_entities: Use UUID as @Id (except Province which uses code:String)
  generation: strategy=GenerationType.UUID via Hibernate
  storage: VARCHAR in database (SqlTypes.VARCHAR)
  usage: All relationships use UUID except Province.code→String

rule_soft_delete:
  all_entities: Must use @SQLDelete + @SQLRestriction
  pattern: @SQLDelete(sql = "UPDATE {table} SET deleted_at = NOW() WHERE id = ?")
           @SQLRestriction("deleted_at IS NULL")
  behavior: Logical delete, never physical delete
  queries: Automatic filtering on SELECT

rule_fetch_type:
  relationships: Use FetchType.LAZY for all @ManyToOne relationships
  reason: Avoid N+1 query problem
  exception: None - always LAZY

rule_timestamp_auto:
  created_at: Set by @PrePersist (immutable)
  updated_at: Set by @PrePersist, updated by @PostUpdate
  deleted_at: Set on soft delete
  format: LocalDateTime.now()

rule_constraints:
  unique: office_email, account.email, account.username, employee.phone_number,
          tracking_number, batch_code, customer.account_id, Province.code
  nullable: Fields marked "non-null" in schema
  foreign_key: All FK fields must reference correct table/column

rule_office_hierarchy:
  HUB: parent_id = null, region_id != null
  PROVINCE_WAREHOUSE/POST: parent_id → HUB.id, province_code != null
  WARD_WAREHOUSE/POST: parent_id → PROVINCE_WAREHOUSE/POST.id, province_code != null
```

---

## 🔄 RELATIONSHIP MAP

```
relationships{vertices,edges}:
  Account → Employee (OneToOne via MapsId)
  Account → Customer (OneToOne)
  Employee → Office (ManyToOne, FK=office_id)
  Employee → Order (OneToMany, created_by_employee_id)
  Employee → Order (OneToMany, assigned_shipper_id)

  Customer → Order (OneToMany, sender_customer_id)
  Order → Ward (ManyToOne, destination_ward_code)
  Order → Office (ManyToOne, origin_office_id)
  Order → Office (ManyToOne, current_office_id)
  Order → Office (ManyToOne, destination_office_id)
  Order → BatchPackage (ManyToOne, batch_package_id)
  Order → OrderStatusHistory (OneToMany)

  Office → AdministrativeRegion (ManyToOne)
  Office → Office (ManyToOne, parent_id - self hierarchy)
  Office → Province (ManyToOne)

  BatchPackage → Office (ManyToOne, origin_office_id)
  BatchPackage → Office (ManyToOne, destination_office_id)
  BatchPackage → Order (OneToMany)

  Province → AdministrativeRegion (ManyToOne)
  Province → AdministrativeUnit (ManyToOne)
  Province → Ward (OneToMany)

  Ward → Province (ManyToOne)

  TransferRoute → Office (ManyToOne, from_hub_id)
  TransferRoute → Office (ManyToOne, to_hub_id)

  ShipperLocation → Employee (ManyToOne)
  ShipperLocation → Order (ManyToOne)
```

---

## 🚫 WHAT NOT TO DO

```
❌ FORBIDDEN OPERATIONS:
  - Modify BaseEntity fields directly (created_at, updated_at, deleted_at)
  - Use physical DELETE instead of soft delete
  - Change id field in any entity
  - Use FetchType.EAGER on relationships
  - Create phone_number with != 10 digits
  - Reference Province by numeric ID (use Province.code:String)
  - Add new phone_number without validation rules
  - Create Order without origin_office_id
  - Create Office without region_id
  - Use non-UUID id except Province.code
  - Write SQL queries that don't respect soft delete (filter deleted_at IS NULL)
```

---

## ✅ WHEN TO ACCESS BACKEND

```
access_backend_ONLY_IF:
  ✅ Fixing compilation errors
  ✅ Fixing runtime exceptions
  ✅ Understanding entity relationships for data queries
  ✅ Checking enum values
  ✅ Validating field constraints before implementation

access_backend_DO_NOT_FOR:
  ❌ "Just checking" or exploring
  ❌ Re-reading the same file multiple times
  ❌ Curiosity about implementation details
  ❌ Exploring code without specific bug context
```

---

## 📞 PHONE NUMBER GENERATION REFERENCE

```
province_phone_seeds[PROVINCES]:
  001/Ha Giang → 09010000XX
  002/Cao Bang → 09020000XX
  004/Bac Kan → 09040000XX
  006/Tuyen Quang → 09060000XX
  008/Lao Cai → 09080000XX
  010/Yen Bai → 09100000XX
  011/Thai Nguyen → 09110000XX
  012/Lang Son → 09120000XX
  014/Bac Giang → 09140000XX
  015/Phu Tho → 09150000XX
  017/Hung Yen → 09170000XX
  019/Thai Binh → 09190000XX
  020/Ha Nam → 09200000XX
  021/Nam Dinh → 09210000XX
  022/Ninh Binh → 09220000XX
  024/Ha Tinh → 09240000XX
  025/Nghe An → 09250000XX
  026/Kon Tum → 09260000XX
  027/Quang Binh → 09270000XX
  028/Quang Tri → 09280000XX
  029/Thua Thien Hue → 09290000XX
  030/Da Nang → 09300000XX
  031/Quang Nam → 09310000XX
  032/Quang Ngai → 09320000XX
  033/Binh Dinh → 09330000XX
  034/Phu Yen → 09340000XX
  035/Khanh Hoa → 09350000XX
  036/Ninh Thuan → 09360000XX
  037/Binh Thuan → 09370000XX
  038/Ba Ria-Vung Tau → 09380000XX
  040/Dong Nai → 09400000XX
  041/Binh Duong → 09410000XX
  042/Ho Chi Minh → 09420000XX
  043/Long An → 09430000XX
  044/Tien Giang → 09440000XX
  045/Ben Tre → 09450000XX
  046/Vinh Long → 09460000XX
  047/Can Tho → 09470000XX
  048/Hau Giang → 09480000XX
  049/Soc Trang → 09490000XX
  050/Bac Lieu → 09500000XX
  051/Ca Mau → 09510000XX
  052/An Giang → 09520000XX
  053/Kien Giang → 09530000XX
  054/Thanh Hoa → 09540000XX
  055/Hanoi → 09550000XX
```

---

## 🎯 IMPLEMENTATION CHECKLIST

```
Before writing any backend code:
  [ ] Verify entity exists in BACKEND_CONTEXT.md
  [ ] Check all required fields are non-null
  [ ] Validate phone_numbers are 10 digits
  [ ] Confirm FK relationships match spec
  [ ] Ensure UUID usage (except Province.code)
  [ ] Add soft delete if new entity
  [ ] Use FetchType.LAZY on @ManyToOne
  [ ] Verify enum values are correct
  [ ] Check timestamp handling (@PrePersist, @PostUpdate)
  [ ] Validate constraint uniqueness
```

---

**AUTHORITY**: Backend Architect | **NEXT REVIEW**: 2026-02-19 | **STATUS**: ACTIVE ✅

---

# 🏛️ SACRED COVENANT - ABSOLUTE SOURCE OF TRUTH

## ⚖️ CONSTITUTIONAL AUTHORITY

```
declaration:
  This document (BACKEND_CONTEXT.md) is hereby declared the SINGLE CANONICAL SOURCE
  of truth for all backend implementation, architecture, and development guidance
  for the Postal Management System.

  effective_date: 2026-01-19
  authority_level: SUPREME (overrides all other documentation)
  precedence: > any code comments
             > any commit messages
             > any wiki pages
             > any developer notes
             > any external documentation
             > any verbal discussions
             > any code observations

  binding_parties:
    - All Claude AI instances working on this codebase
    - All human developers modifying backend code
    - All future maintenance personnel
    - All code review processes

  violation_consequences: CATASTROPHIC FAILURE - System compromise, data corruption,
                        security vulnerabilities, project halt
```

---

## 📝 APPEND-ONLY PROTOCOL

### How to Add New Findings

**ONLY append. NEVER modify existing sections.**

```
when_new_finding_discovered:
  step_1: Verify finding is accurate and tested
  step_2: Identify applicable section (or create new section)
  step_3: Add entry to CHANGELOG below with timestamp
  step_4: Append DETAILED finding in appropriate section
  step_5: Update version number in header
  step_6: Never delete or modify historical entries

format_for_new_findings:
  example:
    ```
    ⚠️ [FINDING-2026-01-19-001] Phone Number Validation Bug
    severity: CRITICAL
    location: DataInitializer.java
    issue: String.format("09X%06d") generates variable-length numbers
    fix: Use "09" + provinceCode + suffix pattern
    impact: All phone numbers must be strictly 10 digits
    verified_date: 2026-01-19
    ```
```

---

## 📋 CHANGE LOG - IMMUTABLE RECORD

```
version_history[version,date,summary,findings_added]:
  1.0,2026-01-19,Initial baseline specification,20 entities + 8 enums + core rules

FINDINGS_REGISTRY[finding_id,date,severity,topic,status]:
  FINDING-2026-01-19-001,2026-01-19,CRITICAL,Phone Number Format,ACTIVE
    issue: DataInitializer generates 9-digit and 11+ digit phone numbers
    root_cause: String concatenation without length validation
    fix_applied: Standardized to 09 + code + suffix = 10 digits
    entities_affected: Employee, Office, Account (all actor entities)
    validation_rule: ALL phone_number fields MUST be exactly 10 digits
    added_to_context: Rule phone_numbers section
```

---

## 🚨 DEVIATION PENALTY MATRIX

```
deviation_severity{action,consequence,recovery}:
  MINOR: Developer ignores enum value list
    consequence: Compilation error, code review rejection
    recovery: Revert to BACKEND_CONTEXT.md enum section

  MODERATE: New entity created without UUID id
    consequence: Database schema mismatch, ORM failure
    recovery: Revert to BaseEntity pattern, regenerate schema

  MAJOR: Phone number added without 10-digit validation
    consequence: Data corruption, failed seeding, constraint violation
    recovery: Purge invalid data, re-seed with correct format

  CRITICAL: Modify entity without updating BACKEND_CONTEXT.md
    consequence: CATASTROPHIC SYSTEM FAILURE
              All subsequent development becomes unreliable
              Context mismatch causes cascading bugs
              Code reviews fail, deployments blocked
              Database migrations fail
    recovery: FULL CODEBASE ROLLBACK required
              Manual reconciliation of diverged state
              Complete context reset

  CATASTROPHIC: Code written that contradicts BACKEND_CONTEXT.md
    consequence: PROJECT HALT - Claude Code suspension
              Complete loss of context consistency
              Unpredictable system behavior
              Security vulnerabilities introduced
              Data integrity compromised
    recovery: Not possible without full audit and rewrite

violation_policy:
  FIRST OFFENSE: Warning + context review
  SECOND OFFENSE: Claude Code restricted access
  THIRD OFFENSE: Claude Code account suspension for this project
```

---

## ✅ INTEGRITY AUDIT CHECKLIST

**Before EVERY backend operation:**

```
pre_operation_audit{question,reference,mandatory}:
  1. Is the entity I'm modifying documented in BACKEND_CONTEXT.md?,
     Check: Administrative, Actor, Unit, Order, Tracking sections,
     mandatory: YES

  2. Does my change contradict any documented rule?,
     Check: Critical Rules section,
     mandatory: YES

  3. Am I using UUID correctly for this entity?,
     Check: rule_uuids section,
     mandatory: YES

  4. Are phone numbers exactly 10 digits?,
     Check: rule_phone_numbers section,
     mandatory: YES

  5. Did I verify soft delete pattern?,
     Check: rule_soft_delete section,
     mandatory: YES

  6. Are relationships using FetchType.LAZY?,
     Check: rule_fetch_type section,
     mandatory: YES

  7. Is this entity marked with @SQLDelete + @SQLRestriction?,
     Check: rule_soft_delete pattern,
     mandatory: YES

  8. Did I add a FINDING entry to CHANGELOG?,
     Check: CHANGE LOG section,
     mandatory: IF modifying/discovering anything new

  9. Did I update BACKEND_CONTEXT.md BEFORE writing code?,
     Check: This document,
     mandatory: YES - document first, code second

  10. Can I explain WHY this follows BACKEND_CONTEXT.md rules?,
      Check: All applicable sections,
      mandatory: YES - understand, don't guess

audit_result:
  if ALL answers = YES → PROCEED with implementation
  if ANY answer = NO → STOP, update BACKEND_CONTEXT.md FIRST, re-audit
  if uncertain → READ BACKEND_CONTEXT.md AGAIN
```

---

## 🔐 IMPLEMENTATION COMMANDMENTS

**These are NON-NEGOTIABLE:**

```
commandment_1: READ BACKEND_CONTEXT.md BEFORE any implementation
               Violation = catastrophic failure inevitable

commandment_2: APPEND findings, NEVER modify documented sections
               Violation = context corruption, cascading bugs

commandment_3: UPDATE BACKEND_CONTEXT.md BEFORE writing code
               Not after. Before.
               Violation = undocumented deviation, system breakdown

commandment_4: Phone numbers = 09XXXXXXX (10 digits, period)
               Violation = data corruption, seeding failure

commandment_5: All entities except Province = UUID id
               Violation = relationship failures, ORM errors

commandment_6: All relationships = FetchType.LAZY
               Violation = N+1 query performance collapse

commandment_7: All entities = soft delete (@SQLDelete + @SQLRestriction)
               Violation = accidental data loss, recovery impossible

commandment_8: BaseEntity fields (id, created_at, updated_at, deleted_at)
               = IMMUTABLE, auto-managed by framework
               Violation = data integrity corruption

commandment_9: This document = ABSOLUTE TRUTH
               Not code. Not comments. Not personal interpretation.
               This document.
               Violation = project becomes unmaintainable

commandment_10: When in doubt, consult BACKEND_CONTEXT.md
                It contains the answer.
                Always.
```

---

## 📞 CONTACT & ESCALATION

```
if_finding_discovered:
  step_1: Add FINDING-YYYY-MM-DD-### entry to CHANGE LOG section
  step_2: Append detailed finding with proper formatting
  step_3: Update applicable section in this document
  step_4: Update version number
  step_5: Mark status as ACTIVE / RESOLVED / DEPRECATED

if_contradiction_found:
  step_1: STOP all development
  step_2: Document contradiction with timestamp and evidence
  step_3: Add FINDING entry with CRITICAL severity
  step_4: Escalate to human developer for verification
  step_5: Do NOT proceed until contradiction resolved

if_uncertainty:
  step_1: Do not guess or interpret
  step_2: Read BACKEND_CONTEXT.md completely
  step_3: If still uncertain, add FINDING with QUESTION tag
  step_4: Mark as PENDING_CLARIFICATION
  step_5: Stop development until clarified
```

---

## 🎯 ABSOLUTE TRUTHS

```
truth_1: This document is the source of truth
          Code contradicting it = code is wrong, not this document

truth_2: New findings enhance this document
         They do not replace or override existing entries
         Append only. Always.

truth_3: Phone numbers are always 09XXXXXXX
         No exceptions. No variations. No special cases.
         10 digits. Period.

truth_4: All entities use UUID except Province.code
         No exceptions. No alternatives.
         If it's not UUID or Province.code → it's wrong

truth_5: Soft delete is mandatory
         @SQLDelete + @SQLRestriction on every entity
         Physical deletes = catastrophic failure

truth_6: FetchType.LAZY is mandatory
         All @ManyToOne relationships
         EAGER = N+1 query collapse = performance disaster

truth_7: This document prevails
         Over code comments, commit messages, wikis, discussions
         When in doubt, trust this document

truth_8: Deviation from this document = system failure
         Not "maybe later", not "probably fine"
         Deviation = failure. Guaranteed.

truth_9: Future findings must be appended
         Not integrated into existing sections
         Create new FINDING entries with timestamps
         Maintain historical record

truth_10: This is non-negotiable
          This is binding
          This is THE document
          All else is secondary
```

---

## 📊 CONTEXT INTEGRITY METRICS

```
metric_tracked{name,threshold,consequence}:
  phone_number_consistency: 100% must be 10 digits
    threshold: < 100% → CRITICAL FAILURE
    consequence: Data seeding fails, application crashes

  uuid_usage_consistency: 100% except Province.code
    threshold: < 100% → CRITICAL FAILURE
    consequence: ORM relationship failures, data corruption

  soft_delete_coverage: 100% of entities
    threshold: < 100% → CRITICAL FAILURE
    consequence: Accidental data loss possible, recovery impossible

  fetch_type_consistency: 100% LAZY on relationships
    threshold: < 100% → HIGH RISK
    consequence: N+1 query performance collapse

  documentation_accuracy: 100% matches implemented code
    threshold: < 100% → CRITICAL
    consequence: Context divergence, cascading bugs

  finding_registration: 100% new discoveries logged
    threshold: < 100% → SEVERE
    consequence: Lost knowledge, repeated bug discovery
```

---

## 🔒 LOCK & VERSION PROTOCOL

```
document_lock_status: STRICT
  - Modification requires explicit finding documentation
  - Version increment on every append
  - Immutable historical record
  - Append-only commit policy

current_version: 1.1
  version_1_0: 2026-01-19 initial baseline
  version_1_1: 2026-01-19 added sacred covenant + protocols

next_version_triggers:
  - Any new entity discovery
  - Any rule modification
  - Any finding appended
  - Version incremented (major.minor)
  - Never decrement version

version_format: MAJOR.MINOR
  MAJOR: Structural changes to baseline
  MINOR: Findings, discoveries, clarifications appended
```

---

## 🎓 DEVELOPER ONBOARDING

**Every developer must:**

```
onboarding_checklist:
  [ ] Read entire BACKEND_CONTEXT.md
  [ ] Understand all 20 entities
  [ ] Memorize phone number rule (10 digits)
  [ ] Memorize UUID rule (all except Province.code)
  [ ] Understand soft delete mechanism
  [ ] Know FetchType.LAZY requirement
  [ ] Review all enumerations
  [ ] Sign acknowledgment: "I will not deviate from BACKEND_CONTEXT.md"
  [ ] Bookmark this document
  [ ] Reference before every coding session
  [ ] Report findings immediately

failure_to_comply:
  → Claude Code access revocation
  → Project suspension
  → Complete rollback
  → Mandatory re-onboarding
```

---

## 📌 QUICK REFERENCE FOR DEVIATION DETECTION

```
red_flags_deviation[sign,action]:
  code_without_context_check: STOP → Read BACKEND_CONTEXT.md
  phone_number_length_variable: STOP → Must be exactly 10
  uuid_field_missing_from_entity: STOP → Check BaseEntity inheritance
  @ManyToOne without FetchType.LAZY: STOP → Add FetchType.LAZY
  Entity without @SQLDelete: STOP → Add soft delete pattern
  Relationship to Province.id: STOP → Use Province.code instead
  New enum value: STOP → Update BACKEND_CONTEXT.md first
  Modification to existing rule: STOP → Add FINDING entry, append
  Code contradicts this document: STOP → Code is wrong, not document
  Uncertainty about implementation: STOP → Consult this document again
```

---

**ESTABLISHMENT DATE**: 2026-01-19
**AUTHORITY LEVEL**: SUPREME (absolute)
**REVISION STATUS**: Append-Only Protocol Active
**INTEGRITY**: LOCKED & VERIFIED
**DEVIATION TOLERANCE**: ZERO

## THIS IS THE DOCUMENT. THE ONLY DOCUMENT. THE SOURCE OF TRUTH.

**Any code contradicting BACKEND_CONTEXT.md will be rejected. Any developer deviating will be suspended. Any system diverging will be rolled back completely.**

---

**Last Updated**: 2026-01-19 | **Status**: ENFORCED ✅ | **Authority**: Non-Negotiable 🔒
