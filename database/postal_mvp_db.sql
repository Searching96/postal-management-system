

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
    id SERIAL PRIMARY KEY,
    code VARCHAR(20),                -- Mã hành chính (VD: 79 - TP.HCM)
    name VARCHAR(100) NOT NULL,      -- Tên (VD: Quận 1)
    level VARCHAR(20) NOT NULL,      -- 'PROVINCE', 'DISTRICT', 'WARD'
    parent_id INTEGER REFERENCES administrative_units(id)
);

-- 2. Bưu cục / Hub / Kho
CREATE TABLE IF NOT EXISTS offices (
    id SERIAL PRIMARY KEY,
    office_code VARCHAR(20) UNIQUE NOT NULL, -- Mã định danh (VD: BC-HCM-01)
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,       -- 'HQ', 'HUB', 'POST_OFFICE'
    phone VARCHAR(20),
    address TEXT,
    location_id INTEGER REFERENCES administrative_units(id), -- Liên kết địa lý
    parent_id INTEGER REFERENCES offices(id), -- Bưu cục cha (Quản lý phân cấp)
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 3. Người dùng (Nhân viên)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL,       -- 'ADMIN', 'MANAGER', 'TELLER', 'SHIPPER', 'DRIVER', 'WAREHOUSE'
    office_id INTEGER REFERENCES offices(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Khách hàng (Người gửi)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL, -- Định danh chính bằng SĐT
    email VARCHAR(100),
    address TEXT,
    ward_id INTEGER REFERENCES administrative_units(id),
    customer_type VARCHAR(20) DEFAULT 'INDIVIDUAL', -- 'INDIVIDUAL', 'ENTERPRISE'
    contract_number VARCHAR(50),     -- Mã hợp đồng (nếu có)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- MODULE 2: PRICING ENGINE
-- =============================================

-- 5. Loại dịch vụ
CREATE TABLE IF NOT EXISTS service_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL, -- 'STANDARD', 'EXPRESS', 'SAVING'
    name VARCHAR(100),
    description TEXT
);

-- 6. Vùng tính giá (Zone)
CREATE TABLE IF NOT EXISTS pricing_zones (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL, -- 'NOI_THANH', 'NGOAI_THANH', 'LIEN_MIEN'
    name VARCHAR(100)
);

-- 7. Mapping Hành chính vào Vùng (Huyện X thuộc Vùng Y)
CREATE TABLE IF NOT EXISTS zone_mappings (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER REFERENCES pricing_zones(id),
    administrative_unit_id INTEGER REFERENCES administrative_units(id),
    UNIQUE(administrative_unit_id)
);

-- 8. Quản lý phiên bản Bảng giá
CREATE TABLE IF NOT EXISTS price_books (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,      -- VD: 'Bảng giá Q1-2025'
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP,              -- NULL = Vô thời hạn
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Công thức tính giá (Matrix giá)
CREATE TABLE IF NOT EXISTS price_formulas (
    id SERIAL PRIMARY KEY,
    price_book_id INTEGER REFERENCES price_books(id),
    service_type_id INTEGER REFERENCES service_types(id),
    from_zone_id INTEGER REFERENCES pricing_zones(id),
    to_zone_id INTEGER REFERENCES pricing_zones(id),
    
    -- Logic tính toán
    min_weight FLOAT DEFAULT 0,
    max_weight FLOAT,
    base_price DECIMAL(15, 2) NOT NULL,
    
    -- Phụ phí vượt cân
    extra_weight_step FLOAT DEFAULT 0,
    extra_price_per_step DECIMAL(15, 2) DEFAULT 0
);

-- =============================================
-- MODULE 3: ORDER MANAGEMENT
-- =============================================

-- 10. Vận đơn (Parcels) - Bảng quan trọng nhất
CREATE TABLE IF NOT EXISTS parcels (
    id BIGSERIAL PRIMARY KEY,
    tracking_number VARCHAR(30) UNIQUE NOT NULL,
    
    -- Người gửi
    sender_id INTEGER REFERENCES customers(id),
    sender_name VARCHAR(100),        -- Lưu cứng text để không bị đổi khi customer update
    sender_phone VARCHAR(20),
    sender_address TEXT,
    sender_ward_id INTEGER REFERENCES administrative_units(id),
    
    -- Người nhận
    receiver_name VARCHAR(100),
    receiver_phone VARCHAR(20),
    receiver_address TEXT,
    receiver_ward_id INTEGER REFERENCES administrative_units(id),
    
    -- Hàng hóa
    weight_actual FLOAT NOT NULL,    -- kg
    weight_converted FLOAT,          -- kg (Dài*Rộng*Cao/cnst)
    dimensions VARCHAR(50),          -- "L x W x H"
    goods_value DECIMAL(15, 2),      -- Giá trị khai báo
    goods_content TEXT,
    
    -- Dịch vụ & Phí
    service_type_id INTEGER REFERENCES service_types(id),
    is_cod BOOLEAN DEFAULT FALSE,
    cod_amount DECIMAL(15, 2) DEFAULT 0,
    shipping_fee DECIMAL(15, 2) NOT NULL,
    insurance_fee DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'CASH', -- 'CASH', 'WALLET', 'SENDER_PAY', 'RECEIVER_PAY'
    
    -- Trạng thái & Vị trí
    status VARCHAR(30) DEFAULT 'ACCEPTED', 
    -- Enum: ACCEPTED, SORTING, TRANSPORTING, DELIVERING, DELIVERED, CANCELLED, RETURNING, RETURNED
    
    current_office_id INTEGER REFERENCES offices(id),
    
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_time TIMESTAMP
);

-- =============================================
-- MODULE 4: WAREHOUSE & LOGISTICS
-- =============================================

-- 11. Phương tiện vận tải
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(20),                -- 'TRUCK_500KG', 'TRUCK_5TON', 'MOTORBIKE'
    load_capacity_kg FLOAT,
    office_id INTEGER REFERENCES offices(id),
    status VARCHAR(20) DEFAULT 'AVAILABLE'
);

-- 12. Bao hàng / Sọt hàng (Container)
CREATE TABLE IF NOT EXISTS containers (
    id BIGSERIAL PRIMARY KEY,
    container_code VARCHAR(30) UNIQUE NOT NULL,
    type VARCHAR(20) DEFAULT 'BAG',  -- 'BAG', 'CAGE', 'BOX'
    
    origin_office_id INTEGER REFERENCES offices(id),
    destination_office_id INTEGER REFERENCES offices(id),
    current_office_id INTEGER REFERENCES offices(id),
    
    status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'CLOSED', 'RECEIVED'
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Chi tiết Bao hàng (Mapping 1 Bao chứa nhiều Đơn)
CREATE TABLE IF NOT EXISTS container_details (
    container_id BIGINT REFERENCES containers(id),
    parcel_id BIGINT REFERENCES parcels(id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (container_id, parcel_id)
);

-- 14. Bảng kê / Chuyến xe (Manifest)
CREATE TABLE IF NOT EXISTS manifests (
    id BIGSERIAL PRIMARY KEY,
    manifest_code VARCHAR(30) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL,       -- 'TRANSFER' (Giữa các Hub), 'DELIVERY' (Đi giao), 'PICKUP' (Đi lấy)
    
    source_office_id INTEGER REFERENCES offices(id),
    destination_office_id INTEGER REFERENCES offices(id),
    
    vehicle_id INTEGER REFERENCES vehicles(id),
    driver_id INTEGER REFERENCES users(id),
    
    status VARCHAR(20) DEFAULT 'CREATED', -- 'CREATED', 'IN_TRANSIT', 'COMPLETED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    departed_at TIMESTAMP,
    arrived_at TIMESTAMP
);

-- 15. Chi tiết Bảng kê - Chứa Bao (Dành cho xe tải luân chuyển)
CREATE TABLE IF NOT EXISTS manifest_containers (
    manifest_id BIGINT REFERENCES manifests(id),
    container_id BIGINT REFERENCES containers(id),
    PRIMARY KEY (manifest_id, container_id)
);

-- 16. Chi tiết Bảng kê - Chứa Đơn lẻ (Dành cho Shipper đi giao/lấy)
CREATE TABLE IF NOT EXISTS manifest_parcels (
    manifest_id BIGINT REFERENCES manifests(id),
    parcel_id BIGINT REFERENCES parcels(id),
    PRIMARY KEY (manifest_id, parcel_id)
);

-- =============================================
-- MODULE 5: LAST-MILE & TRACKING
-- =============================================

-- 17. Lịch sử hành trình (Tracking History)
CREATE TABLE IF NOT EXISTS tracking_events (
    id BIGSERIAL PRIMARY KEY,
    parcel_id BIGINT REFERENCES parcels(id),
    office_id INTEGER REFERENCES offices(id),
    status VARCHAR(30) NOT NULL,
    description TEXT,                -- Nội dung hiển thị cho khách
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Lượt giao hàng (Delivery Attempt)
CREATE TABLE IF NOT EXISTS delivery_attempts (
    id BIGSERIAL PRIMARY KEY,
    parcel_id BIGINT REFERENCES parcels(id),
    shipper_id INTEGER REFERENCES users(id),
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    status VARCHAR(20),              -- 'SUCCESS', 'FAILED'
    failure_reason VARCHAR(100),     -- 'KHACH_KHONG_NGHE', 'SAI_DIA_CHI'
    receiver_real_name VARCHAR(100), -- Người thực nhận
    
    pod_image_url TEXT,              -- Ảnh chụp bằng chứng (Proof of Delivery)
    signature_url TEXT,              -- Chữ ký
    gps_lat FLOAT,                   -- Tọa độ
    gps_long FLOAT
);

-- =============================================
-- MODULE 6: FINANCE & COD
-- =============================================

-- 19. Ví điện tử (Công nợ)
CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),       -- Ví Shipper
    customer_id INTEGER REFERENCES customers(id), -- Ví Shop
    balance DECIMAL(15, 2) DEFAULT 0,
    blocked_balance DECIMAL(15, 2) DEFAULT 0,   -- Tiền chờ đối soát
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (user_id IS NOT NULL OR customer_id IS NOT NULL)
);

-- 20. Giao dịch ví
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id BIGSERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES wallets(id),
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(30),                -- 'COD_COLLECT', 'SHIPPING_FEE', 'WITHDRAW'
    reference_code VARCHAR(50),      -- Mã đơn hoặc mã đối soát
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. Phiên đối soát COD (Cho khách hàng)
CREATE TABLE IF NOT EXISTS cod_statements (
    id BIGSERIAL PRIMARY KEY,
    statement_code VARCHAR(30) UNIQUE,
    customer_id INTEGER REFERENCES customers(id),
    
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    total_cod DECIMAL(15, 2) DEFAULT 0,
    total_fee DECIMAL(15, 2) DEFAULT 0,
    net_amount DECIMAL(15, 2) DEFAULT 0, -- = COD - Fee
    
    status VARCHAR(20) DEFAULT 'DRAFT',  -- 'DRAFT', 'CONFIRMED', 'PAID'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- MODULE 7: SUPPORT & SYSTEM
-- =============================================

-- 22. Sự cố / Khiếu nại
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    ticket_code VARCHAR(30) UNIQUE,
    parcel_id BIGINT REFERENCES parcels(id),
    type VARCHAR(50),                -- 'LOST', 'DAMAGED', 'LATE', 'WRONG_ROUTE'
    status VARCHAR(20) DEFAULT 'OPEN',
    priority VARCHAR(10) DEFAULT 'MEDIUM',
    
    created_by_user_id INTEGER REFERENCES users(id),
    assigned_to_office_id INTEGER REFERENCES offices(id),
    
    resolution_note TEXT,
    compensation_amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 23. Log thông báo (SMS/Email)
CREATE TABLE IF NOT EXISTS notification_logs (
    id BIGSERIAL PRIMARY KEY,
    recipient_type VARCHAR(20),      -- 'CUSTOMER', 'USER'
    recipient_id INTEGER,
    channel VARCHAR(20),             -- 'SMS', 'EMAIL', 'PUSH'
    content TEXT,
    status VARCHAR(20),              -- 'SENT', 'FAILED'
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);