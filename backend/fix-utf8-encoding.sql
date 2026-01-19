-- Fix UTF-8 encoding for order_comments table
-- Run this SQL script on your MySQL database

USE pms_db;

-- Change comment_text column to use UTF-8
ALTER TABLE order_comments 
MODIFY COLUMN comment_text TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- Verify the change
SHOW FULL COLUMNS FROM order_comments WHERE Field = 'comment_text';

-- Optional: Convert entire table to UTF-8 (if needed)
-- ALTER TABLE order_comments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Optional: Change database default charset (if needed)
-- ALTER DATABASE pms_db CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
