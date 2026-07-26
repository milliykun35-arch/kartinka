-- Add colors column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors jsonb DEFAULT '[]'::jsonb;

-- Add image_urls column to products table for multiple images
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls jsonb DEFAULT '[]'::jsonb;

-- Update existing products to have image_url in image_urls array
UPDATE products 
SET image_urls = jsonb_build_array(image_url)
WHERE image_urls = '[]'::jsonb AND image_url IS NOT NULL;
