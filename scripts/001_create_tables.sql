-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description_uz TEXT,
  description_ru TEXT,
  price DECIMAL(12, 2) NOT NULL,
  old_price DECIMAL(12, 2),
  image_url TEXT NOT NULL,
  uzum_link TEXT NOT NULL,
  badge TEXT,
  badge_color TEXT DEFAULT 'orange',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carousel slides table
CREATE TABLE IF NOT EXISTS carousel_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL DEFAULT 'Do''konim',
  about_uz TEXT,
  about_ru TEXT,
  instagram_link TEXT,
  telegram_link TEXT,
  phone TEXT,
  address_uz TEXT,
  address_ru TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view products and settings)
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active carousel slides" ON carousel_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view store settings" ON store_settings FOR SELECT USING (true);

-- Admin policies using service role (for admin panel)
CREATE POLICY "Service role can do anything on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do anything on carousel_slides" ON carousel_slides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do anything on store_settings" ON store_settings FOR ALL USING (true) WITH CHECK (true);

-- Insert default store settings
INSERT INTO store_settings (store_name, about_uz, about_ru, instagram_link, telegram_link)
VALUES (
  'Premium Store',
  'Biz sifatli mahsulotlarni eng yaxshi narxlarda taqdim etamiz. Barcha mahsulotlar rasmiy kafolatga ega.',
  'Мы предлагаем качественные товары по лучшим ценам. Все товары имеют официальную гарантию.',
  'https://instagram.com/yourstore',
  'https://t.me/yourstore'
);

-- Insert sample products
INSERT INTO products (name_uz, name_ru, price, old_price, image_url, uzum_link, badge, badge_color) VALUES
('Simsiz quloqchin AirPods Pro', 'Беспроводные наушники AirPods Pro', 450000, 520000, '/placeholder.svg?height=300&width=300', 'https://uzum.uz', 'HIT', 'orange'),
('Samsung Galaxy A54', 'Samsung Galaxy A54', 3200000, 3800000, '/placeholder.svg?height=300&width=300', 'https://uzum.uz', 'YANGI', 'green'),
('Nike Air Max 270', 'Nike Air Max 270', 890000, 1200000, '/placeholder.svg?height=300&width=300', 'https://uzum.uz', '-26%', 'red'),
('Dyson V15 Changyutgich', 'Пылесос Dyson V15', 4500000, NULL, '/placeholder.svg?height=300&width=300', 'https://uzum.uz', NULL, NULL),
('Apple Watch Series 9', 'Apple Watch Series 9', 5200000, 5800000, '/placeholder.svg?height=300&width=300', 'https://uzum.uz', 'TOP', 'blue'),
('JBL Flip 6 Kolonka', 'Колонка JBL Flip 6', 680000, 750000, '/placeholder.svg?height=300&width=300', 'https://uzum.uz', '-9%', 'red'),
('Xiaomi Robot Vacuum', 'Робот-пылесос Xiaomi', 2100000, 2500000, '/placeholder.svg?height=300&width=300', 'https://uzum.uz', 'ARZON', 'orange'),
('PlayStation 5', 'PlayStation 5', 6800000, 7500000, '/placeholder.svg?height=300&width=300', 'https://uzum.uz', 'HIT', 'orange');

-- Insert sample carousel slides
INSERT INTO carousel_slides (image_url, link, sort_order) VALUES
('/placeholder.svg?height=400&width=1200', NULL, 1),
('/placeholder.svg?height=400&width=1200', NULL, 2),
('/placeholder.svg?height=400&width=1200', NULL, 3);
