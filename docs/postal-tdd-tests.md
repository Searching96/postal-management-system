**Total Test Cases Designed: 400+**

**Estimated Test Development Time: 120-150 hours**

**Estimated Test Execution Time: 10-12 hours (full suite)**

---

## 16. PATH COVERAGE ANALYSIS

### 16.1 Complete Path Coverage Matrix

#### Database Operations Coverage
| Operation | Create | Read | Update | Delete | Bulk | Transaction |
|-----------|--------|------|--------|--------|------|-------------|
| Organizations | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Orders | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Status History | ✅ | ✅ | ⛔ | ⛔ | ✅ | ✅ |
| Routes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POD | ✅ | ✅ | ✅ | ⛔ | ❌ | ✅ |
| COD Collections | ✅ | ✅ | ✅ | ⛔ | ✅ | ✅ |
| Manifests | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Complaints | ✅ | ✅ | ✅ | ⛔ | ❌ | ✅ |
| Audit Logs | ✅ | ✅ | ⛔ | ⛔ | ❌ | ✅ |

✅ = Full test coverage | ⛔ = Intentionally restricted | ❌ = Not applicable

---

### 16.2 Constraint Coverage Matrix

#### Foreign Key Constraints
| Table | Foreign Key | Valid Insert | Invalid Insert | Cascade Delete | Restrict Delete |
|-------|-------------|--------------|----------------|----------------|-----------------|
| Organizations | parent_id | ✅ | ✅ | ❌ | ✅ |
| Users | organization_id | ✅ | ✅ | ❌ | ✅ |
| Customers | created_by | ✅ | ❌ | ❌ | ❌ |
| Orders | customer_id | ✅ | ✅ | ❌ | ✅ |
| Orders | service_type_id | ✅ | ✅ | ❌ | ✅ |
| Orders | origin_office_id | ✅ | ✅ | ❌ | ✅ |
| Orders | destination_office_id | ✅ | ✅ | ❌ | ✅ |
| Orders | created_by | ✅ | ✅ | ❌ | ❌ |
| Status History | order_id | ✅ | ✅ | ✅ | ❌ |
| Status History | organization_id | ✅ | ❌ | ❌ | ❌ |
| POD | order_id | ✅ | ✅ | ❌ | ❌ |
| POD | courier_id | ✅ | ✅ | ❌ | ❌ |
| Failed Attempts | order_id | ✅ | ✅ | ❌ | ❌ |
| COD Collections | order_id | ✅ | ✅ | ❌ | ❌ |
| Manifests | origin_office_id | ✅ | ✅ | ❌ | ✅ |
| Manifest Items | manifest_id | ✅ | ✅ | ✅ | ❌ |
| Complaints | order_id | ✅ | ✅ | ❌ | ❌ |

#### Unique Constraints
| Table | Column | Duplicate Insert | Case Sensitivity | Length Validation |
|-------|--------|------------------|------------------|-------------------|
| Organizations | code | ✅ | ✅ | ✅ |
| Users | username | ✅ | ✅ | ✅ |
| Users | email | ✅ | ✅ | ✅ |
| Customers | code | ✅ | ✅ | ✅ |
| Orders | tracking_number | ✅ | ✅ | ✅ |
| Service Types | code | ✅ | ✅ | ✅ |
| Manifests | code | ✅ | ✅ | ✅ |
| Complaints | code | ✅ | ✅ | ✅ |

#### NOT NULL Constraints
| Table | Required Field | NULL Insert | Empty String | Boundary Test |
|-------|---------------|-------------|--------------|---------------|
| Organizations | code | ✅ | ✅ | ✅ |
| Organizations | name | ✅ | ✅ | ✅ |
| Organizations | type | ✅ | ❌ | ✅ |
| Users | organization_id | ✅ | ❌ | ❌ |
| Users | username | ✅ | ✅ | ✅ |
| Users | email | ✅ | ✅ | ✅ |
| Users | password_hash | ✅ | ❌ | ✅ |
| Users | role | ✅ | ❌ | ✅ |
| Customers | phone | ✅ | ✅ | ✅ |
| Orders | tracking_number | ✅ | ❌ | ✅ |
| Orders | customer_id | ✅ | ❌ | ❌ |
| Orders | receiver_province | ✅ | ✅ | ✅ |
| Orders | receiver_district | ✅ | ✅ | ✅ |
| Orders | chargeable_weight | ✅ | ❌ | ✅ |
| Orders | created_by | ✅ | ❌ | ❌ |

---

### 16.3 Enum Value Coverage

#### Status Enum (Orders)
| Value | Create Order | Transition To | Transition From | Query Filter | Invalid Value |
|-------|--------------|---------------|-----------------|--------------|---------------|
| PENDING | ✅ | ✅ | ❌ | ✅ | ✅ |
| PICKED_UP | ❌ | ✅ | ✅ | ✅ | ✅ |
| IN_TRANSIT | ❌ | ✅ | ✅ | ✅ | ✅ |
| OUT_FOR_DELIVERY | ❌ | ✅ | ✅ | ✅ | ✅ |
| DELIVERED | ❌ | ✅ | ✅ | ✅ | ✅ |
| FAILED | ❌ | ✅ | ✅ | ✅ | ✅ |
| RETURNED | ❌ | ✅ | ✅ | ✅ | ✅ |
| CANCELLED | ❌ | ✅ | ⛔ | ✅ | ✅ |

#### Role Enum (Users)
| Value | Create User | Query | Permission Test |
|-------|-------------|-------|-----------------|
| ADMIN | ✅ | ✅ | ✅ |
| MANAGER | ✅ | ✅ | ✅ |
| CLERK | ✅ | ✅ | ✅ |
| WAREHOUSE | ✅ | ✅ | ✅ |
| DISPATCHER | ✅ | ✅ | ✅ |
| COURIER | ✅ | ✅ | ✅ |
| ACCOUNTANT | ✅ | ✅ | ✅ |

#### Customer Type Enum
| Value | Create | Query | Business Logic |
|-------|--------|-------|----------------|
| INDIVIDUAL | ✅ | ✅ | ✅ |
| SME | ✅ | ✅ | ✅ |
| ENTERPRISE | ✅ | ✅ | ✅ |

#### Organization Type Enum
| Value | Create | Hierarchy Test | Query |
|-------|--------|----------------|-------|
| HQ | ✅ | ✅ | ✅ |
| BRANCH | ✅ | ✅ | ✅ |
| POST_OFFICE | ✅ | ✅ | ✅ |

---

### 16.4 Boundary Value Coverage

#### Numeric Fields
| Field | Min Valid | Min Invalid | Max Valid | Max Invalid | Zero | NULL |
|-------|-----------|-------------|-----------|-------------|------|------|
| actual_weight | 0.01 | -0.01 | 1000 | 10001 | ⚠️ | ❌ |
| cod_amount | 0 | -1 | 999999999 | ❌ | ✅ | ❌ |
| declared_value | 0 | -1 | 999999999 | ❌ | ✅ | ❌ |
| total_fee | 0 | -1 | 999999999 | ❌ | ⚠️ | ❌ |
| latitude | -90 | -91 | 90 | 91 | ✅ | ✅ |
| longitude | -180 | -181 | 180 | 181 | ✅ | ✅ |
| organization.level | 1 | 0 | 10 | 11 | ❌ | ❌ |

#### String Fields
| Field | Min Length | Empty String | Max Length | Over Max | Special Chars | UTF-8 |
|-------|------------|--------------|------------|----------|---------------|-------|
| tracking_number | 14 | ❌ | 14 | ❌ | ✅ | ❌ |
| org.code | 1 | ❌ | 50 | ❌ | ✅ | ✅ |
| username | 3 | ❌ | 100 | ❌ | ⚠️ | ✅ |
| email | 5 | ❌ | 255 | ❌ | ✅ | ✅ |
| phone | 10 | ❌ | 20 | ❌ | ⚠️ | ❌ |
| address (TEXT) | 0 | ✅ | 65535 | ❌ | ✅ | ✅ |
| notes (TEXT) | 0 | ✅ | 65535 | ❌ | ✅ | ✅ |

✅ = Must test | ❌ = Not applicable | ⚠️ = Edge case

---

### 16.5 State Transition Coverage

#### Order Status State Machine
```
PENDING → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
   ↓                                       ↓              ↓
CANCELLED                               FAILED ↔ (retry)  RETURNED
```

**Transition Matrix (From → To):**
| From ↓ / To → | PENDING | PICKED_UP | IN_TRANSIT | OUT_FOR_DELIVERY | DELIVERED | FAILED | RETURNED | CANCELLED |
|---------------|---------|-----------|------------|------------------|-----------|--------|----------|-----------|
| PENDING       | ⚠️      | ✅        | ⚠️         | ❌               | ❌        | ❌     | ❌       | ✅        |
| PICKED_UP     | ❌      | ⚠️        | ✅         | ⚠️               | ❌        | ❌     | ❌       | ✅        |
| IN_TRANSIT    | ❌      | ❌        | ⚠️         | ✅               | ❌        | ❌     | ❌       | ✅        |
| OUT_FOR_DELIVERY | ❌   | ❌        | ❌         | ⚠️               | ✅        | ✅     | ❌       | ✅        |
| DELIVERED     | ❌      | ❌        | ❌         | ❌               | ⚠️        | ❌     | ✅       | ❌        |
| FAILED        | ❌      | ❌        | ❌         | ✅               | ❌        | ⚠️     | ❌       | ✅        |
| RETURNED      | ❌      | ❌        | ❌         | ❌               | ❌        | ❌     | ⚠️       | ❌        |
| CANCELLED     | ❌      | ❌        | ❌         | ❌               | ❌        | ❌     | ❌       | ⚠️        |

✅ = Valid transition (tested) | ❌ = Invalid transition (tested) | ⚠️ = Same state (edge case tested)

#### Manifest Status State Machine
```
DRAFT → SEALED → IN_TRANSIT → RECEIVED
```

**All transitions tested:** 4 valid paths, 12 invalid paths

#### Complaint Status State Machine
```
OPEN → INVESTIGATING → RESOLVED → CLOSED
         ↓                 ↓
      REJECTED         CLOSED
```

**All transitions tested:** 6 valid paths, 10 invalid paths

---

### 16.6 Error Path Coverage

#### Database Errors
| Error Type | Test Count | Scenarios Covered |
|------------|------------|-------------------|
| Foreign Key Violation | 25 | Invalid references across all tables |
| Unique Constraint Violation | 18 | Duplicate codes, emails, tracking numbers |
| NOT NULL Constraint Violation | 22 | Missing required fields |
| Data Type Mismatch | 15 | Wrong type insertions |
| Enum Constraint Violation | 12 | Invalid enum values |
| Check Constraint Violation | 8 | Business rule violations |
| Deadlock | 3 | Concurrent update conflicts |
| Transaction Rollback | 10 | Partial failure scenarios |

#### Application Errors
| Error Type | Test Count | Scenarios Covered |
|------------|------------|-------------------|
| Invalid Status Transition | 28 | All invalid state changes |
| Immutable Field Update | 5 | Tracking number, customer_id changes |
| Business Rule Violation | 20 | COD limits, weight limits, etc. |
| Concurrent Modification | 8 | Race conditions |
| Authorization Failure | 12 | Permission violations |

---

### 16.7 Performance Path Coverage

