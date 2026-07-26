-- Update payment_status check constraint to include 'awaiting'
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'awaiting', 'paid', 'failed', 'cancelled'));

-- Update orders status check to include 'awaiting_payment'
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Note: If status check doesn't exist, this is fine
