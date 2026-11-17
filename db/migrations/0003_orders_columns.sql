-- Migration 0003: Add missing order logistics and payment tracking columns to orders table

ALTER TABLE orders ADD COLUMN customer_email TEXT;
ALTER TABLE orders ADD COLUMN subtotal REAL;
ALTER TABLE orders ADD COLUMN discount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN gst_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN delivery_fee REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN is_preorder INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN estimated_delivery_date TEXT;
ALTER TABLE orders ADD COLUMN actual_delivery_date TEXT;
ALTER TABLE orders ADD COLUMN pickup_date TEXT;
ALTER TABLE orders ADD COLUMN pickup_time TEXT;
ALTER TABLE orders ADD COLUMN pickup_otp TEXT;
ALTER TABLE orders ADD COLUMN collected_by TEXT;
ALTER TABLE orders ADD COLUMN collection_time TEXT;
ALTER TABLE orders ADD COLUMN delivery_partner TEXT;
ALTER TABLE orders ADD COLUMN delivery_executive_name TEXT;
ALTER TABLE orders ADD COLUMN delivery_executive_phone TEXT;
ALTER TABLE orders ADD COLUMN tracking_number TEXT;
ALTER TABLE orders ADD COLUMN transaction_id TEXT;
ALTER TABLE orders ADD COLUMN payment_screenshot TEXT;
ALTER TABLE orders ADD COLUMN refund_id TEXT;
ALTER TABLE orders ADD COLUMN return_reason TEXT;
ALTER TABLE orders ADD COLUMN return_approval_status TEXT;
ALTER TABLE orders ADD COLUMN refund_amount REAL;
ALTER TABLE orders ADD COLUMN refund_method TEXT;
ALTER TABLE orders ADD COLUMN refund_date TEXT;
