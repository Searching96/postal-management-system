CREATE TABLE accounts
(
    id BINARY (16) NOT NULL,
    created_at datetime     NOT NULL,
    updated_at datetime     NULL,
    deleted_at datetime     NULL,
    username   VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NULL,
    role_name  VARCHAR(255) NOT NULL,
    is_active  BIT(1)       NOT NULL,
    CONSTRAINT pk_accounts PRIMARY KEY (id)
);

CREATE TABLE administrative_regions
(
    id   INT          NOT NULL,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT pk_administrative_regions PRIMARY KEY (id)
);

CREATE TABLE administrative_units
(
    id        INT          NOT NULL,
    full_name VARCHAR(255) NULL,
    CONSTRAINT pk_administrative_units PRIMARY KEY (id)
);

CREATE TABLE employees
(
    id BINARY (16) NOT NULL,
    created_at   datetime     NOT NULL,
    updated_at   datetime     NULL,
    deleted_at   datetime     NULL,
    full_name    VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    CONSTRAINT pk_employees PRIMARY KEY (id)
);

CREATE TABLE provinces
(
    code                     VARCHAR(20)  NOT NULL,
    name                     VARCHAR(255) NOT NULL,
    administrative_region_id INT          NULL,
    administrative_unit_id   INT          NULL,
    CONSTRAINT pk_provinces PRIMARY KEY (code)
);

CREATE TABLE wards
(
    code                   VARCHAR(20)  NOT NULL,
    name                   VARCHAR(255) NOT NULL,
    province_code          VARCHAR(20)  NULL,
    administrative_unit_id INT          NULL,
    CONSTRAINT pk_wards PRIMARY KEY (code)
);

ALTER TABLE accounts
    ADD CONSTRAINT uc_accounts_email UNIQUE (email);

ALTER TABLE accounts
    ADD CONSTRAINT uc_accounts_username UNIQUE (username);

ALTER TABLE employees
    ADD CONSTRAINT uc_employees_phone_number UNIQUE (phone_number);

ALTER TABLE employees
    ADD CONSTRAINT FK_EMPLOYEES_ON_ID FOREIGN KEY (id) REFERENCES accounts (id);

ALTER TABLE provinces
    ADD CONSTRAINT FK_PROVINCES_ON_ADMINISTRATIVE_REGION FOREIGN KEY (administrative_region_id) REFERENCES administrative_regions (id);

ALTER TABLE provinces
    ADD CONSTRAINT FK_PROVINCES_ON_ADMINISTRATIVE_UNIT FOREIGN KEY (administrative_unit_id) REFERENCES administrative_units (id);

ALTER TABLE wards
    ADD CONSTRAINT FK_WARDS_ON_ADMINISTRATIVE_UNIT FOREIGN KEY (administrative_unit_id) REFERENCES administrative_units (id);

ALTER TABLE wards
    ADD CONSTRAINT FK_WARDS_ON_PROVINCE_CODE FOREIGN KEY (province_code) REFERENCES provinces (code);