#### Index Usage Tests
| Index | Range Query | Equality | Sort | Join | Compound |
|-------|-------------|----------|------|------|----------|
| orders.tracking_number (UNIQUE) | ❌ | ✅ | ✅ | ✅ | ❌ |
| orders.customer_id | ✅ | ✅ | ✅ | ✅ | ✅ |
| orders.status | ✅ | ✅ | ✅ | ✅ | ✅ |
| orders.created_at | ✅ | ✅ | ✅ | ✅ | ✅ |
| orders.receiver_phone | ❌ | ✅ | ❌ | ✅ | ✅ |
| orders.origin_office_id | ✅ | ✅ | ✅ | ✅ | ✅ |
| customers.phone | ❌ | ✅ | ❌ | ✅ | ❌ |
| users.organization_id | ✅ | ✅ | ✅ | ✅ | ✅ |
| users.role | ✅ | ✅ | ✅ | ✅ | ✅ |

#### Query Pattern Tests
| Pattern | Test Count | Max Records | Target Time |
|---------|------------|-------------|-------------|
| Single record lookup | 15 | 1M | <50ms |
| Range query | 12 | 1M | <200ms |
| Join (2 tables) | 20 | 1M | <300ms |
| Join (3+ tables) | 8 | 1M | <500ms |
| Aggregation | 15 | 1M | <1s |
| Complex reporting | 6 | 1M | <3s |

---

### 16.8 Concurrency Path Coverage

#### Concurrent Operations
| Operation Pair | Test | Expected Behavior |
|----------------|------|-------------------|
| Create order + Create order (same second) | ✅ | Unique tracking numbers |
| Update order + Update order (same record) | ✅ | Last write wins |
| Create COD + Reconcile COD | ✅ | Serializable isolation |
| Seal manifest + Add to manifest | ✅ | One operation fails |
| Assign route + Update route | ✅ | Lock prevents conflict |
| Multiple status updates | ✅ | All logged in order |

#### Transaction Isolation Tests
| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Test Count |
|-------|------------|---------------------|--------------|------------|
| READ UNCOMMITTED | ⚠️ | ⚠️ | ⚠️ | 0 (not recommended) |
| READ COMMITTED | ✅ | ⚠️ | ⚠️ | 5 |
| REPEATABLE READ | ✅ | ✅ | ⚠️ | 10 (MySQL default) |
| SERIALIZABLE | ✅ | ✅ | ✅ | 5 (for critical operations) |

---

### 16.9 Data Volume Path Coverage

#### Scalability Tests
| Table | Small (<100) | Medium (1K-10K) | Large (100K-1M) | Very Large (>1M) |
|-------|--------------|-----------------|-----------------|------------------|
| Organizations | ✅ | ✅ | ❌ | ❌ |
| Users | ✅ | ✅ | ✅ | ❌ |
| Customers | ✅ | ✅ | ✅ | ✅ |
| Orders | ✅ | ✅ | ✅ | ✅ |
| Status History | ✅ | ✅ | ✅ | ✅ |
| Routes | ✅ | ✅ | ✅ | ❌ |
| COD Collections | ✅ | ✅ | ✅ | ✅ |
| Manifests | ✅ | ✅ | ✅ | ❌ |

---

### 16.10 Edge Case Coverage Summary

#### Temporal Edge Cases
- ✅ Midnight crossing (date change)
- ✅ Leap year (Feb 29)
- ✅ Daylight saving time
- ✅ Timezone handling
- ✅ Weekend delivery estimation
- ✅ Holiday delivery estimation
- ✅ Business hours validation
- ✅ Concurrent timestamp collisions

#### Data Edge Cases
- ✅ Empty strings vs NULL
- ✅ Whitespace-only strings
- ✅ Maximum field lengths
- ✅ Minimum field values (zero, negative)
- ✅ Unicode and special characters
- ✅ Very long text fields (10K+ chars)
- ✅ Binary data in text fields
- ✅ SQL injection patterns

#### Business Logic Edge Cases
- ✅ Self-referential relationships
- ✅ Circular references
- ✅ Orphaned records
- ✅ Duplicate data handling
- ✅ Missing optional data
- ✅ Conflicting business rules
- ✅ Edge status transitions
- ✅ Maximum limits (sequence overflow)

---

## 17. TEST COVERAGE METRICS

### 17.1 Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| **Statement Coverage** | 95% | TBD |
| **Branch Coverage** | 90% | TBD |
| **Path Coverage** | 85% | TBD |
| **Condition Coverage** | 90% | TBD |
| **Function Coverage** | 100% | TBD |
| **Table Coverage** | 100% | ✅ |
| **Constraint Coverage** | 100% | ✅ |
| **Status Transition Coverage** | 100% | ✅ |

### 17.2 Critical Path Priority

#### Tier 1: Must Pass (Pre-Deployment Blockers)
- Order creation and tracking (50 tests)
- Status transitions (30 tests)
- Foreign key integrity (25 tests)
- Unique constraints (18 tests)
- NOT NULL constraints (22 tests)
- **Total: 145 tests** - Estimated 3 hours

#### Tier 2: Should Pass (MVP Quality)
- All query performance (35 tests)
- COD reconciliation (15 tests)
- Manifest workflow (12 tests)
- Complaint handling (10 tests)
- Business logic validation (25 tests)
- **Total: 97 tests** - Estimated 2.5 hours

#### Tier 3: Can Pass Later (Enhancement)
- Edge cases (40 tests)
- Unicode handling (20 tests)
- Boundary values (30 tests)
- Concurrent operations (18 tests)
- **Total: 108 tests** - Estimated 2 hours

#### Tier 4: Nice to Have (Future Optimization)
- Performance optimization (25 tests)
- Scalability tests (15 tests)
- Complex reporting (12 tests)
- **Total: 52 tests** - Estimated 1.5 hours

---

## 18. CONTINUOUS INTEGRATION STRATEGY

### 18.1 CI Pipeline Stages

#### Stage 1: Fast Feedback (3 minutes)
- Schema validation
- Syntax checking
- Tier 1 critical tests (subset)
- **Runs on:** Every commit

#### Stage 2: Core Testing (15 minutes)
- All Tier 1 tests
- Selected Tier 2 tests
- **Runs on:** Pull requests

#### Stage 3: Full Regression (2 hours)
- All tests (Tier 1-4)
- Performance benchmarks
- Load testing
- **Runs on:** Nightly / Pre-release

### 18.2 Test Data Management

#### Test Database Strategy
1. **Unit test DB**: Fresh schema, minimal data
2. **Integration test DB**: Realistic data (10K orders)
3. **Performance test DB**: Production-like (1M+ orders)
4. **Staging DB**: Clone of production (anonymized)

#### Data Refresh Strategy
- Unit tests: Clean schema before each test class
- Integration tests: Reset to baseline after each suite
- Performance tests: Persist data, refresh weekly
- Staging: Sync from production monthly

---

## 19. TEST AUTOMATION RECOMMENDATIONS

### 19.1 Tools and Frameworks

#### Recommended Stack
- **Test Framework**: pytest (Python) or JUnit (Java)
- **Database Testing**: DBUnit, testcontainers
- **Mocking**: unittest.mock, Mockito
- **Load Testing**: Apache JMeter, Locust
- **CI/CD**: GitHub Actions, Jenkins
- **Coverage**: coverage.py, JaCoCo

### 19.2 Test Code Structure

```
tests/
├── unit/
│   ├── test_organizations.py (30 tests)
│   ├── test_users.py (30 tests)
│   ├── test_customers.py (25 tests)
│   ├── test_orders.py (50 tests)
│   └── test_pricing.py (15 tests)
├── integration/
│   ├── test_order_workflow.py (25 tests)
│   ├── test_cod_reconciliation.py (15 tests)
│   ├── test_manifest_flow.py (12 tests)
│   └── test_delivery_route.py (20 tests)
├── performance/
│   ├── test_query_performance.py (35 tests)
│   ├── test_concurrent_operations.py (18 tests)
│   └── test_bulk_operations.py (15 tests)
├── e2e/
│   └── test_complete_order_lifecycle.py (10 scenarios)
├── fixtures/
│   ├── sample_data.sql
│   ├── large_dataset_generator.py
│   └── test_data_factory.py
└── utils/
    ├── db_setup.py
    ├── assertions.py
    └── test_helpers.py
```

---

## 20. ACCEPTANCE CRITERIA

### MVP Launch Criteria

#### Code Quality
- ✅ All Tier 1 tests pass (100%)
- ✅ 95%+ Tier 2 tests pass
- ✅ No critical or high severity bugs
- ✅ Code coverage >85%

#### Performance
- ✅ Single order creation <100ms
- ✅ Tracking lookup <50ms
- ✅ Status update <100ms
- ✅ Dashboard load <2s
- ✅ Support 500 orders/day per instance

#### Reliability
- ✅ Zero data loss scenarios
- ✅ Transaction rollback verified
- ✅ Foreign key integrity 100%
- ✅ Audit trail complete

#### Documentation
- ✅ All test cases documented
- ✅ Test data setup guide
- ✅ Known limitations listed
- ✅ Performance benchmarks recorded

---

**COMPREHENSIVE TEST PLAN COMPLETE**

This test plan ensures **FULL PATH COVERAGE** including:
- ✅ All CRUD operations
- ✅ All constraint types
- ✅ All enum values
- ✅ All status transitions
- ✅ All error paths
- ✅ All boundary conditions
- ✅ All concurrent scenarios
- ✅ All performance benchmarks
- ✅ All edge cases
- ✅ All integration points# Postal Management System - Test-Driven Development Test Cases

## Test Strategy Overview

### Testing Levels
- **Unit Tests**: Individual database operations (CRUD)
- **Integration Tests**: Cross-table relationships and constraints
- **Business Logic Tests**: Stored procedures, triggers, complex queries
- **Performance Tests**: Query optimization, indexing effectiveness
- **Data Integrity Tests**: Foreign keys, constraints, validations

---

## 1. ORGANIZATION & USER MANAGEMENT

### 1.1 Organization Tests

#### TC-ORG-001: Create Root Organization (HQ)
**Objective**: Verify HQ creation with level 1 and no parent
**Preconditions**: Empty organizations table
**Test Steps**:
1. Insert organization with type='HQ', level=1, parent_id=NULL
2. Verify record created successfully
3. Verify auto-generated ID
4. Verify timestamps set correctly
**Expected Result**: Organization created with valid ID, level=1, parent_id=NULL
**Priority**: Critical

#### TC-ORG-002: Create Child Organization with Valid Parent
**Objective**: Verify branch/post office creation under valid parent
**Preconditions**: HQ exists (ID=1)
**Test Steps**:
1. Insert branch with parent_id=1, level=2
2. Verify foreign key relationship
3. Verify hierarchy integrity
**Expected Result**: Branch created successfully with correct parent reference
**Priority**: Critical

#### TC-ORG-003: Reject Child Organization with Invalid Parent
**Objective**: Verify foreign key constraint enforcement
**Preconditions**: Organizations table has data
**Test Steps**:
1. Attempt to insert organization with parent_id=9999 (non-existent)
2. Capture error
**Expected Result**: Foreign key constraint violation error
**Priority**: High

#### TC-ORG-004: Validate Organization Hierarchy Levels
**Objective**: Ensure level consistency (HQ=1, Branch=2, Post Office=3)
**Preconditions**: Multi-level hierarchy exists
**Test Steps**:
1. Query all organizations
2. Verify HQ has level=1
3. Verify branches have level=2
4. Verify post offices have level=3
**Expected Result**: All levels match their type
**Priority**: Medium

#### TC-ORG-005: Unique Organization Code Constraint
**Objective**: Verify code uniqueness
**Preconditions**: Organization with code='HQ001' exists
**Test Steps**:
1. Attempt to insert another org with code='HQ001'
2. Capture error
**Expected Result**: Unique constraint violation
**Priority**: High

