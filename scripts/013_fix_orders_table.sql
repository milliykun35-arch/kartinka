-- Add missing color column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS color TEXT;

-- Add product_name column for better order tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Add product_image column for visual order tracking  
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_image TEXT;
