CREATE TABLE customers
(
    id BINARY (16) NOT NULL,
    created_at   datetime     NOT NULL,
    updated_at   datetime     NULL,
    deleted_at   datetime     NULL,
    account_id BINARY (16) NULL,
    full_name    VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    address      VARCHAR(255) NOT NULL,
    CONSTRAINT pk_customers PRIMARY KEY (id)
);

CREATE TABLE offices
(
    id BINARY (16) NOT NULL,
    created_at datetime NOT NULL,
    updated_at datetime NULL,
    deleted_at datetime NULL,
    CONSTRAINT pk_offices PRIMARY KEY (id)
);

ALTER TABLE customers
    ADD CONSTRAINT uc_customers_account UNIQUE (account_id);

ALTER TABLE customers
    ADD CONSTRAINT FK_CUSTOMERS_ON_ACCOUNT FOREIGN KEY (account_id) REFERENCES accounts (id);