#### TC-ORG-006: Soft Delete (is_active flag)
**Objective**: Verify deactivation doesn't break relationships
**Preconditions**: Organization with dependent users exists
**Test Steps**:
1. Set is_active=FALSE on organization
2. Verify users still linked
3. Verify no cascade delete
**Expected Result**: Organization deactivated, relationships intact
**Priority**: Medium

#### TC-ORG-007: NULL Parent for Non-HQ Organization
**Objective**: Verify business logic enforces parent requirement
**Preconditions**: None
**Test Steps**:
1. Attempt to create BRANCH with parent_id=NULL
2. Should be allowed by DB but flagged by application logic
**Expected Result**: DB allows, app validates
**Priority**: Medium

#### TC-ORG-008: Circular Parent Reference Prevention
**Objective**: Prevent org A → B → A circular reference
**Preconditions**: Org A (ID=1) and Org B (ID=2) exist
**Test Steps**:
1. Set A.parent_id = 2
2. Attempt to set B.parent_id = 1
3. Should detect cycle
**Expected Result**: Application prevents circular reference
**Priority**: Medium

#### TC-ORG-009: Organization with Maximum Hierarchy Depth
**Objective**: Test deep nesting (e.g., 10 levels)
**Preconditions**: None
**Test Steps**:
1. Create chain: HQ → Branch → Sub-branch → ... (10 levels)
2. Query with recursive CTE
3. Verify all levels retrieved
**Expected Result**: System handles deep hierarchies
**Priority**: Low

#### TC-ORG-010: Query Organizations by Level
**Objective**: Verify level indexing
**Preconditions**: Mixed level organizations
**Test Steps**:
1. Query WHERE level = 2
2. Verify only branches returned
3. Check index usage
**Expected Result**: Efficient level filtering
**Priority**: Low

#### TC-ORG-011: Update Organization Type Restriction
**Objective**: Verify type changes validated
**Preconditions**: Organization exists as BRANCH
**Test Steps**:
1. Attempt to change type to HQ (with existing HQ)
2. Should prevent multiple HQ
**Expected Result**: Business rule enforced
**Priority**: Medium

#### TC-ORG-012: Organization Code Format Validation
**Objective**: Verify code format constraints
**Preconditions**: None
**Test Steps**:
1. Insert with code containing special characters
2. Insert with code > 50 chars
3. Verify validation
**Expected Result**: Format rules enforced
**Priority**: Low

#### TC-ORG-013: Timestamp Accuracy
**Objective**: Verify created_at and updated_at work correctly
**Preconditions**: Organization exists
**Test Steps**:
1. Create org, verify created_at = NOW()
2. Wait 1 second
3. Update org, verify updated_at > created_at
**Expected Result**: Timestamps accurate
**Priority**: Low

#### TC-ORG-014: Delete Organization with Children
**Objective**: Verify cascade/restrict behavior
**Preconditions**: Parent org with children
**Test Steps**:
1. Attempt to delete parent
2. Verify foreign key constraint prevents deletion
**Expected Result**: Cannot delete parent with children
**Priority**: High

#### TC-ORG-015: Batch Create Organizations
**Objective**: Test bulk insert performance
**Preconditions**: None
**Test Steps**:
1. Insert 1000 organizations in transaction
2. Verify all created
3. Measure time
**Expected Result**: Batch insert < 5 seconds
**Priority**: Low

---

### 1.2 User Tests

#### TC-USER-001: Create User with Valid Role
**Objective**: Verify user creation with all required fields
**Preconditions**: Organization exists
**Test Steps**:
1. Insert user with valid organization_id, unique username/email
2. Verify password_hash stored
3. Verify role set correctly
**Expected Result**: User created successfully
**Priority**: Critical

#### TC-USER-002: Reject Duplicate Username
**Objective**: Verify username uniqueness
**Preconditions**: User 'admin' exists
**Test Steps**:
1. Attempt to create user with username='admin'
2. Capture error
**Expected Result**: Unique constraint violation on username
**Priority**: High

#### TC-USER-003: Reject Duplicate Email
**Objective**: Verify email uniqueness
**Preconditions**: User with email='test@postal.vn' exists
**Test Steps**:
1. Attempt to create user with same email
2. Capture error
**Expected Result**: Unique constraint violation on email
**Priority**: High

#### TC-USER-004: Validate Role Enum Values
**Objective**: Ensure only valid roles accepted
**Preconditions**: None
**Test Steps**:
1. Attempt to insert user with role='INVALID_ROLE'
2. Capture error
**Expected Result**: Enum constraint violation
**Priority**: Medium

#### TC-USER-005: Cascade on Organization Deletion
**Objective**: Verify behavior when organization deleted
**Preconditions**: Organization with users exists
**Test Steps**:
1. Attempt to delete organization
2. Verify constraint behavior
**Expected Result**: Should prevent deletion or handle gracefully
**Priority**: High

#### TC-USER-006: Update Last Login Timestamp
**Objective**: Verify last_login updates correctly
**Preconditions**: User exists
**Test Steps**:
1. Update last_login to current timestamp
2. Query user
3. Verify timestamp updated
**Expected Result**: Last login reflects new timestamp
**Priority**: Low

#### TC-USER-007: NULL Last Login for New User
**Objective**: Verify optional last_login handling
**Preconditions**: None
**Test Steps**:
1. Create new user
2. Verify last_login IS NULL
3. Query handles NULL correctly
**Expected Result**: NULL accepted and handled
**Priority**: Low

#### TC-USER-008: Deactivate User (is_active=FALSE)
**Objective**: Verify soft delete
**Preconditions**: Active user exists
**Test Steps**:
1. Set is_active=FALSE
2. Verify login should be prevented (app logic)
3. Verify historical data preserved
**Expected Result**: User deactivated, data intact
**Priority**: Medium

#### TC-USER-009: Reactivate User
**Objective**: Verify reactivation path
**Preconditions**: Inactive user exists
**Test Steps**:
1. Set is_active=TRUE
2. Verify user can login again
**Expected Result**: User reactivated successfully
**Priority**: Low

#### TC-USER-010: Username Case Sensitivity
**Objective**: Verify username uniqueness is case-insensitive
**Preconditions**: User 'admin' exists
**Test Steps**:
1. Attempt to create user 'Admin'
2. Should prevent (MySQL collation dependent)
**Expected Result**: Case-insensitive uniqueness
**Priority**: Medium

#### TC-USER-011: Email Case Sensitivity
**Objective**: Verify email uniqueness is case-insensitive
**Preconditions**: User with 'test@postal.vn'
**Test Steps**:
1. Attempt to create user with 'TEST@postal.vn'
2. Should prevent
**Expected Result**: Case-insensitive email uniqueness
**Priority**: Medium

#### TC-USER-012: Phone Number NULL Handling
**Objective**: Verify phone is optional
**Preconditions**: None
**Test Steps**:
1. Create user with phone=NULL
2. Verify accepted
**Expected Result**: NULL phone allowed
**Priority**: Low

#### TC-USER-013: Phone Number Format Validation
**Objective**: Ensure phone format consistent
**Preconditions**: None
**Test Steps**:
1. Insert with various formats (0901234567, +84901234567)
2. Verify storage format
**Expected Result**: Consistent format stored
**Priority**: Low

#### TC-USER-014: Password Hash Verification
**Objective**: Ensure password never stored as plaintext
**Preconditions**: None
**Test Steps**:
1. Create user with password
2. Verify password_hash contains bcrypt/argon2 hash
3. Verify length matches hash algorithm
**Expected Result**: Proper hash stored
**Priority**: Critical

#### TC-USER-015: All Role Enum Values
**Objective**: Test each role value
**Preconditions**: None
**Test Steps**:
1. Create user for each role: ADMIN, MANAGER, CLERK, WAREHOUSE, DISPATCHER, COURIER, ACCOUNTANT
2. Verify all accepted
**Expected Result**: All enum values work
**Priority**: Medium

#### TC-USER-016: Invalid Role Value
**Objective**: Verify enum constraint
**Preconditions**: None
**Test Steps**:
1. Attempt role='SUPERUSER'
2. Capture error
**Expected Result**: Enum constraint violation
**Priority**: Medium

#### TC-USER-017: Multiple Users Same Organization
**Objective**: Verify many-to-one relationship
**Preconditions**: Organization exists
**Test Steps**:
1. Create 100 users for same organization
2. Verify all created
3. Query users by organization
**Expected Result**: Multiple users per org allowed
**Priority**: Low

#### TC-USER-018: User Without Organization
**Objective**: Verify organization_id is required
**Preconditions**: None
**Test Steps**:
1. Attempt to create user with organization_id=NULL
2. Capture error
**Expected Result**: NOT NULL constraint violation
**Priority**: High

#### TC-USER-019: Delete Organization with Users
**Objective**: Verify foreign key prevents orphan users
**Preconditions**: Organization with users
**Test Steps**:
1. Attempt to delete organization
2. Verify prevented
**Expected Result**: Foreign key constraint violation
**Priority**: High

#### TC-USER-020: Query Users by Role and Organization
**Objective**: Verify compound query performance
**Preconditions**: Large user dataset
**Test Steps**:
1. Query WHERE role='COURIER' AND organization_id=3
2. Verify correct results
3. Check index usage
**Expected Result**: Efficient compound query
**Priority**: Medium

#### TC-USER-021: Update User Email to Existing Email
**Objective**: Verify unique constraint on update
**Preconditions**: Two users exist
**Test Steps**:
1. Update user A's email to user B's email
2. Capture error
**Expected Result**: Unique constraint violation
**Priority**: High

#### TC-USER-022: Update User Organization
**Objective**: Verify organization transfer
**Preconditions**: User in org A, org B exists
**Test Steps**:
1. Update user.organization_id from A to B
2. Verify foreign key validated
3. Verify successful transfer
**Expected Result**: User transferred to new org
**Priority**: Medium

#### TC-USER-023: Concurrent User Creation with Same Username
**Objective**: Test race condition handling
**Preconditions**: None
**Test Steps**:
1. Simultaneously create two users with same username
2. Verify only one succeeds
3. Other gets unique constraint error
**Expected Result**: Proper concurrency control
**Priority**: High

#### TC-USER-024: Empty String vs NULL in Optional Fields
**Objective**: Verify empty string handling
**Preconditions**: None
**Test Steps**:
1. Create user with phone=''
2. Create user with phone=NULL
3. Verify both accepted but stored differently
**Expected Result**: Both NULL and empty string handled
**Priority**: Low

#### TC-USER-025: Maximum Field Length - Username
**Objective**: Verify varchar(100) limit
**Preconditions**: None
**Test Steps**:
1. Insert username with 100 chars (should work)
2. Insert username with 101 chars (should fail)
**Expected Result**: Length constraint enforced
**Priority**: Low

#### TC-USER-026: Maximum Field Length - Email
**Objective**: Verify varchar(255) limit
**Preconditions**: None
**Test Steps**:
1. Insert email with 255 chars (should work)
2. Insert email with 256 chars (should fail)
**Expected Result**: Length constraint enforced
**Priority**: Low

#### TC-USER-027: UTF-8 Characters in Full Name
**Objective**: Verify Vietnamese character support
**Preconditions**: None
**Test Steps**:
1. Insert user with full_name='Nguyễn Văn Đức'
2. Query and verify correct storage
3. Verify no character corruption
**Expected Result**: UTF-8 stored correctly
**Priority**: Medium

#### TC-USER-028: Special Characters in Username
**Objective**: Verify username validation
**Preconditions**: None
**Test Steps**:
1. Attempt username with spaces, @, #, etc.
2. Verify application validation
**Expected Result**: Only alphanumeric and allowed chars
**Priority**: Low

