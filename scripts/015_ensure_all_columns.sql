-- Ensure all required columns exist in orders table
DO $$ 
BEGIN
  -- Add price column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'price') THEN
    ALTER TABLE orders ADD COLUMN price NUMERIC;
    COMMENT ON COLUMN orders.price IS 'Product price at time of order';
  END IF;

  -- Add product_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'product_id') THEN
    ALTER TABLE orders ADD COLUMN product_id UUID REFERENCES products(id);
    COMMENT ON COLUMN orders.product_id IS 'Reference to the product';
  END IF;

  -- Add color column if it doesn't exist (should already exist based on schema)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'color') THEN
    ALTER TABLE orders ADD COLUMN color TEXT;
    COMMENT ON COLUMN orders.color IS 'Selected product color/variant';
  END IF;
END $$;

-- Ensure reviews table has required columns
DO $$
BEGIN
  -- Add images column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'reviews' AND column_name = 'images') THEN
    ALTER TABLE reviews ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN reviews.images IS 'Array of image URLs for the review';
  END IF;

  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'reviews' AND column_name = 'status') THEN
    ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'pending';
    COMMENT ON COLUMN reviews.status IS 'Review status: pending, approved, rejected';
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
