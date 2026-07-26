-- Make uzum_link nullable
ALTER TABLE products ALTER COLUMN uzum_link DROP NOT NULL;

-- Add default empty string if needed
UPDATE products SET uzum_link = '' WHERE uzum_link IS NULL;
