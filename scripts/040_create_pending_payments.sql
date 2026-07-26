-- Create pending_payments table to store cart data until payment is confirmed
CREATE TABLE IF NOT EXISTS pending_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  payment_method TEXT NOT NULL,
  delivery_method TEXT,
  delivery_fee INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  items JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes')
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_payments_order_number ON pending_payments(order_number);
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON pending_payments(status);
