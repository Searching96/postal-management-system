ALTER TABLE accounts
    DROP COLUMN phone_number;

ALTER TABLE customers
    MODIFY subscription_plan VARCHAR (255) NOT NULL;