#### TC-USER-029: Query Inactive Users
**Objective**: Verify filtering by is_active
**Preconditions**: Mix of active and inactive users
**Test Steps**:
1. Query WHERE is_active=FALSE
2. Verify only inactive returned
**Expected Result**: Correct filtering
**Priority**: Low

#### TC-USER-030: Bulk Update User Status
**Objective**: Test batch deactivation
**Preconditions**: Multiple active users
**Test Steps**:
1. UPDATE users SET is_active=FALSE WHERE organization_id=X
2. Verify all updated
3. Measure performance
**Expected Result**: Efficient bulk update
**Priority**: Low

---

## 2. CUSTOMER MANAGEMENT

### 2.1 Customer Tests

#### TC-CUST-001: Create Individual Customer
**Objective**: Verify individual customer creation
**Preconditions**: None
**Test Steps**:
1. Insert customer with type='INDIVIDUAL'
2. Verify code auto-generated/unique
3. Verify phone format validated
**Expected Result**: Customer created successfully
**Priority**: Critical

#### TC-CUST-002: Create SME Customer with Company
**Objective**: Verify SME customer with company name
**Preconditions**: None
**Test Steps**:
1. Insert customer with type='SME', company_name provided
2. Verify both full_name and company_name stored
**Expected Result**: SME customer created with company info
**Priority**: High

#### TC-CUST-003: Unique Customer Code
**Objective**: Verify code uniqueness
**Preconditions**: Customer with specific code exists
**Test Steps**:
1. Attempt duplicate code
2. Capture error
**Expected Result**: Unique constraint violation
**Priority**: Medium

#### TC-CUST-004: Phone Number Validation
**Objective**: Ensure phone format is correct
**Preconditions**: None
**Test Steps**:
1. Insert customer with invalid phone (e.g., letters)
2. Verify validation
**Expected Result**: Accept valid format, reject invalid
**Priority**: Medium

#### TC-CUST-005: Search by Phone Number
**Objective**: Verify phone index performance
**Preconditions**: 10,000+ customers exist
**Test Steps**:
1. Query customer by phone
2. Measure execution time
**Expected Result**: Query completes in <50ms using index
**Priority**: Medium

#### TC-CUST-006: NULL Company Name for Individual
**Objective**: Verify optional company_name
**Preconditions**: None
**Test Steps**:
1. Create INDIVIDUAL customer with company_name=NULL
2. Verify accepted
**Expected Result**: NULL company name allowed for individuals
**Priority**: Low

#### TC-CUST-007: Required Company Name for Enterprise
**Objective**: Verify business rule
**Preconditions**: None
**Test Steps**:
1. Create ENTERPRISE customer with company_name=NULL
2. Should be validated by application
**Expected Result**: App enforces company name for enterprise
**Priority**: Medium

#### TC-CUST-008: Email Format Validation
**Objective**: Verify email format
**Preconditions**: None
**Test Steps**:
1. Insert with invalid email format
2. Verify validation (app or DB constraint)
**Expected Result**: Invalid format rejected
**Priority**: Low

#### TC-CUST-009: NULL Email Allowed
**Objective**: Verify optional email
**Preconditions**: None
**Test Steps**:
1. Create customer with email=NULL
2. Verify accepted
**Expected Result**: NULL email allowed
**Priority**: Low

#### TC-CUST-010: Duplicate Phone Numbers Allowed
**Objective**: Verify phone uniqueness not required
**Preconditions**: Customer with phone='0901234567'
**Test Steps**:
1. Create another customer with same phone
2. Verify allowed (multiple people can share number)
**Expected Result**: Duplicate phones allowed
**Priority**: Medium

#### TC-CUST-011: Search by Email
**Objective**: Verify email search
**Preconditions**: Customers with emails exist
**Test Steps**:
1. Query WHERE email='test@example.com'
2. Verify results
**Expected Result**: Correct customer returned
**Priority**: Low

#### TC-CUST-012: Partial Phone Search
**Objective**: Verify wildcard phone search
**Preconditions**: Multiple customers
**Test Steps**:
1. Query WHERE phone LIKE '090%'
2. Verify all matching returned
**Expected Result**: Wildcard search works
**Priority**: Medium

#### TC-CUST-013: Customer Type Distribution Query
**Objective**: Verify grouping and aggregation
**Preconditions**: Mix of customer types
**Test Steps**:
1. SELECT type, COUNT(*) FROM customers GROUP BY type
2. Verify counts accurate
**Expected Result**: Correct distribution
**Priority**: Low

#### TC-CUST-014: Address Components All NULL
**Objective**: Verify all address fields optional
**Preconditions**: None
**Test Steps**:
1. Create customer with address, province, district, ward all NULL
2. Verify accepted
**Expected Result**: All address fields optional
**Priority**: Low

#### TC-CUST-015: Deactivate Customer
**Objective**: Verify soft delete
**Preconditions**: Active customer with orders
**Test Steps**:
1. Set is_active=FALSE
2. Verify orders still linked
3. Verify customer hidden in active lists
**Expected Result**: Soft delete preserves data
**Priority**: Medium

#### TC-CUST-016: Reactivate Customer
**Objective**: Verify reactivation
**Preconditions**: Inactive customer
**Test Steps**:
1. Set is_active=TRUE
2. Verify customer appears in active lists
**Expected Result**: Reactivation successful
**Priority**: Low

#### TC-CUST-017: Customer Created By Reference
**Objective**: Verify created_by foreign key
**Preconditions**: User exists
**Test Steps**:
1. Create customer with created_by=user_id
2. Verify link maintained
3. Query customer with creator info
**Expected Result**: Created by tracked correctly
**Priority**: Low

#### TC-CUST-018: Customer Code Format
**Objective**: Verify code format consistency
**Preconditions**: None
**Test Steps**:
1. Generate codes for different types
2. Verify format pattern (e.g., CUS-YYYYMMDD-XXX)
**Expected Result**: Consistent code format
**Priority**: Low

#### TC-CUST-019: Bulk Customer Import
**Objective**: Test batch insert
**Preconditions**: None
**Test Steps**:
1. Insert 10,000 customers in transaction
2. Verify all created
3. Measure time
**Expected Result**: Batch insert < 10 seconds
**Priority**: Low

#### TC-CUST-020: Customer with Maximum Field Lengths
**Objective**: Boundary test for varchar fields
**Preconditions**: None
**Test Steps**:
1. Create customer with full_name at 255 char limit
2. Create with company_name at 255 char limit
3. Verify all stored correctly
**Expected Result**: Maximum lengths handled
**Priority**: Low

#### TC-CUST-021: UTF-8 in All Text Fields
**Objective**: Verify Vietnamese support throughout
**Preconditions**: None
**Test Steps**:
1. Create customer with Vietnamese in all text fields
2. Query and verify no corruption
**Expected Result**: Full UTF-8 support
**Priority**: Medium

#### TC-CUST-022: Query by Province
**Objective**: Verify geographic filtering
**Preconditions**: Customers in multiple provinces
**Test Steps**:
1. Query WHERE province='TP. Hồ Chí Minh'
2. Verify correct results
**Expected Result**: Province filtering works
**Priority**: Medium

#### TC-CUST-023: Query by District within Province
**Objective**: Verify compound geographic filter
**Preconditions**: Customers in multiple districts
**Test Steps**:
1. Query WHERE province='X' AND district='Y'
2. Verify correct results
**Expected Result**: Compound filter works
**Priority**: Low

#### TC-CUST-024: Customer Order Count Join
**Objective**: Verify join performance
**Preconditions**: Customers with varying order counts
**Test Steps**:
1. Query customers with order count: SELECT c.*, COUNT(o.id) FROM customers c LEFT JOIN orders o GROUP BY c.id
2. Verify counts accurate
3. Check performance
**Expected Result**: Join query efficient
**Priority**: Medium

#### TC-CUST-025: Delete Customer with Orders
**Objective**: Verify referential integrity
**Preconditions**: Customer with orders
**Test Steps**:
1. Attempt DELETE FROM customers WHERE id=X
2. Verify prevented by foreign key
**Expected Result**: Cannot delete customer with orders
**Priority**: High

---

## 3. PRICING & SERVICE MANAGEMENT

### 3.1 Service Type Tests

#### TC-SVC-001: Create Service Type
**Objective**: Verify service type creation
**Preconditions**: None
**Test Steps**:
1. Insert service type with unique code
2. Verify estimated_delivery_days > 0
3. Verify priority level set
**Expected Result**: Service type created
**Priority**: High

#### TC-SVC-002: Unique Service Code
**Objective**: Verify code uniqueness
**Preconditions**: Service 'EXPRESS' exists
**Test Steps**:
1. Attempt duplicate code
2. Capture error
**Expected Result**: Unique constraint violation
**Priority**: Medium

---

### 3.2 Pricing Tests

#### TC-PRICE-001: Create Pricing Rule
**Objective**: Verify pricing entry creation
**Preconditions**: Service type exists
**Test Steps**:
1. Insert pricing with weight range
2. Verify base_price and per_kg_price > 0
3. Verify date range valid
**Expected Result**: Pricing rule created
**Priority**: Critical

#### TC-PRICE-002: Non-Overlapping Weight Ranges
**Objective**: Ensure weight ranges don't overlap for same service/date
**Preconditions**: Pricing for 0-1kg exists
**Test Steps**:
1. Insert pricing for 0.5-2kg (overlaps)
2. Should allow (handled by business logic)
**Expected Result**: System should handle overlap logically
**Priority**: Medium

#### TC-PRICE-003: Version History Integrity
**Objective**: Verify old versions preserved when new version created
**Preconditions**: Pricing v1.0 exists
**Test Steps**:
1. Insert pricing v1.1 with effective_from = future date
2. Query active pricing for current date
3. Verify v1.0 still returned
**Expected Result**: Historical versions intact, correct version returned
**Priority**: High

#### TC-PRICE-004: Calculate Price for Given Weight
**Objective**: Verify pricing calculation logic
**Preconditions**: Pricing rules exist
**Test Steps**:
1. Calculate price for 2.5kg EXPRESS
2. Apply formula: base_price + (weight * per_kg_price)
3. Verify result matches expected
**Expected Result**: Correct price calculated
**Priority**: Critical

---

## 4. ORDER MANAGEMENT

### 4.1 Order Creation Tests

#### TC-ORD-001: Create Basic Order
**Objective**: Verify order creation with all required fields
**Preconditions**: Customer, service type, organization exist
**Test Steps**:
1. Call sp_create_order with valid parameters
2. Verify tracking number generated (format: VN + date + sequence + VN)
3. Verify order record created
4. Verify initial status = 'PENDING'
5. Verify status history entry created
**Expected Result**: Order created with valid tracking number
**Priority**: Critical

#### TC-ORD-002: Unique Tracking Number
**Objective**: Verify tracking number uniqueness
**Preconditions**: None
**Test Steps**:
1. Create 1000 orders in same day
2. Verify all tracking numbers unique
3. Verify sequential numbering
**Expected Result**: All tracking numbers unique and sequential
**Priority**: Critical

#### TC-ORD-003: Calculate Chargeable Weight
**Objective**: Verify volumetric weight calculation
**Preconditions**: None
**Test Steps**:
1. Create order with actual_weight=1kg, dimensions resulting in volumetric=1.5kg
2. Verify chargeable_weight = MAX(actual, volumetric) = 1.5kg
**Expected Result**: Higher weight used for charging
**Priority**: High

#### TC-ORD-004: Foreign Key Validation - Customer
**Objective**: Verify customer must exist
**Preconditions**: None
**Test Steps**:
1. Attempt to create order with customer_id=9999 (non-existent)
2. Capture error
**Expected Result**: Foreign key constraint violation
**Priority**: High

