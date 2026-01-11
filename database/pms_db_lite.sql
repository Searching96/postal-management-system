-- =============================================
-- 0. CLEANUP (Optional - Use with caution)
-- =============================================
DROP DATABASE IF EXISTS pms_db;

CREATE DATABASE IF NOT EXISTS pms_db;
USE pms_db;

-- =============================================
-- MODULE 1: CORE & INFRASTRUCTURE
-- =============================================

-- 1. Đơn vị hành chính (Tỉnh/Huyện/Xã)
CREATE TABLE IF NOT EXISTS administrative_units (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(20),                -- Mã hành chính (VD: 79 - TP.HCM)
    name VARCHAR(100) NOT NULL,      -- Tên (VD: Quận 1)
    level VARCHAR(20) NOT NULL,      -- 'PROVINCE', 'DISTRICT', 'WARD'
    parent_id CHAR(36),
    FOREIGN KEY (parent_id) REFERENCES administrative_units(id)
);

-- 2. Bưu cục / Hub / Kho
CREATE TABLE IF NOT EXISTS offices (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    office_code VARCHAR(20) UNIQUE NOT NULL, -- Mã định danh (VD: BC-HCM-01)
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,       -- 'HQ', 'HUB', 'POST_OFFICE'
    phone VARCHAR(20),
    address TEXT,
    location_id CHAR(36),            -- Liên kết địa lý
    parent_id CHAR(36),              -- Bưu cục cha (Quản lý phân cấp)
    status VARCHAR(20) DEFAULT 'ACTIVE',
    FOREIGN KEY (location_id) REFERENCES administrative_units(id),
    FOREIGN KEY (parent_id) REFERENCES offices(id)
);

CREATE TABLE IF NOT EXISTS accounts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL, -- Với khách hàng, đây là SĐT
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(30) NOT NULL,            -- 'ADMIN', 'TELLER', 'SHIPPER', 'CUSTOMER'
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    user_id CHAR(36) PRIMARY KEY, -- Khóa chính cũng là FK trỏ về accounts.id
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL, -- SĐT liên hệ công việc
    office_id CHAR(36),                -- Làm việc tại bưu cục nào
    
    -- Các trường đặc thù của nhân viên
    employee_code VARCHAR(20) UNIQUE,  -- Mã nhân viên (VD: NV001)
    job_title VARCHAR(50),             -- Chức danh cụ thể
    
    FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (office_id) REFERENCES offices(id)
);

CREATE TABLE IF NOT EXISTS customers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    -- Nếu khách có đăng ký tài khoản thì link vào đây, khách vãng lai thì NULL
    account_id CHAR(36) UNIQUE, 
    
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL, -- Không unique tuyệt đối vì 1 SĐT có thể gửi nhiều lần vãng lai (tùy logic)
    
    -- Địa chỉ lấy hàng mặc định
    address TEXT,
    ward_id CHAR(36),
    
    customer_type VARCHAR(20) DEFAULT 'INDIVIDUAL', -- 'INDIVIDUAL', 'ENTERPRISE'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (ward_id) REFERENCES administrative_units(id)
);

-- Index cho số điện thoại để tìm khách hàng nhanh khi tạo đơn
CREATE INDEX idx_customer_phone ON customers(phone);

-- =============================================
-- MODULE 2: PRICING ENGINE
-- =============================================

-- 5. Loại dịch vụ
CREATE TABLE IF NOT EXISTS service_types (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(20) UNIQUE NOT NULL, -- 'STANDARD', 'EXPRESS', 'SAVING'
    name VARCHAR(100),
    description TEXT
);

-- 6. Vùng tính giá (Zone)
CREATE TABLE IF NOT EXISTS pricing_zones (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(20) UNIQUE NOT NULL, -- 'NOI_THANH', 'NGOAI_THANH', 'LIEN_MIEN'
    name VARCHAR(100)
);

-- 7. Mapping Hành chính vào Vùng (Huyện X thuộc Vùng Y)
CREATE TABLE IF NOT EXISTS zone_mappings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    zone_id CHAR(36),
    administrative_unit_id CHAR(36),
    UNIQUE(administrative_unit_id),
    FOREIGN KEY (zone_id) REFERENCES pricing_zones(id),
    FOREIGN KEY (administrative_unit_id) REFERENCES administrative_units(id)
);

-- 8. Quản lý phiên bản Bảng giá
CREATE TABLE IF NOT EXISTS price_books (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,      -- VD: 'Bảng giá Q1-2025'
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP,              -- NULL = Vô thời hạn
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Công thức tính giá (Matrix giá)
CREATE TABLE IF NOT EXISTS price_formulas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    price_book_id CHAR(36),
    service_type_id CHAR(36),
    from_zone_id CHAR(36),
    to_zone_id CHAR(36),
    
    -- Logic tính toán
    min_weight FLOAT DEFAULT 0,
    max_weight FLOAT,
    base_price DECIMAL(15, 2) NOT NULL,
    
    -- Phụ phí vượt cân
    extra_weight_step FLOAT DEFAULT 0,
    extra_price_per_step DECIMAL(15, 2) DEFAULT 0,
    
    FOREIGN KEY (price_book_id) REFERENCES price_books(id),
    FOREIGN KEY (service_type_id) REFERENCES service_types(id),
    FOREIGN KEY (from_zone_id) REFERENCES pricing_zones(id),
    FOREIGN KEY (to_zone_id) REFERENCES pricing_zones(id)
);

