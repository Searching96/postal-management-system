ALTER TABLE customers
    MODIFY customer_type VARCHAR (255) NOT NULL;

ALTER TABLE accounts
    MODIFY email VARCHAR (255) NOT NULL;

ALTER TABLE customers
    MODIFY subscription_plan VARCHAR (255) NOT NULL;