#### TC-ORD-005: Foreign Key Validation - Service Type
**Objective**: Verify service type must exist
**Preconditions**: None
**Test Steps**:
1. Attempt to create order with invalid service_type_id
2. Capture error
**Expected Result**: Foreign key constraint violation
**Priority**: High

#### TC-ORD-006: COD Amount Validation
**Objective**: Verify COD amount >= 0
**Preconditions**: None
**Test Steps**:
1. Attempt to create order with negative COD
2. Should reject or set to 0
**Expected Result**: Negative values prevented
**Priority**: Medium

#### TC-ORD-007: Phone Number Format Validation
**Objective**: Ensure sender/receiver phone valid
**Preconditions**: None
**Test Steps**:
1. Create order with invalid phone format
2. Verify validation
**Expected Result**: Only valid formats accepted
**Priority**: Medium

#### TC-ORD-008: Mandatory Address Fields
**Objective**: Verify receiver province/district required
**Preconditions**: None
**Test Steps**:
1. Attempt order without receiver_province
2. Capture error
**Expected Result**: NOT NULL constraint violation
**Priority**: High

#### TC-ORD-009: NULL Destination Office Initially
**Objective**: Verify destination_office_id can be NULL initially
**Preconditions**: None
**Test Steps**:
1. Create order with destination_office_id=NULL
2. Verify accepted (determined during routing)
**Expected Result**: NULL destination allowed initially
**Priority**: Medium

#### TC-ORD-010: Zero COD Amount
**Objective**: Verify COD can be 0 for non-COD orders
**Preconditions**: None
**Test Steps**:
1. Create order with cod_amount=0
2. Verify accepted
**Expected Result**: Zero COD allowed
**Priority**: Low

#### TC-ORD-011: Negative COD Amount Rejected
**Objective**: Verify business validation
**Preconditions**: None
**Test Steps**:
1. Attempt order with cod_amount=-100
2. Should be rejected by app or CHECK constraint
**Expected Result**: Negative COD prevented
**Priority**: High

#### TC-ORD-012: Negative Weight Rejected
**Objective**: Verify weight validation
**Preconditions**: None
**Test Steps**:
1. Attempt order with actual_weight=-1
2. Should be rejected
**Expected Result**: Negative weight prevented
**Priority**: High

#### TC-ORD-013: Zero Weight Order
**Objective**: Verify minimum weight handling
**Preconditions**: None
**Test Steps**:
1. Create order with actual_weight=0
2. Should use minimum weight for pricing (e.g., 0.1kg)
**Expected Result**: Zero weight handled by business logic
**Priority**: Medium

#### TC-ORD-014: Maximum Weight Order
**Objective**: Verify upper limit handling
**Preconditions**: None
**Test Steps**:
1. Create order with actual_weight=1000kg
2. Verify accepted or limit enforced
**Expected Result**: System handles large weights
**Priority**: Low

#### TC-ORD-015: Volumetric Weight Greater than Actual
**Objective**: Verify chargeable weight calculation
**Preconditions**: None
**Test Steps**:
1. Create order with actual=2kg, volumetric=3kg
2. Verify chargeable_weight=3kg (MAX function)
3. Verify pricing uses chargeable weight
**Expected Result**: Higher weight used
**Priority**: Critical

#### TC-ORD-016: Actual Weight Greater than Volumetric
**Objective**: Verify reverse calculation
**Preconditions**: None
**Test Steps**:
1. Create order with actual=5kg, volumetric=2kg
2. Verify chargeable_weight=5kg
**Expected Result**: Higher weight used
**Priority**: Critical

#### TC-ORD-017: Zero Declared Value
**Objective**: Verify optional insurance
**Preconditions**: None
**Test Steps**:
1. Create order with declared_value=0
2. Verify insurance_fee=0
**Expected Result**: No insurance for zero value
**Priority**: Medium

#### TC-ORD-018: High Declared Value
**Objective**: Verify insurance calculation
**Preconditions**: None
**Test Steps**:
1. Create order with declared_value=50,000,000
2. Verify insurance_fee calculated (e.g., 0.5% of value)
**Expected Result**: Insurance fee calculated correctly
**Priority**: Medium

#### TC-ORD-019: Total Fee Calculation
**Objective**: Verify sum of all fees
**Preconditions**: None
**Test Steps**:
1. Create order with base_fee=50000, insurance_fee=5000, cod_fee=2000
2. Verify total_fee=57000
**Expected Result**: Accurate total calculation
**Priority**: Critical

#### TC-ORD-020: Estimated Delivery Calculation
**Objective**: Verify delivery date prediction
**Preconditions**: Service with estimated_delivery_days=3
**Test Steps**:
1. Create order on Monday
2. Verify estimated_delivery = Thursday (Monday + 3 days)
3. Consider weekends/holidays
**Expected Result**: Accurate delivery estimate
**Priority**: High

#### TC-ORD-021: Same Sender and Receiver
**Objective**: Verify self-shipment allowed
**Preconditions**: None
**Test Steps**:
1. Create order with sender_phone = receiver_phone
2. Verify accepted (valid use case)
**Expected Result**: Self-shipment allowed
**Priority**: Low

#### TC-ORD-022: International Phone Numbers
**Objective**: Verify +84 format handling
**Preconditions**: None
**Test Steps**:
1. Create order with receiver_phone='+84901234567'
2. Verify stored and searchable
**Expected Result**: International format supported
**Priority**: Low

#### TC-ORD-023: Very Long Address
**Objective**: Verify TEXT field handling
**Preconditions**: None
**Test Steps**:
1. Create order with 1000 character address
2. Verify stored completely
**Expected Result**: Long addresses handled
**Priority**: Low

#### TC-ORD-024: UTF-8 in Address Fields
**Objective**: Verify Vietnamese address support
**Preconditions**: None
**Test Steps**:
1. Create order with full Vietnamese address
2. Query and verify no corruption
**Expected Result**: UTF-8 addresses work
**Priority**: Medium

#### TC-ORD-025: NULL Notes Field
**Objective**: Verify optional notes
**Preconditions**: None
**Test Steps**:
1. Create order with notes=NULL
2. Verify accepted
**Expected Result**: NULL notes allowed
**Priority**: Low

#### TC-ORD-026: Empty String Notes
**Objective**: Verify empty string handling
**Preconditions**: None
**Test Steps**:
1. Create order with notes=''
2. Verify stored as empty string or converted to NULL
**Expected Result**: Empty string handled
**Priority**: Low

#### TC-ORD-027: Special Characters in Notes
**Objective**: Verify unrestricted text input
**Preconditions**: None
**Test Steps**:
1. Create order with notes containing @#$%^&*()
2. Verify stored correctly
**Expected Result**: Special characters allowed
**Priority**: Low

#### TC-ORD-028: NULL Ward Field
**Objective**: Verify optional ward
**Preconditions**: None
**Test Steps**:
1. Create order with receiver_ward=NULL
2. Verify accepted (ward may be unknown)
**Expected Result**: NULL ward allowed
**Priority**: Low

#### TC-ORD-029: Created By Reference
**Objective**: Verify audit trail
**Preconditions**: User exists
**Test Steps**:
1. Create order with created_by=user_id
2. Query order with creator info JOIN
3. Verify link maintained
**Expected Result**: Creator tracked
**Priority**: Medium

#### TC-ORD-030: Order Without Created By
**Objective**: Verify required audit field
**Preconditions**: None
**Test Steps**:
1. Attempt order with created_by=NULL
2. Capture error
**Expected Result**: NOT NULL constraint violation
**Priority**: High

#### TC-ORD-031: Concurrent Order Creation - Same Second
**Objective**: Test tracking number uniqueness under load
**Preconditions**: None
**Test Steps**:
1. Create 100 orders simultaneously
2. Verify all have unique tracking numbers
3. Verify sequential numbering preserved
**Expected Result**: No duplicate tracking numbers
**Priority**: Critical

#### TC-ORD-032: Orders Across Midnight
**Objective**: Verify date-based sequence reset
**Preconditions**: Last order at 23:59:59
**Test Steps**:
1. Create order at 00:00:01 next day
2. Verify sequence resets to 000001
3. Verify date portion updated
**Expected Result**: Daily sequence reset works
**Priority**: High

#### TC-ORD-033: Maximum Orders Per Day
**Objective**: Test sequence limit
**Preconditions**: None
**Test Steps**:
1. Create 999,999 orders in one day
2. Attempt 1,000,000th order
3. Verify sequence overflow handling
**Expected Result**: System handles limit gracefully
**Priority**: Low

#### TC-ORD-034: Query Orders by Date Range
**Objective**: Verify date indexing
**Preconditions**: Orders across multiple dates
**Test Steps**:
1. Query WHERE created_at BETWEEN '2025-01-01' AND '2025-01-31'
2. Verify correct results
3. Check index usage
**Expected Result**: Efficient date range query
**Priority**: High

#### TC-ORD-035: Query Orders by Customer
**Objective**: Verify customer_id index
**Preconditions**: Customer with 100+ orders
**Test Steps**:
1. Query WHERE customer_id=X
2. Measure performance
3. Check index usage
**Expected Result**: Fast customer order lookup
**Priority**: High

#### TC-ORD-036: Query Orders by Status
**Objective**: Verify status index
**Preconditions**: Mix of order statuses
**Test Steps**:
1. Query WHERE status='PENDING'
2. Verify only pending orders
3. Check index usage
**Expected Result**: Efficient status filtering
**Priority**: High

#### TC-ORD-037: Query Orders by Service Type
**Objective**: Verify service filtering
**Preconditions**: Mix of service types
**Test Steps**:
1. Query WHERE service_type_id=1
2. Verify correct results
**Expected Result**: Service type filtering works
**Priority**: Medium

#### TC-ORD-038: Query Orders by Origin Office
**Objective**: Verify office-based filtering
**Preconditions**: Multiple offices with orders
**Test Steps**:
1. Query WHERE origin_office_id=X
2. Verify only that office's orders
**Expected Result**: Office filtering works
**Priority**: High

#### TC-ORD-039: Query Orders by Receiver Province
**Objective**: Verify geographic filtering
**Preconditions**: Orders to multiple provinces
**Test Steps**:
1. Query WHERE receiver_province='TP. Hồ Chí Minh'
2. Verify correct results
3. Check if index needed
**Expected Result**: Geographic filtering works
**Priority**: Medium

#### TC-ORD-040: Query Orders by Receiver Phone
**Objective**: Verify phone lookup
**Preconditions**: Multiple orders
**Test Steps**:
1. Query WHERE receiver_phone='0901234567'
2. Verify all orders to that phone
3. Check index usage
**Expected Result**: Phone lookup efficient
**Priority**: High

#### TC-ORD-041: Compound Query - Status and Date
**Objective**: Verify multi-column index usage
**Preconditions**: Large order dataset
**Test Steps**:
1. Query WHERE status='PENDING' AND created_at > '2025-01-01'
2. Verify results and performance
3. Check explain plan
**Expected Result**: Compound index used
**Priority**: Medium

#### TC-ORD-042: Order Count by Status
**Objective**: Verify aggregation query
**Preconditions**: Mix of statuses
**Test Steps**:
1. SELECT status, COUNT(*) FROM orders GROUP BY status
2. Verify accurate counts
**Expected Result**: Correct aggregation
**Priority**: Low

#### TC-ORD-043: Total Revenue by Date
**Objective**: Verify SUM aggregation
**Preconditions**: Orders with fees
**Test Steps**:
1. SELECT DATE(created_at), SUM(total_fee) FROM orders GROUP BY DATE(created_at)
2. Verify accurate totals
**Expected Result**: Revenue calculation correct
**Priority**: Medium

