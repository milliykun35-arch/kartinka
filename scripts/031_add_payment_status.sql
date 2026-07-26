-- Add payment_status column to orders table for tracking payment state
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Update existing orders to have payment_status based on payment_method
UPDATE orders 
SET payment_status = CASE 
  WHEN payment_method = 'online' THEN 'pending'
  WHEN payment_method = 'call' THEN 'pending'
  ELSE 'pending'
END
WHERE payment_status IS NULL;
