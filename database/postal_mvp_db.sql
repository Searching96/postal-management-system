-- =====================================================
-- POSTAL MANAGEMENT SYSTEM - MVP DATABASE SCHEMA
-- Version: 1.0 (MVP)
-- Target: SME (50-500 orders/day)
-- =====================================================

-- Drop existing database if exists
DROP DATABASE IF EXISTS postal_management_mvp;
CREATE DATABASE postal_management_mvp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE postal_management_mvp;

-- =====================================================
-- 1. ORGANIZATION & USER MANAGEMENT
-- =====================================================

-- Organizations (Multi-tenant support)
CREATE TABLE organizations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('HQ', 'BRANCH', 'POST_OFFICE') NOT NULL,
    parent_id BIGINT UNSIGNED NULL,
    level TINYINT NOT NULL DEFAULT 1,
    address TEXT,
    province VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES organizations(id),
    INDEX idx_parent (parent_id),
    INDEX idx_type (type),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Users
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('ADMIN', 'MANAGER', 'CLERK', 'WAREHOUSE', 'DISPATCHER', 'COURIER', 'ACCOUNTANT') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    INDEX idx_org (organization_id),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- 2. CUSTOMER MANAGEMENT
-- =====================================================

-- Customers
CREATE TABLE customers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('INDIVIDUAL', 'SME', 'ENTERPRISE') NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    province VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_phone (phone),
    INDEX idx_type (type),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- 3. PRICING & SERVICE MANAGEMENT
-- =====================================================

-- Service Types
CREATE TABLE service_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    estimated_delivery_days INT NOT NULL,
    priority TINYINT NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default service types
INSERT INTO service_types (code, name, estimated_delivery_days, priority) VALUES
('EXPRESS', 'Hỏa tốc', 1, 3),
('FAST', 'Chuyển phát nhanh', 3, 2),
('STANDARD', 'Tiết kiệm', 5, 1);