#### TC-ORD-044: Average Weight by Service Type
**Objective**: Verify AVG aggregation
**Preconditions**: Orders with weights
**Test Steps**:
1. SELECT service_type_id, AVG(chargeable_weight) FROM orders GROUP BY service_type_id
2. Verify accurate averages
**Expected Result**: Average calculation correct
**Priority**: Low

#### TC-ORD-045: Update Order Status Only
**Objective**: Verify partial update
**Preconditions**: Order exists
**Test Steps**:
1. UPDATE orders SET status='PICKED_UP' WHERE id=X
2. Verify only status changed
3. Verify updated_at changed
**Expected Result**: Partial update works
**Priority**: Medium

#### TC-ORD-046: Update Order Multiple Fields
**Objective**: Verify bulk update
**Preconditions**: Order exists
**Test Steps**:
1. UPDATE orders SET status='DELIVERED', actual_delivery=NOW() WHERE id=X
2. Verify both fields updated
**Expected Result**: Multiple field update works
**Priority**: Medium

#### TC-ORD-047: Cannot Update Tracking Number
**Objective**: Verify immutable field (business logic)
**Preconditions**: Order exists
**Test Steps**:
1. Attempt UPDATE orders SET tracking_number='NEW' WHERE id=X
2. Should be prevented by application
**Expected Result**: Tracking number immutable
**Priority**: High

#### TC-ORD-048: Cannot Change Customer After Creation
**Objective**: Verify immutable customer reference
**Preconditions**: Order exists
**Test Steps**:
1. Attempt UPDATE orders SET customer_id=Y WHERE id=X
2. Should be prevented by application
**Expected Result**: Customer immutable
**Priority**: High

#### TC-ORD-049: Delete Order
**Objective**: Verify deletion and cascades
**Preconditions**: Order with status history
**Test Steps**:
1. DELETE FROM orders WHERE id=X
2. Verify order deleted
3. Verify status history cascade deleted
**Expected Result**: Deletion cascades correctly
**Priority**: Medium

#### TC-ORD-050: Cannot Delete Delivered Order
**Objective**: Verify business rule
**Preconditions**: Order with status='DELIVERED'
**Test Steps**:
1. Attempt DELETE FROM orders WHERE id=X
2. Should be prevented by application
**Expected Result**: Delivered orders protected
**Priority**: High

---

### 4.2 Order Status Tests

#### TC-ORD-STATUS-001: Update Order Status
**Objective**: Verify status transition and history logging
**Preconditions**: Order in PENDING status
**Test Steps**:
1. Update order status to PICKED_UP
2. Verify order.status updated
3. Verify new entry in order_status_history
4. Verify timestamp and user logged
**Expected Result**: Status updated, history preserved
**Priority**: Critical

#### TC-ORD-STATUS-002: Status Enum Validation
**Objective**: Ensure only valid statuses accepted
**Preconditions**: Order exists
**Test Steps**:
1. Attempt to set status to 'INVALID_STATUS'
2. Capture error
**Expected Result**: Enum constraint violation
**Priority**: Medium

#### TC-ORD-STATUS-003: Status History Cascade Delete
**Objective**: Verify history deleted when order deleted
**Preconditions**: Order with multiple status entries
**Test Steps**:
1. Delete order
2. Verify all status history entries deleted
**Expected Result**: Cascade delete works correctly
**Priority**: Medium

#### TC-ORD-STATUS-004: GPS Coordinates Storage
**Objective**: Verify location data stored with status
**Preconditions**: Order exists
**Test Steps**:
1. Add status with latitude=10.762622, longitude=106.660172
2. Query and verify coordinates
**Expected Result**: GPS data stored accurately
**Priority**: Low

#### TC-ORD-STATUS-005: NULL GPS Coordinates
**Objective**: Verify optional GPS data
**Preconditions**: Order exists
**Test Steps**:
1. Add status without GPS coordinates (NULL)
2. Verify accepted
**Expected Result**: NULL coordinates allowed
**Priority**: Low

#### TC-ORD-STATUS-006: Status Transition - PENDING to PICKED_UP
**Objective**: Verify valid transition
**Preconditions**: Order in PENDING
**Test Steps**:
1. Update status to PICKED_UP
2. Verify transition allowed
3. Verify history logged
**Expected Result**: Valid transition succeeds
**Priority**: High

#### TC-ORD-STATUS-007: Status Transition - PICKED_UP to IN_TRANSIT
**Objective**: Verify valid transition
**Preconditions**: Order in PICKED_UP
**Test Steps**:
1. Update status to IN_TRANSIT
2. Verify transition allowed
**Expected Result**: Valid transition succeeds
**Priority**: High

#### TC-ORD-STATUS-008: Status Transition - IN_TRANSIT to OUT_FOR_DELIVERY
**Objective**: Verify valid transition
**Preconditions**: Order in IN_TRANSIT
**Test Steps**:
1. Update status to OUT_FOR_DELIVERY
2. Verify transition allowed
**Expected Result**: Valid transition succeeds
**Priority**: High

#### TC-ORD-STATUS-009: Status Transition - OUT_FOR_DELIVERY to DELIVERED
**Objective**: Verify final transition
**Preconditions**: Order in OUT_FOR_DELIVERY
**Test Steps**:
1. Update status to DELIVERED
2. Set actual_delivery timestamp
3. Verify transition allowed
**Expected Result**: Delivery recorded
**Priority**: Critical

#### TC-ORD-STATUS-010: Status Transition - OUT_FOR_DELIVERY to FAILED
**Objective**: Verify failure path
**Preconditions**: Order in OUT_FOR_DELIVERY
**Test Steps**:
1. Update status to FAILED
2. Verify transition allowed
**Expected Result**: Failure recorded
**Priority**: High

#### TC-ORD-STATUS-011: Status Transition - FAILED to OUT_FOR_DELIVERY
**Objective**: Verify retry path
**Preconditions**: Order in FAILED
**Test Steps**:
1. Update status back to OUT_FOR_DELIVERY (retry)
2. Verify transition allowed
**Expected Result**: Retry allowed
**Priority**: High

#### TC-ORD-STATUS-012: Status Transition - DELIVERED to RETURNED
**Objective**: Verify return path
**Preconditions**: Order in DELIVERED
**Test Steps**:
1. Update status to RETURNED
2. Verify transition allowed (return requested)
**Expected Result**: Return initiated
**Priority**: Medium

#### TC-ORD-STATUS-013: Status Transition - Any to CANCELLED
**Objective**: Verify cancellation from any status
**Preconditions**: Order in any non-final status
**Test Steps**:
1. Update status to CANCELLED
2. Verify always allowed (before delivery)
**Expected Result**: Cancellation allowed
**Priority**: High

#### TC-ORD-STATUS-014: Invalid Transition - DELIVERED to PENDING
**Objective**: Verify business rule enforcement
**Preconditions**: Order in DELIVERED
**Test Steps**:
1. Attempt to set status back to PENDING
2. Should be prevented by application
**Expected Result**: Invalid transition blocked
**Priority**: High

#### TC-ORD-STATUS-015: Invalid Transition - CANCELLED to PICKED_UP
**Objective**: Verify cancelled orders can't resume
**Preconditions**: Order in CANCELLED
**Test Steps**:
1. Attempt status change to PICKED_UP
2. Should be prevented
**Expected Result**: Cancelled orders frozen
**Priority**: High

#### TC-ORD-STATUS-016: Status History Order Verification
**Objective**: Verify chronological order
**Preconditions**: Order with multiple status changes
**Test Steps**:
1. Query status history ORDER BY created_at
2. Verify chronological sequence makes sense
**Expected Result**: History in correct order
**Priority**: Medium

#### TC-ORD-STATUS-017: Status History Count
**Objective**: Verify all transitions logged
**Preconditions**: Order went through 5 statuses
**Test Steps**:
1. Count status history entries
2. Verify count = 5
**Expected Result**: All transitions logged
**Priority**: Medium

#### TC-ORD-STATUS-018: Same Status Twice
**Objective**: Verify duplicate status logging
**Preconditions**: Order in FAILED
**Test Steps**:
1. Set status to FAILED again (with different notes)
2. Verify second entry created
**Expected Result**: Duplicate status allowed (different attempt)
**Priority**: Low

#### TC-ORD-STATUS-019: Bulk Status Update
**Objective**: Test batch update performance
**Preconditions**: 1000 orders in PENDING
**Test Steps**:
1. UPDATE orders SET status='PICKED_UP' WHERE status='PENDING'
2. Verify all updated
3. Verify 1000 history entries created
4. Measure performance
**Expected Result**: Efficient bulk update
**Priority**: Medium

#### TC-ORD-STATUS-020: Status Location Validation
**Objective**: Verify location field format
**Preconditions**: Order exists
**Test Steps**:
1. Add status with location='Bưu cục Quận 1'
2. Add status with location=NULL
3. Verify both accepted
**Expected Result**: Location flexible format
**Priority**: Low

#### TC-ORD-STATUS-021: Status Organization Reference
**Objective**: Verify organization tracking
**Preconditions**: Order exists
**Test Steps**:
1. Add status with organization_id
2. Verify foreign key validated
3. Query status with organization JOIN
**Expected Result**: Organization tracked per status
**Priority**: Medium

#### TC-ORD-STATUS-022: Status Notes Character Limit
**Objective**: Verify TEXT field capacity
**Preconditions**: Order exists
**Test Steps**:
1. Add status with 5000 character notes
2. Verify stored completely
**Expected Result**: Large notes supported
**Priority**: Low

#### TC-ORD-STATUS-023: Status Created By Tracking
**Objective**: Verify user audit trail
**Preconditions**: Order and user exist
**Test Steps**:
1. Add status with created_by=user_id
2. Query status with user JOIN
3. Verify who changed status
**Expected Result**: User tracked per status change
**Priority**: Medium

#### TC-ORD-STATUS-024: NULL Created By
**Objective**: Verify optional user tracking
**Preconditions**: Order exists
**Test Steps**:
1. Add status with created_by=NULL (system update)
2. Verify accepted
**Expected Result**: NULL created_by allowed (automated)
**Priority**: Low

#### TC-ORD-STATUS-025: Query All Status Changes for Order
**Objective**: Verify timeline reconstruction
**Preconditions**: Order with full lifecycle
**Test Steps**:
1. Query order_status_history WHERE order_id=X ORDER BY created_at
2. Reconstruct complete timeline
**Expected Result**: Complete history available
**Priority**: High

#### TC-ORD-STATUS-026: Query Orders in Specific Status
**Objective**: Verify current status filtering
**Preconditions**: Mix of statuses
**Test Steps**:
1. Query orders WHERE status='OUT_FOR_DELIVERY'
2. Verify only current OUT_FOR_DELIVERY orders
**Expected Result**: Current status query accurate
**Priority**: High

#### TC-ORD-STATUS-027: Query Status Changes by User
**Objective**: Verify user activity tracking
**Preconditions**: User performed multiple updates
**Test Steps**:
1. Query order_status_history WHERE created_by=user_id
2. Verify user's status change history
**Expected Result**: User activity tracked
**Priority**: Low

#### TC-ORD-STATUS-028: Query Status Changes by Date
**Objective**: Verify temporal filtering
**Preconditions**: Status changes across multiple days
**Test Steps**:
1. Query WHERE DATE(created_at)='2025-01-15'
2. Verify all changes on that date
**Expected Result**: Date filtering works
**Priority**: Low

#### TC-ORD-STATUS-029: Delete Status History Entry
**Objective**: Verify history immutability
**Preconditions**: Status history entry exists
**Test Steps**:
1. Attempt to DELETE FROM order_status_history WHERE id=X
2. Should be prevented (audit trail)
**Expected Result**: History deletion blocked by app
**Priority**: High

