-- Add payment_status and order_number columns to orders table

-- Add payment_status column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'awaiting';

-- Add order_number column for grouping orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;

-- Update existing orders to have 'paid' status
UPDATE orders SET payment_status = 'paid' WHERE payment_status IS NULL OR payment_status = 'awaiting';
