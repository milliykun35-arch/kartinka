-- Add price column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price NUMERIC;

-- Add product_id if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);

-- Add comments for clarity
COMMENT ON COLUMN orders.price IS 'Product price at time of order';
COMMENT ON COLUMN orders.color IS 'Selected product color/variant';
