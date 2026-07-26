-- Sevimlilar jadvali
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_fingerprint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_fingerprint)
);

-- Izohlar va reytinglar jadvali
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_fingerprint TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'Mehmon',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products jadvaliga rating ustunlari qo'shish
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 5.0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS favorites_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS admin_rating NUMERIC(2,1) DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_rating NUMERIC(2,1) DEFAULT 4.4;

-- RLS policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view favorites count" ON favorites FOR SELECT USING (true);
CREATE POLICY "Anyone can add to favorites" ON favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove from favorites" ON favorites FOR DELETE USING (true);
CREATE POLICY "Service role can do anything on favorites" ON favorites FOR ALL USING (true);

CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can add reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can do anything on reviews" ON reviews FOR ALL USING (true);
