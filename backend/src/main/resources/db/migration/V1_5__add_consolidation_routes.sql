-- Phase 1: Hierarchical Routing System - Database Migration
-- Date: 2026-01-19

-- ==================== CREATE CONSOLIDATION_ROUTES TABLE ====================

CREATE TABLE consolidation_routes (
    id UUID PRIMARY KEY,

    -- Route identification
    name VARCHAR(255) NOT NULL,
    province_code VARCHAR(5) NOT NULL,
    destination_warehouse_id UUID NOT NULL,

    -- Route configuration (JSON array of stops)
    route_sequence JSON NOT NULL,

    -- Capacity limits
    max_weight_kg DECIMAL(10, 2),
    max_volume_cm3 DECIMAL(15, 2),
    max_orders INT,

    -- Status & metrics
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    total_consolidated_orders INT DEFAULT 0,
    last_consolidation_at TIMESTAMP,

    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_consolidation_province FOREIGN KEY (province_code) REFERENCES provinces(code),
    CONSTRAINT fk_consolidation_warehouse FOREIGN KEY (destination_warehouse_id) REFERENCES offices(id),

    -- Indexes
    UNIQUE KEY uk_consolidation_name_province (name, province_code, deleted_at),
    INDEX idx_consolidation_province (province_code),
    INDEX idx_consolidation_active (is_active),
    INDEX idx_consolidation_warehouse (destination_warehouse_id)
);

-- ==================== ENHANCE TRANSFER_ROUTES TABLE ====================

-- Add route_type column
ALTER TABLE transfer_routes
ADD COLUMN route_type VARCHAR(20) NOT NULL DEFAULT 'HUB_TO_HUB' AFTER id;

-- Add province_warehouse_id for PROVINCE_TO_HUB routes
ALTER TABLE transfer_routes
ADD COLUMN province_warehouse_id UUID AFTER route_type;

-- Add foreign key constraint
ALTER TABLE transfer_routes
ADD CONSTRAINT fk_transfer_province_warehouse FOREIGN KEY (province_warehouse_id) REFERENCES offices(id);

-- Add index for efficient queries
CREATE INDEX idx_transfer_type ON transfer_routes(route_type);
CREATE INDEX idx_transfer_province ON transfer_routes(province_warehouse_id);

-- ==================== ENHANCE ORDERS TABLE ====================

-- Add consolidation route reference
ALTER TABLE orders
ADD COLUMN assigned_consolidation_route_id UUID AFTER batch_package_id;

-- Add consolidation timestamps
ALTER TABLE orders
ADD COLUMN consolidated_at TIMESTAMP AFTER assigned_consolidation_route_id;

ALTER TABLE orders
ADD COLUMN transferred_to_hub_at TIMESTAMP AFTER consolidated_at;

-- Add foreign key constraint
ALTER TABLE orders
ADD CONSTRAINT fk_order_consolidation_route FOREIGN KEY (assigned_consolidation_route_id) REFERENCES consolidation_routes(id);

-- Add indexes for efficient queries
CREATE INDEX idx_order_consolidation_route ON orders(assigned_consolidation_route_id);
CREATE INDEX idx_order_consolidated_at ON orders(consolidated_at);
CREATE INDEX idx_order_transferred_at ON orders(transferred_to_hub_at);

-- ==================== MIGRATION NOTES ====================

-- 1. Consolidation routes are the primary grouping mechanism for WARD → PROVINCE consolidation
-- 2. TransferRoute now supports both PROVINCE_TO_HUB and HUB_TO_HUB routing
-- 3. Orders are fixed to consolidation routes at creation time (based on origin ward)
-- 4. Batch system remains functional (backward compatible)
-- 5. Consolidation is triggered by schedulers, not manual batch creation
