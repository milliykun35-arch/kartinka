-- Add image_url column to product_variants table
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment
COMMENT ON COLUMN product_variants.image_url IS 'Image URL for this specific color variant';
