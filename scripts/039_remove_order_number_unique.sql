-- Remove unique constraint from order_number to allow multiple items per order
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_number_key;

-- Add index for faster lookups (not unique)
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
