-- Add images and status columns to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add discount_percentage to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS discount_percentage integer DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Create index for filtering approved reviews
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Update RLS policies for reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');
