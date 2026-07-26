-- Make product_id nullable in orders table
-- This allows orders to exist even if products are deleted

-- First drop the existing foreign key constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_product_id_fkey;

-- Make product_id nullable
ALTER TABLE orders ALTER COLUMN product_id DROP NOT NULL;

-- Add back the foreign key with ON DELETE SET NULL
ALTER TABLE orders ADD CONSTRAINT orders_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