-- =============================================
-- MODULE 3: ORDER MANAGEMENT
-- =============================================

-- 10. Vận đơn (Parcels) - Bảng quan trọng nhất
CREATE TABLE IF NOT EXISTS parcels (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tracking_number VARCHAR(30) UNIQUE NOT NULL,
    
    -- Người gửi
    sender_id CHAR(36),
    sender_name VARCHAR(100),        -- Lưu cứng text để không bị đổi khi customer update
    sender_phone VARCHAR(20),
    sender_address TEXT,
    sender_ward_id CHAR(36),
    
    -- Người nhận
    receiver_name VARCHAR(100),
    receiver_phone VARCHAR(20),
    receiver_address TEXT,
    receiver_ward_id CHAR(36),
    
    -- Hàng hóa
    weight_actual FLOAT NOT NULL,    -- kg
    weight_converted FLOAT,          -- kg (Dài*Rộng*Cao/cnst)
    dimensions VARCHAR(50),          -- "L x W x H"
    goods_value DECIMAL(15, 2),      -- Giá trị khai báo
    goods_content TEXT,
    
    -- Dịch vụ & Phí
    service_type_id CHAR(36),
    is_cod BOOLEAN DEFAULT FALSE,
    cod_amount DECIMAL(15, 2) DEFAULT 0,
    shipping_fee DECIMAL(15, 2) NOT NULL,
    insurance_fee DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'CASH', -- 'CASH', 'WALLET', 'SENDER_PAY', 'RECEIVER_PAY'
    
    -- Trạng thái & Vị trí
    status VARCHAR(30) DEFAULT 'ACCEPTED', 
    -- Enum: ACCEPTED, SORTING, TRANSPORTING, DELIVERING, DELIVERED, CANCELLED, RETURNING, RETURNED
    
    current_office_id CHAR(36),
    
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expected_delivery_time TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES customers(id),
    FOREIGN KEY (sender_ward_id) REFERENCES administrative_units(id),
    FOREIGN KEY (receiver_ward_id) REFERENCES administrative_units(id),
    FOREIGN KEY (service_type_id) REFERENCES service_types(id),
    FOREIGN KEY (current_office_id) REFERENCES offices(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================================
-- MODULE 4: WAREHOUSE & LOGISTICS
-- =============================================

-- 11. Phương tiện vận tải
CREATE TABLE IF NOT EXISTS vehicles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(20),                -- 'TRUCK_500KG', 'TRUCK_5TON', 'MOTORBIKE'
    load_capacity_kg FLOAT,
    office_id CHAR(36),
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    FOREIGN KEY (office_id) REFERENCES offices(id)
);

-- 12. Bao hàng / Sọt hàng (Container)
CREATE TABLE IF NOT EXISTS containers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    container_code VARCHAR(30) UNIQUE NOT NULL,
    type VARCHAR(20) DEFAULT 'BAG',  -- 'BAG', 'CAGE', 'BOX'
    
    origin_office_id CHAR(36),
    destination_office_id CHAR(36),
    current_office_id CHAR(36),
    
    status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'CLOSED', 'RECEIVED'
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (origin_office_id) REFERENCES offices(id),
    FOREIGN KEY (destination_office_id) REFERENCES offices(id),
    FOREIGN KEY (current_office_id) REFERENCES offices(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 13. Chi tiết Bao hàng (Mapping 1 Bao chứa nhiều Đơn)
CREATE TABLE IF NOT EXISTS container_details (
    container_id CHAR(36),
    parcel_id CHAR(36),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (container_id, parcel_id),
    FOREIGN KEY (container_id) REFERENCES containers(id),
    FOREIGN KEY (parcel_id) REFERENCES parcels(id)
);

-- 14. Bảng kê / Chuyến xe (Manifest)
CREATE TABLE IF NOT EXISTS manifests (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    manifest_code VARCHAR(30) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL,       -- 'TRANSFER' (Giữa các Hub), 'DELIVERY' (Đi giao), 'PICKUP' (Đi lấy)
    
    source_office_id CHAR(36),
    destination_office_id CHAR(36),
    
    vehicle_id CHAR(36),
    driver_id CHAR(36),
    
    status VARCHAR(20) DEFAULT 'CREATED', -- 'CREATED', 'IN_TRANSIT', 'COMPLETED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    departed_at TIMESTAMP,
    arrived_at TIMESTAMP,
    
    FOREIGN KEY (source_office_id) REFERENCES offices(id),
    FOREIGN KEY (destination_office_id) REFERENCES offices(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (driver_id) REFERENCES users(id)
);

-- 15. Chi tiết Bảng kê - Chứa Bao (Dành cho xe tải luân chuyển)
CREATE TABLE IF NOT EXISTS manifest_containers (
    manifest_id CHAR(36),
    container_id CHAR(36),
    PRIMARY KEY (manifest_id, container_id),
    FOREIGN KEY (manifest_id) REFERENCES manifests(id),
    FOREIGN KEY (container_id) REFERENCES containers(id)
);

-- 16. Chi tiết Bảng kê - Chứa Đơn lẻ (Dành cho Shipper đi giao/lấy)
CREATE TABLE IF NOT EXISTS manifest_parcels (
    manifest_id CHAR(36),
    parcel_id CHAR(36),
    PRIMARY KEY (manifest_id, parcel_id),
    FOREIGN KEY (manifest_id) REFERENCES manifests(id),
    FOREIGN KEY (parcel_id) REFERENCES parcels(id)
);

-- =============================================
-- MODULE 5: LAST-MILE & TRACKING
-- =============================================

-- 17. Lịch sử hành trình (Tracking History)
CREATE TABLE IF NOT EXISTS tracking_events (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    parcel_id CHAR(36),
    office_id CHAR(36),
    status VARCHAR(30) NOT NULL,
    description TEXT,                -- Nội dung hiển thị cho khách
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parcel_id) REFERENCES parcels(id),
    FOREIGN KEY (office_id) REFERENCES offices(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 18. Lượt giao hàng (Delivery Attempt)
CREATE TABLE IF NOT EXISTS delivery_attempts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    parcel_id CHAR(36),
    shipper_id CHAR(36),
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    status VARCHAR(20),              -- 'SUCCESS', 'FAILED'
    failure_reason VARCHAR(100),     -- 'KHACH_KHONG_NGHE', 'SAI_DIA_CHI'
    receiver_real_name VARCHAR(100), -- Người thực nhận
    
    pod_image_url TEXT,              -- Ảnh chụp bằng chứng (Proof of Delivery)
    signature_url TEXT,              -- Chữ ký
    gps_lat FLOAT,                   -- Tọa độ
    gps_long FLOAT,
    
    FOREIGN KEY (parcel_id) REFERENCES parcels(id),
    FOREIGN KEY (shipper_id) REFERENCES users(id)
);

-- =============================================
-- MODULE 6: FINANCE & COD
-- =============================================

-- 19. Ví điện tử (Công nợ)
CREATE TABLE IF NOT EXISTS wallets (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),                -- Ví Shipper
    customer_id CHAR(36),            -- Ví Shop
    balance DECIMAL(15, 2) DEFAULT 0,
    blocked_balance DECIMAL(15, 2) DEFAULT 0,   -- Tiền chờ đối soát
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    CHECK (user_id IS NOT NULL OR customer_id IS NOT NULL)
);

-- 20. Giao dịch ví
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    wallet_id CHAR(36),
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(30),                -- 'COD_COLLECT', 'SHIPPING_FEE', 'WITHDRAW'
    reference_code VARCHAR(50),      -- Mã đơn hoặc mã đối soát
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);

-- 21. Phiên đối soát COD (Cho khách hàng)
CREATE TABLE IF NOT EXISTS cod_statements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    statement_code VARCHAR(30) UNIQUE,
    customer_id CHAR(36),
    
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    total_cod DECIMAL(15, 2) DEFAULT 0,
    total_fee DECIMAL(15, 2) DEFAULT 0,
    net_amount DECIMAL(15, 2) DEFAULT 0, -- = COD - Fee
    
    status VARCHAR(20) DEFAULT 'DRAFT',  -- 'DRAFT', 'CONFIRMED', 'PAID'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- =============================================
-- MODULE 7: SUPPORT & SYSTEM
-- =============================================

-- 22. Sự cố / Khiếu nại
CREATE TABLE IF NOT EXISTS incidents (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ticket_code VARCHAR(30) UNIQUE,
    parcel_id CHAR(36),
    type VARCHAR(50),                -- 'LOST', 'DAMAGED', 'LATE', 'WRONG_ROUTE'
    status VARCHAR(20) DEFAULT 'OPEN',
    priority VARCHAR(10) DEFAULT 'MEDIUM',
    
    created_by_user_id CHAR(36),
    assigned_to_office_id CHAR(36),
    
    resolution_note TEXT,
    compensation_amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (parcel_id) REFERENCES parcels(id),
    FOREIGN KEY (created_by_user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to_office_id) REFERENCES offices(id)
);

-- 23. Log thông báo (SMS/Email)
CREATE TABLE IF NOT EXISTS notification_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    recipient_type VARCHAR(20),      -- 'CUSTOMER', 'USER'
    recipient_id VARCHAR(36),
    channel VARCHAR(20),             -- 'SMS', 'EMAIL', 'PUSH'
    content TEXT,
    status VARCHAR(20),              -- 'SENT', 'FAILED'
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);