-- Pricing Matrix
CREATE TABLE pricing (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    service_type_id INT UNSIGNED NOT NULL,
    weight_from DECIMAL(10,2) NOT NULL,
    weight_to DECIMAL(10,2) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    per_kg_price DECIMAL(10,2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id),
    INDEX idx_service (service_type_id),
    INDEX idx_dates (effective_from, effective_to),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- 4. ORDER MANAGEMENT (Core)
-- =====================================================

-- Orders (Shipments)
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    service_type_id INT UNSIGNED NOT NULL,
    origin_office_id BIGINT UNSIGNED NOT NULL,
    destination_office_id BIGINT UNSIGNED NULL,
    
    -- Sender Information
    sender_name VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    sender_address TEXT NOT NULL,
    sender_province VARCHAR(100),
    sender_district VARCHAR(100),
    sender_ward VARCHAR(100),
    
    -- Receiver Information
    receiver_name VARCHAR(255) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    receiver_address TEXT NOT NULL,
    receiver_province VARCHAR(100) NOT NULL,
    receiver_district VARCHAR(100) NOT NULL,
    receiver_ward VARCHAR(100),
    
    -- Package Information
    package_type VARCHAR(100),
    actual_weight DECIMAL(10,2) NOT NULL,
    volumetric_weight DECIMAL(10,2) DEFAULT 0,
    chargeable_weight DECIMAL(10,2) NOT NULL,
    declared_value DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    
    -- Pricing
    base_fee DECIMAL(10,2) NOT NULL,
    insurance_fee DECIMAL(10,2) DEFAULT 0,
    cod_fee DECIMAL(10,2) DEFAULT 0,
    total_fee DECIMAL(10,2) NOT NULL,
    
    -- COD Information
    cod_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Status
    status ENUM('PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    
    -- Timestamps
    estimated_delivery TIMESTAMP NULL,
    actual_delivery TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (service_type_id) REFERENCES service_types(id),
    FOREIGN KEY (origin_office_id) REFERENCES organizations(id),
    FOREIGN KEY (destination_office_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    INDEX idx_tracking (tracking_number),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    INDEX idx_receiver_phone (receiver_phone),
    INDEX idx_destination (receiver_province, receiver_district)
) ENGINE=InnoDB;

-- Order Status History (Tracking)
CREATE TABLE order_status_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    status ENUM('PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED', 'CANCELLED') NOT NULL,
    location VARCHAR(255),
    organization_id BIGINT UNSIGNED,
    notes TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    INDEX idx_order (order_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- 5. ROUTING & DELIVERY MANAGEMENT
-- =====================================================

-- Delivery Routes
CREATE TABLE delivery_routes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    organization_id BIGINT UNSIGNED NOT NULL,
    courier_id BIGINT UNSIGNED NULL,
    route_date DATE NOT NULL,
    status ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PLANNED',
    total_orders INT DEFAULT 0,
    delivered_orders INT DEFAULT 0,
    failed_orders INT DEFAULT 0,
    total_distance_km DECIMAL(10,2),
    estimated_duration_minutes INT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (courier_id) REFERENCES users(id),
    
    INDEX idx_date (route_date),
    INDEX idx_courier (courier_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Route Orders (Junction Table)
CREATE TABLE route_orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    sequence_number INT NOT NULL,
    status ENUM('PENDING', 'DELIVERED', 'FAILED') DEFAULT 'PENDING',
    attempt_count INT DEFAULT 0,
    delivery_notes TEXT,
    delivered_at TIMESTAMP NULL,
    
    FOREIGN KEY (route_id) REFERENCES delivery_routes(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    
    UNIQUE KEY unique_route_order (route_id, order_id),
    INDEX idx_route (route_id),
    INDEX idx_order (order_id)
) ENGINE=InnoDB;

-- =====================================================
-- 6. PROOF OF DELIVERY (POD)
-- =====================================================

-- Proof of Delivery
CREATE TABLE proof_of_delivery (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    courier_id BIGINT UNSIGNED NOT NULL,
    receiver_name VARCHAR(255),
    receiver_signature TEXT, -- Base64 encoded signature
    photo_url VARCHAR(500),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    delivery_notes TEXT,
    delivered_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (courier_id) REFERENCES users(id),
    
    INDEX idx_order (order_id),
    INDEX idx_courier (courier_id),
    INDEX idx_delivered (delivered_at)
) ENGINE=InnoDB;

-- Failed Delivery Attempts
CREATE TABLE failed_delivery_attempts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    courier_id BIGINT UNSIGNED NOT NULL,
    reason ENUM('CUSTOMER_UNAVAILABLE', 'WRONG_ADDRESS', 'REFUSED', 'RESCHEDULED', 'OTHER') NOT NULL,
    reason_details TEXT,
    photo_url VARCHAR(500),
    reschedule_date DATE NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    attempted_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (courier_id) REFERENCES users(id),
    
    INDEX idx_order (order_id),
    INDEX idx_courier (courier_id),
    INDEX idx_reason (reason)
) ENGINE=InnoDB;

-- =====================================================
-- 7. COD & FINANCIAL MANAGEMENT
-- =====================================================

-- COD Collections
CREATE TABLE cod_collections (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    courier_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    collection_method ENUM('CASH', 'QR', 'BANK_TRANSFER') NOT NULL,
    collected_at TIMESTAMP NOT NULL,
    reconciled BOOLEAN DEFAULT FALSE,
    reconciliation_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (courier_id) REFERENCES users(id),
    
    INDEX idx_order (order_id),
    INDEX idx_courier (courier_id),
    INDEX idx_reconciled (reconciled),
    INDEX idx_collected (collected_at)
) ENGINE=InnoDB;

-- COD Reconciliation
CREATE TABLE cod_reconciliations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    courier_id BIGINT UNSIGNED NOT NULL,
    organization_id BIGINT UNSIGNED NOT NULL,
    reconciliation_date DATE NOT NULL,
    total_orders INT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    cash_amount DECIMAL(15,2) DEFAULT 0,
    transfer_amount DECIMAL(15,2) DEFAULT 0,
    status ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'PAID') DEFAULT 'DRAFT',
    notes TEXT,
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (courier_id) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    INDEX idx_courier (courier_id),
    INDEX idx_date (reconciliation_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- =====================================================
-- 8. MANIFEST & TRANSFER MANAGEMENT
-- =====================================================

-- Manifests (Bảng kê)
CREATE TABLE manifests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('PICKUP', 'TRANSFER', 'DELIVERY') NOT NULL,
    origin_office_id BIGINT UNSIGNED NOT NULL,
    destination_office_id BIGINT UNSIGNED NOT NULL,
    total_orders INT DEFAULT 0,
    total_weight DECIMAL(10,2) DEFAULT 0,
    status ENUM('DRAFT', 'SEALED', 'IN_TRANSIT', 'RECEIVED') DEFAULT 'DRAFT',
    sealed_by BIGINT UNSIGNED NULL,
    sealed_at TIMESTAMP NULL,
    received_by BIGINT UNSIGNED NULL,
    received_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (origin_office_id) REFERENCES organizations(id),
    FOREIGN KEY (destination_office_id) REFERENCES organizations(id),
    FOREIGN KEY (sealed_by) REFERENCES users(id),
    FOREIGN KEY (received_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    INDEX idx_code (code),
    INDEX idx_origin (origin_office_id),
    INDEX idx_destination (destination_office_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- Manifest Items
CREATE TABLE manifest_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    manifest_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (manifest_id) REFERENCES manifests(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    
    UNIQUE KEY unique_manifest_order (manifest_id, order_id),
    INDEX idx_manifest (manifest_id),
    INDEX idx_order (order_id)
) ENGINE=InnoDB;

-- =====================================================
-- 9. COMPLAINT MANAGEMENT
-- =====================================================

-- Complaints
CREATE TABLE complaints (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    type ENUM('LATE_DELIVERY', 'LOST', 'DAMAGED', 'WRONG_COD', 'STAFF_ATTITUDE', 'WRONG_ROUTE', 'OTHER') NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    description TEXT NOT NULL,
    photo_urls TEXT, -- JSON array of URLs
    status ENUM('OPEN', 'INVESTIGATING', 'RESOLVED', 'REJECTED', 'CLOSED') DEFAULT 'OPEN',
    resolution TEXT,
    compensation_amount DECIMAL(15,2) DEFAULT 0,
    assigned_to BIGINT UNSIGNED NULL,
    resolved_by BIGINT UNSIGNED NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id),
    
    INDEX idx_code (code),
    INDEX idx_order (order_id),
    INDEX idx_customer (customer_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
) ENGINE=InnoDB;

-- =====================================================
-- 10. SYSTEM LOGS & AUDIT TRAIL
-- =====================================================

-- Audit Logs
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT UNSIGNED NOT NULL,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- 11. CONFIGURATION & SETTINGS
-- =====================================================

-- System Settings
CREATE TABLE system_settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
    description TEXT,
    updated_by BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id),
    INDEX idx_key (setting_key)
) ENGINE=InnoDB;

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Daily Orders Summary View
CREATE VIEW v_daily_orders_summary AS
SELECT 
    DATE(created_at) as order_date,
    origin_office_id,
    status,
    service_type_id,
    COUNT(*) as total_orders,
    SUM(total_fee) as total_revenue,
    SUM(cod_amount) as total_cod,
    AVG(chargeable_weight) as avg_weight
FROM orders
GROUP BY DATE(created_at), origin_office_id, status, service_type_id;

-- Courier Performance View
CREATE VIEW v_courier_performance AS
SELECT 
    u.id as courier_id,
    u.full_name as courier_name,
    DATE(dr.route_date) as route_date,
    COUNT(DISTINCT dr.id) as total_routes,
    SUM(dr.total_orders) as total_orders,
    SUM(dr.delivered_orders) as delivered_orders,
    SUM(dr.failed_orders) as failed_orders,
    ROUND(SUM(dr.delivered_orders) * 100.0 / NULLIF(SUM(dr.total_orders), 0), 2) as success_rate
FROM users u
LEFT JOIN delivery_routes dr ON u.id = dr.courier_id
WHERE u.role = 'COURIER'
GROUP BY u.id, u.full_name, DATE(dr.route_date);

-- Pending COD Reconciliation View
CREATE VIEW v_pending_cod AS
SELECT 
    u.id as courier_id,
    u.full_name as courier_name,
    COUNT(*) as pending_orders,
    SUM(cc.amount) as pending_amount
FROM users u
INNER JOIN cod_collections cc ON u.id = cc.courier_id
WHERE cc.reconciled = FALSE
GROUP BY u.id, u.full_name;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample organization
INSERT INTO organizations (code, name, type, level, province, district, phone, email) VALUES
('HQ001', 'Trụ sở Chính', 'HQ', 1, 'TP. Hồ Chí Minh', 'Quận 1', '0281234567', 'contact@postal.vn'),
('BR001', 'Chi nhánh Miền Nam', 'BRANCH', 2, 'TP. Hồ Chí Minh', 'Quận 3', '0281234568', 'south@postal.vn'),
('PO001', 'Bưu cục Quận 1', 'POST_OFFICE', 3, 'TP. Hồ Chí Minh', 'Quận 1', '0281234569', 'q1@postal.vn');

-- Insert sample users
INSERT INTO users (organization_id, username, email, password_hash, full_name, phone, role) VALUES
(1, 'admin', 'admin@postal.vn', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Admin', '0901234567', 'ADMIN'),
(3, 'clerk01', 'clerk01@postal.vn', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn A', '0901234568', 'CLERK'),
(3, 'courier01', 'courier01@postal.vn', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần Văn B', '0901234569', 'COURIER');

-- Insert sample pricing
INSERT INTO pricing (version, service_type_id, weight_from, weight_to, base_price, per_kg_price, effective_from) VALUES
('v1.0', 1, 0, 0.5, 35000, 0, '2025-01-01'),
('v1.0', 1, 0.5, 1.0, 40000, 15000, '2025-01-01'),
('v1.0', 1, 1.0, 5.0, 55000, 12000, '2025-01-01'),
('v1.0', 2, 0, 0.5, 20000, 0, '2025-01-01'),
('v1.0', 2, 0.5, 1.0, 25000, 10000, '2025-01-01'),
('v1.0', 2, 1.0, 5.0, 35000, 8000, '2025-01-01'),
('v1.0', 3, 0, 0.5, 15000, 0, '2025-01-01'),
('v1.0', 3, 0.5, 1.0, 18000, 7000, '2025-01-01'),
('v1.0', 3, 1.0, 5.0, 25000, 5000, '2025-01-01');

-- =====================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- =====================================================

DELIMITER //

-- Generate Tracking Number
CREATE PROCEDURE sp_generate_tracking_number(
    OUT p_tracking_number VARCHAR(50)
)
BEGIN
    DECLARE v_date VARCHAR(8);
    DECLARE v_sequence INT;
    
    SET v_date = DATE_FORMAT(NOW(), '%Y%m%d');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(tracking_number, 11, 6) AS UNSIGNED)), 0) + 1
    INTO v_sequence
    FROM orders
    WHERE DATE(created_at) = CURDATE();
    
    SET p_tracking_number = CONCAT('VN', v_date, LPAD(v_sequence, 6, '0'), 'VN');
END//

-- Create Order with Tracking
CREATE PROCEDURE sp_create_order(
    IN p_customer_id BIGINT,
    IN p_service_type_id INT,
    IN p_origin_office_id BIGINT,
    IN p_sender_name VARCHAR(255),
    IN p_sender_phone VARCHAR(20),
    IN p_sender_address TEXT,
    IN p_receiver_name VARCHAR(255),
    IN p_receiver_phone VARCHAR(20),
    IN p_receiver_address TEXT,
    IN p_receiver_province VARCHAR(100),
    IN p_receiver_district VARCHAR(100),
    IN p_actual_weight DECIMAL(10,2),
    IN p_declared_value DECIMAL(15,2),
    IN p_cod_amount DECIMAL(15,2),
    IN p_created_by BIGINT,
    OUT p_order_id BIGINT,
    OUT p_tracking_number VARCHAR(50)
)
BEGIN
    DECLARE v_base_fee DECIMAL(10,2);
    DECLARE v_chargeable_weight DECIMAL(10,2);
    
    -- Generate tracking number
    CALL sp_generate_tracking_number(p_tracking_number);
    
    -- Calculate chargeable weight (simplified)
    SET v_chargeable_weight = p_actual_weight;
    
    -- Calculate base fee (simplified - should use pricing table)
    SET v_base_fee = 35000 + (v_chargeable_weight * 8000);
    
    -- Insert order
    INSERT INTO orders (
        tracking_number, customer_id, service_type_id, origin_office_id,
        sender_name, sender_phone, sender_address,
        receiver_name, receiver_phone, receiver_address, 
        receiver_province, receiver_district,
        actual_weight, chargeable_weight, declared_value,
        base_fee, total_fee, cod_amount, created_by
    ) VALUES (
        p_tracking_number, p_customer_id, p_service_type_id, p_origin_office_id,
        p_sender_name, p_sender_phone, p_sender_address,
        p_receiver_name, p_receiver_phone, p_receiver_address,
        p_receiver_province, p_receiver_district,
        p_actual_weight, v_chargeable_weight, p_declared_value,
        v_base_fee, v_base_fee, p_cod_amount, p_created_by
    );
    
    SET p_order_id = LAST_INSERT_ID();
    
    -- Add initial status
    INSERT INTO order_status_history (order_id, status, organization_id, created_by)
    VALUES (p_order_id, 'PENDING', p_origin_office_id, p_created_by);
END//

DELIMITER ;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Display summary
SELECT 'Database schema created successfully!' as Status;
SELECT COUNT(*) as Total_Tables FROM information_schema.tables 
WHERE table_schema = 'postal_management_mvp';
SELECT COUNT(*) as Total_Views FROM information_schema.views 
WHERE table_schema = 'postal_management_mvp';