#### TC-ORD-STATUS-030: Update Status History Entry
**Objective**: Verify history immutability
**Preconditions**: Status history entry exists
**Test Steps**:
1. Attempt to UPDATE order_status_history SET status='X' WHERE id=Y
2. Should be prevented (audit trail)
**Expected Result**: History modification blocked by app
**Priority**: High

---

### 4.3 Order Query Tests

#### TC-ORD-QUERY-001: Search by Tracking Number
**Objective**: Verify fast lookup by tracking number
**Preconditions**: 100,000+ orders exist
**Test Steps**:
1. Search by tracking number
2. Measure execution time
**Expected Result**: Query completes in <50ms using index
**Priority**: High

#### TC-ORD-QUERY-002: Filter by Status
**Objective**: Verify status filtering performance
**Preconditions**: Mixed status orders exist
**Test Steps**:
1. Query all PENDING orders
2. Verify correct records returned
3. Measure performance
**Expected Result**: Correct results, uses index
**Priority**: Medium

#### TC-ORD-QUERY-003: Date Range Query
**Objective**: Verify created_at index usage
**Preconditions**: Orders from multiple dates
**Test Steps**:
1. Query orders between date range
2. Verify correct results
3. Check execution plan uses index
**Expected Result**: Efficient date range query
**Priority**: Medium

#### TC-ORD-QUERY-004: Customer Order History
**Objective**: Verify customer can view their orders
**Preconditions**: Customer with 100+ orders
**Test Steps**:
1. Query by customer_id
2. Verify all orders returned
3. Check performance
**Expected Result**: All orders returned, uses index
**Priority**: High

---

## 5. ROUTING & DELIVERY MANAGEMENT

### 5.1 Delivery Route Tests

#### TC-ROUTE-001: Create Delivery Route
**Objective**: Verify route creation
**Preconditions**: Organization and courier exist
**Test Steps**:
1. Insert delivery route for today
2. Verify unique code generated
3. Verify default status = PLANNED
**Expected Result**: Route created successfully
**Priority**: High

#### TC-ROUTE-002: Assign Courier to Route
**Objective**: Verify courier assignment
**Preconditions**: Route and courier exist
**Test Steps**:
1. Assign courier_id to route
2. Verify foreign key relationship
3. Verify courier must have role='COURIER'
**Expected Result**: Courier assigned correctly
**Priority**: High

#### TC-ROUTE-003: Route Status Transitions
**Objective**: Verify valid status flow
**Preconditions**: Route in PLANNED status
**Test Steps**:
1. Transition PLANNED → IN_PROGRESS
2. Transition IN_PROGRESS → COMPLETED
3. Verify timestamps updated
**Expected Result**: Status flows correctly
**Priority**: Medium

#### TC-ROUTE-004: Route Statistics Update
**Objective**: Verify counters update correctly
**Preconditions**: Route with orders assigned
**Test Steps**:
1. Mark some orders delivered, some failed
2. Update route counters
3. Verify total_orders, delivered_orders, failed_orders correct
**Expected Result**: Accurate statistics
**Priority**: High

---

### 5.2 Route Order Assignment Tests

#### TC-ROUTE-ORD-001: Add Order to Route
**Objective**: Verify order assignment to route
**Preconditions**: Route and order exist
**Test Steps**:
1. Insert into route_orders
2. Verify sequence_number assigned
3. Verify unique constraint (one order per route)
**Expected Result**: Order added to route
**Priority**: Critical

#### TC-ROUTE-ORD-002: Prevent Duplicate Assignment
**Objective**: Verify order can't be added twice to same route
**Preconditions**: Order already on route
**Test Steps**:
1. Attempt to add same order again
2. Capture error
**Expected Result**: Unique constraint violation
**Priority**: High

#### TC-ROUTE-ORD-003: Optimal Sequencing
**Objective**: Verify sequence_number represents delivery order
**Preconditions**: Multiple orders on route
**Test Steps**:
1. Query route_orders ordered by sequence_number
2. Verify geographic clustering/optimization
**Expected Result**: Orders in logical sequence
**Priority**: Medium

#### TC-ROUTE-ORD-004: Update Delivery Status
**Objective**: Verify individual order status updates
**Preconditions**: Order on route
**Test Steps**:
1. Update route_orders.status to DELIVERED
2. Verify delivered_at timestamp set
3. Verify attempt_count tracked
**Expected Result**: Status and metadata updated
**Priority**: High

---

## 6. PROOF OF DELIVERY

### 6.1 POD Tests

#### TC-POD-001: Create Proof of Delivery
**Objective**: Verify POD record creation
**Preconditions**: Order in OUT_FOR_DELIVERY status
**Test Steps**:
1. Insert POD with signature, photo, GPS
2. Verify all fields stored
3. Verify delivered_at timestamp
**Expected Result**: Complete POD record created
**Priority**: Critical

#### TC-POD-002: GPS Coordinates Validation
**Objective**: Ensure valid coordinates
**Preconditions**: None
**Test Steps**:
1. Insert POD with latitude=91.0 (invalid)
2. Should validate range (-90 to 90)
**Expected Result**: Invalid coordinates rejected
**Priority**: Medium

#### TC-POD-003: Photo URL Storage
**Objective**: Verify image URL stored
**Preconditions**: Order delivered
**Test Steps**:
1. Insert POD with photo_url
2. Verify URL stored and retrievable
**Expected Result**: URL stored correctly
**Priority**: Low

#### TC-POD-004: One POD Per Order
**Objective**: Verify constraint preventing multiple PODs
**Preconditions**: Order already has POD
**Test Steps**:
1. Attempt to create second POD for same order
2. Should prevent or handle gracefully
**Expected Result**: Business logic enforces single POD
**Priority**: Medium

---

### 6.2 Failed Delivery Tests

#### TC-FAIL-001: Record Failed Delivery
**Objective**: Verify failed attempt logging
**Preconditions**: Order assigned to courier
**Test Steps**:
1. Insert failed_delivery_attempt with reason
2. Verify reason enum valid
3. Verify reschedule_date if applicable
**Expected Result**: Failed attempt recorded
**Priority**: High

#### TC-FAIL-002: Multiple Attempts Tracking
**Objective**: Verify system tracks attempt count
**Preconditions**: Order with 2 failed attempts
**Test Steps**:
1. Query count of failed attempts for order
2. Verify attempt_count increments
**Expected Result**: Accurate attempt tracking
**Priority**: Medium

#### TC-FAIL-003: Reschedule Logic
**Objective**: Verify reschedule date handling
**Preconditions**: Order failed with RESCHEDULED reason
**Test Steps**:
1. Set reschedule_date = tomorrow
2. Verify order can be reassigned
**Expected Result**: Order schedulable for future delivery
**Priority**: Medium

---

## 7. COD & FINANCIAL MANAGEMENT

### 7.1 COD Collection Tests

#### TC-COD-001: Record COD Collection
**Objective**: Verify COD collection on delivery
**Preconditions**: Order with COD amount delivered
**Test Steps**:
1. Insert cod_collection with amount, method
2. Verify amount matches order.cod_amount
3. Verify reconciled=FALSE initially
**Expected Result**: COD collection recorded
**Priority**: Critical

#### TC-COD-002: Collection Method Validation
**Objective**: Ensure valid payment methods
**Preconditions**: None
**Test Steps**:
1. Insert COD with invalid collection_method
2. Capture error
**Expected Result**: Enum constraint violation
**Priority**: Medium

#### TC-COD-003: Amount Validation
**Objective**: Verify collected amount matches order
**Preconditions**: Order with cod_amount=500,000
**Test Steps**:
1. Insert collection with amount=450,000
2. Should flag discrepancy
**Expected Result**: System detects mismatch
**Priority**: High

---

### 7.2 COD Reconciliation Tests

#### TC-RECON-001: Create Reconciliation
**Objective**: Verify reconciliation creation
**Preconditions**: Courier with unreconciled CODs
**Test Steps**:
1. Create reconciliation record
2. Aggregate total_amount from collections
3. Verify status=DRAFT
**Expected Result**: Reconciliation created correctly
**Priority**: Critical

#### TC-RECON-002: Link Collections to Reconciliation
**Objective**: Verify collections marked as reconciled
**Preconditions**: Reconciliation exists
**Test Steps**:
1. Update cod_collections.reconciliation_id
2. Set reconciled=TRUE
3. Verify collections linked
**Expected Result**: Collections tied to reconciliation
**Priority**: High

#### TC-RECON-003: Prevent Double Reconciliation
**Objective**: Verify collection can't be reconciled twice
**Preconditions**: Collection already reconciled
**Test Steps**:
1. Attempt to include in new reconciliation
2. Should prevent or warn
**Expected Result**: System prevents double reconciliation
**Priority**: High

#### TC-RECON-004: Approval Workflow
**Objective**: Verify status transitions
**Preconditions**: Reconciliation in SUBMITTED status
**Test Steps**:
1. Manager approves (status → APPROVED)
2. Verify approved_by and approved_at set
3. Transition to PAID
**Expected Result**: Proper workflow enforced
**Priority**: Medium

#### TC-RECON-005: Cash vs Transfer Split
**Objective**: Verify amount breakdown
**Preconditions**: Mixed payment methods
**Test Steps**:
1. Calculate cash_amount and transfer_amount
2. Verify sum equals total_amount
**Expected Result**: Correct breakdown calculation
**Priority**: Medium

---

## 8. MANIFEST MANAGEMENT

### 8.1 Manifest Tests

#### TC-MAN-001: Create Manifest
**Objective**: Verify manifest creation
**Preconditions**: Origin and destination offices exist
**Test Steps**:
1. Create manifest with unique code
2. Verify type enum (PICKUP, TRANSFER, DELIVERY)
3. Verify status=DRAFT
**Expected Result**: Manifest created successfully
**Priority**: High

#### TC-MAN-002: Add Orders to Manifest
**Objective**: Verify orders can be added
**Preconditions**: Manifest and orders exist
**Test Steps**:
1. Insert multiple orders into manifest_items
2. Update manifest.total_orders count
3. Calculate total_weight
**Expected Result**: Orders added, statistics updated
**Priority**: Critical

#### TC-MAN-003: Seal Manifest
**Objective**: Verify sealing prevents further changes
**Preconditions**: Manifest in DRAFT with orders
**Test Steps**:
1. Update status to SEALED
2. Set sealed_by and sealed_at
3. Attempt to add more orders
**Expected Result**: Sealed manifest locked
**Priority**: High

#### TC-MAN-004: Manifest Lifecycle
**Objective**: Verify status flow
**Preconditions**: Sealed manifest
**Test Steps**:
1. Transition SEALED → IN_TRANSIT
2. Transition IN_TRANSIT → RECEIVED
3. Set received_by and received_at
**Expected Result**: Complete lifecycle tracked
**Priority**: Medium

#### TC-MAN-005: Prevent Duplicate Orders
**Objective**: Verify order can't be in multiple manifests
**Preconditions**: Order already in manifest
**Test Steps**:
1. Attempt to add same order to different manifest
2. Should prevent or warn
**Expected Result**: Business logic prevents duplicates
**Priority**: Medium

---

## 9. COMPLAINT MANAGEMENT

### 9.1 Complaint Tests

#### TC-COMP-001: Create Complaint
**Objective**: Verify complaint creation
**Preconditions**: Order and customer exist
**Test Steps**:
1. Insert complaint with unique code
2. Verify type enum valid
3. Verify priority set
4. Verify status=OPEN
**Expected Result**: Complaint recorded
**Priority**: Critical

