-- Add holiday effects toggle
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS holiday_effects_enabled BOOLEAN DEFAULT true;
