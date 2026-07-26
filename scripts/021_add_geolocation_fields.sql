-- Add geolocation fields to users and orders tables

-- Add address and location fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

-- Add latitude and longitude to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

-- Add index for faster geolocation queries
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_orders_location ON orders(latitude, longitude);

COMMENT ON COLUMN users.address IS 'User home address';
COMMENT ON COLUMN users.latitude IS 'Location latitude coordinate';
COMMENT ON COLUMN users.longitude IS 'Location longitude coordinate';
COMMENT ON COLUMN orders.latitude IS 'Order delivery latitude coordinate';
COMMENT ON COLUMN orders.longitude IS 'Order delivery longitude coordinate';
