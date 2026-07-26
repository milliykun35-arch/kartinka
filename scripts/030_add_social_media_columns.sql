-- Add facebook_link and whatsapp_number columns to store_settings table
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS facebook_link TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
