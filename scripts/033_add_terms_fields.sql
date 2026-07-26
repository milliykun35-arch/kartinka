-- Add terms and privacy policy fields to store_settings
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS terms_uz TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS terms_ru TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS privacy_uz TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS privacy_ru TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS return_policy_uz TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS return_policy_ru TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS warranty_uz TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS warranty_ru TEXT DEFAULT '';