#### TC-COMP-002: Unique Complaint Code
**Objective**: Verify code format and uniqueness
**Preconditions**: None
**Test Steps**:
1. Generate code: KN-YYYYMMDD-XXXXX
2. Verify uniqueness
**Expected Result**: Unique codes generated
**Priority**: Medium

#### TC-COMP-003: Assign to Agent
**Objective**: Verify complaint assignment
**Preconditions**: Complaint and CS agent exist
**Test Steps**:
1. Set assigned_to to agent user_id
2. Verify foreign key relationship
**Expected Result**: Assignment successful
**Priority**: High

#### TC-COMP-004: Complaint Resolution
**Objective**: Verify resolution workflow
**Preconditions**: Complaint in INVESTIGATING status
**Test Steps**:
1. Set status to RESOLVED
2. Add resolution text
3. Set compensation_amount if applicable
4. Set resolved_by and resolved_at
**Expected Result**: Complete resolution recorded
**Priority**: High

#### TC-COMP-005: Priority Escalation
**Objective**: Verify high priority complaints handled
**Preconditions**: Complaint with priority=URGENT
**Test Steps**:
1. Query by priority
2. Verify sorting/filtering works
**Expected Result**: Urgent complaints identifiable
**Priority**: Medium

#### TC-COMP-006: Photo/Evidence Storage
**Objective**: Verify attachment handling
**Preconditions**: Complaint with photos
**Test Steps**:
1. Store photo_urls as JSON array
2. Query and parse JSON
3. Verify URLs retrievable
**Expected Result**: Evidence stored and accessible
**Priority**: Low

---

## 10. AUDIT & LOGGING

### 10.1 Audit Log Tests

#### TC-AUDIT-001: Log Entity Creation
**Objective**: Verify create operations logged
**Preconditions**: None
**Test Steps**:
1. Create order
2. Verify audit_log entry created
3. Verify action='CREATE'
4. Verify new_values contains data
**Expected Result**: Creation logged
**Priority**: Medium

#### TC-AUDIT-002: Log Entity Update
**Objective**: Verify update operations logged
**Preconditions**: Order exists
**Test Steps**:
1. Update order status
2. Verify audit_log entry with action='UPDATE'
3. Verify old_values and new_values captured
**Expected Result**: Changes logged with before/after
**Priority**: High

#### TC-AUDIT-003: Log Entity Deletion
**Objective**: Verify delete operations logged
**Preconditions**: Entity exists
**Test Steps**:
1. Delete entity
2. Verify audit_log entry with action='DELETE'
3. Verify old_values preserved
**Expected Result**: Deletion logged
**Priority**: Medium

#### TC-AUDIT-004: IP Address Logging
**Objective**: Verify client IP captured
**Preconditions**: None
**Test Steps**:
1. Perform action from specific IP
2. Verify ip_address stored in audit_log
**Expected Result**: IP tracked correctly
**Priority**: Low

#### TC-AUDIT-005: Audit Log Immutability
**Objective**: Verify logs cannot be modified
**Preconditions**: Audit log entries exist
**Test Steps**:
1. Attempt to update audit_log record
2. Should be prevented by design
**Expected Result**: Logs are append-only
**Priority**: High

---

## 11. VIEWS & REPORTING

### 11.1 View Tests

#### TC-VIEW-001: Daily Orders Summary
**Objective**: Verify v_daily_orders_summary accuracy
**Preconditions**: Orders exist across multiple days
**Test Steps**:
1. Query view for specific date
2. Manually calculate expected totals
3. Compare results
**Expected Result**: View matches manual calculation
**Priority**: High

#### TC-VIEW-002: Courier Performance
**Objective**: Verify v_courier_performance accuracy
**Preconditions**: Routes with delivery data exist
**Test Steps**:
1. Query view for courier
2. Verify success_rate calculation
3. Verify aggregations correct
**Expected Result**: Accurate performance metrics
**Priority**: High

#### TC-VIEW-003: Pending COD
**Objective**: Verify v_pending_cod accuracy
**Preconditions**: Unreconciled COD exists
**Test Steps**:
1. Query view
2. Verify only reconciled=FALSE included
3. Verify amounts sum correctly
**Expected Result**: Only pending CODs shown
**Priority**: Medium

---

## 12. STORED PROCEDURES

### 12.1 Procedure Tests

#### TC-PROC-001: Generate Tracking Number
**Objective**: Verify sp_generate_tracking_number
**Preconditions**: None
**Test Steps**:
1. Call procedure multiple times same day
2. Verify format: VN + YYYYMMDD + 6-digit-sequence + VN
3. Verify sequential numbering
4. Verify uniqueness
**Expected Result**: Valid, unique tracking numbers
**Priority**: Critical

#### TC-PROC-002: Generate Tracking Number - New Day
**Objective**: Verify sequence resets daily
**Preconditions**: Last order was yesterday
**Test Steps**:
1. Call procedure today
2. Verify sequence starts at 000001
**Expected Result**: Daily sequence reset works
**Priority**: Medium

#### TC-PROC-003: Create Order Procedure
**Objective**: Verify sp_create_order end-to-end
**Preconditions**: Valid input data
**Test Steps**:
1. Call procedure with full parameters
2. Verify order created
3. Verify tracking number returned
4. Verify status history created
5. Verify fees calculated
**Expected Result**: Complete order creation
**Priority**: Critical

#### TC-PROC-004: Create Order - Price Calculation
**Objective**: Verify automatic price calculation
**Preconditions**: Pricing rules exist
**Test Steps**:
1. Call procedure with weight=2.5kg, service=EXPRESS
2. Verify base_fee calculated from pricing table
3. Verify total_fee = base_fee + insurance_fee + cod_fee
**Expected Result**: Accurate price calculation
**Priority**: Critical

#### TC-PROC-005: Create Order - Rollback on Error
**Objective**: Verify transaction integrity
**Preconditions**: None
**Test Steps**:
1. Call procedure with invalid data (e.g., bad customer_id)
2. Verify no partial records created
3. Verify clean rollback
**Expected Result**: All-or-nothing transaction
**Priority**: High

---

## 13. PERFORMANCE & SCALABILITY

### 13.1 Performance Tests

#### TC-PERF-001: Index Effectiveness - Tracking Number
**Objective**: Verify UNIQUE index on tracking_number
**Preconditions**: 1,000,000 orders
**Test Steps**:
1. Query by tracking_number
2. Measure execution time
3. Check EXPLAIN plan uses index
**Expected Result**: Query < 50ms, index used
**Priority**: High

#### TC-PERF-002: Index Effectiveness - Customer Orders
**Objective**: Verify customer_id index
**Preconditions**: 1,000,000 orders
**Test Steps**:
1. Query all orders for customer
2. Measure execution time
3. Check EXPLAIN plan
**Expected Result**: Query < 100ms, index used
**Priority**: High

#### TC-PERF-003: Index Effectiveness - Date Range
**Objective**: Verify created_at index
**Preconditions**: 1,000,000 orders
**Test Steps**:
1. Query orders in date range (1 month)
2. Measure execution time
3. Check EXPLAIN plan
**Expected Result**: Query < 200ms, index used
**Priority**: Medium

#### TC-PERF-004: Concurrent Order Creation
**Objective**: Verify system handles concurrent inserts
**Preconditions**: None
**Test Steps**:
1. Simulate 100 concurrent sp_create_order calls
2. Verify all complete successfully
3. Verify no duplicate tracking numbers
4. Verify no deadlocks
**Expected Result**: All succeed, no conflicts
**Priority**: Critical

#### TC-PERF-005: View Query Performance
**Objective**: Verify views perform adequately
**Preconditions**: Large dataset
**Test Steps**:
1. Query each view
2. Measure execution time
3. Check if materialized view needed
**Expected Result**: Acceptable performance or optimization path
**Priority**: Medium

---

## 14. DATA INTEGRITY & CONSTRAINTS

### 14.1 Referential Integrity Tests

#### TC-INTEG-001: Cascade Delete - Order Status History
**Objective**: Verify ON DELETE CASCADE works
**Preconditions**: Order with status history
**Test Steps**:
1. Delete order
2. Verify status history deleted
**Expected Result**: Cascade delete successful
**Priority**: High

#### TC-INTEG-002: Prevent Orphan Orders
**Objective**: Verify foreign key prevents orphans
**Preconditions**: None
**Test Steps**:
1. Attempt to delete customer with orders
2. Should prevent or handle gracefully
**Expected Result**: Referential integrity maintained
**Priority**: High

#### TC-INTEG-003: Prevent Orphan Manifests
**Objective**: Verify manifest items cascade
**Preconditions**: Manifest with items
**Test Steps**:
1. Delete manifest
2. Verify items deleted
**Expected Result**: Cascade successful
**Priority**: Medium

---

## 15. BUSINESS LOGIC VALIDATION

### 15.1 Business Rule Tests

#### TC-BIZ-001: COD Only on Delivery
**Objective**: Verify COD recorded only when delivered
**Preconditions**: Order with COD in transit
**Test Steps**:
1. Verify cod_collections empty
2. Deliver order
3. Verify COD collection created
**Expected Result**: COD timing correct
**Priority**: High

#### TC-BIZ-002: Cannot Deliver Cancelled Order
**Objective**: Verify status validation
**Preconditions**: Cancelled order
**Test Steps**:
1. Attempt to update status to DELIVERED
2. Should prevent
**Expected Result**: Invalid transition blocked
**Priority**: Medium

#### TC-BIZ-003: Manifest Cannot be Modified After Sealing
**Objective**: Verify manifest immutability
**Preconditions**: Sealed manifest
**Test Steps**:
1. Attempt to add order
2. Should prevent
**Expected Result**: Sealed manifest locked
**Priority**: Medium

#### TC-BIZ-004: Courier Can Only See Own Routes
**Objective**: Verify data access control
**Preconditions**: Multiple couriers with routes
**Test Steps**:
1. Query as courier A
2. Verify only courier A's routes returned
**Expected Result**: Proper data isolation
**Priority**: High

---

## Test Execution Priority

### Phase 1: Critical Path (Must Pass Before Deployment)
- All TC-*-001 tests (basic CRUD)
- All foreign key constraint tests
- Order creation and tracking number generation
- COD collection and reconciliation
- Audit logging

### Phase 2: High Priority (Required for MVP)
- All search and query performance tests
- Business logic validation
- Status transition workflows
- View accuracy tests

### Phase 3: Medium Priority (Enhance Quality)
- Edge case handling
- Data validation refinements
- Performance optimization
- Cascading behavior

### Phase 4: Low Priority (Nice to Have)
- UI/UX related validations
- Optional field handling
- Advanced reporting tests

---

## Test Data Requirements

### Minimum Dataset for Testing
- 3 Organizations (HQ, Branch, Post Office)
- 10 Users (various roles)
- 100 Customers (mix of types)
- 1,000 Orders (various statuses)
- 50 Routes
- 200 COD Collections
- 20 Complaints
- 10 Manifests

### Large Dataset for Performance Testing
- 1,000,000 Orders
- 10,000 Customers
- 100 Couriers
- 6 months of historical data

---

## Test Environment Setup

### Prerequisites
- MySQL 8.0+
- Test database with same schema as production
- Automated test runner (e.g., pytest, JUnit)
- Mock data generator
- Performance monitoring tools

### CI/CD Integration
- Run all Phase 1 tests on every commit
- Run full test suite nightly
- Generate coverage reports
- Alert on test failures

---

**Total Test Cases Designed: 165+**

**Estimated Test Development Time: 40-60 hours**

**Estimated Test Execution Time: 4-6 hours (full suite)**