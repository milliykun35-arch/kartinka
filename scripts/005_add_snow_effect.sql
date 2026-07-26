-- Add snow effect toggle to store settings
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS snow_effect_enabled BOOLEAN DEFAULT true;
