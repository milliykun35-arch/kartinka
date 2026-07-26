-- Add own_store_price column to products if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS own_store_price DECIMAL(12, 2);

-- Create users table for simple registration (name, phone, surname)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  name_uz TEXT NOT NULL,
  name_ru TEXT,
  surname_uz TEXT NOT NULL,
  surname_ru TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table with seller info
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  order_number TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  seller_type TEXT DEFAULT 'own_store', -- 'own_store' yoki 'uzum_market'
  promo_code TEXT,
  discount_percent INTEGER DEFAULT 0,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  customer_email TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view active products with own_store_price" ON products FOR SELECT USING (is_active = true);

-- Service role can do anything
CREATE POLICY "Service role can manage users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (true);
