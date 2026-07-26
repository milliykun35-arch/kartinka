-- Add payment_method column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pending';

-- Add comment for documentation
COMMENT ON COLUMN orders.payment_method IS 'Payment method: cash, transfer, online, or pending';
