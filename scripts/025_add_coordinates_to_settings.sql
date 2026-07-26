-- Add latitude and longitude to store_settings table
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

-- Add comment
COMMENT ON COLUMN store_settings.latitude IS 'Do''kon manzili kenglik koordinatasi';
COMMENT ON COLUMN store_settings.longitude IS 'Do''kon manzili uzunlik koordinatasi';
