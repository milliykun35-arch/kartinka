-- Add card number columns to store_settings table for payment information

ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS card_uzcard TEXT,
ADD COLUMN IF NOT EXISTS card_humo TEXT;

-- Update with default values if needed
UPDATE store_settings
SET 
  card_uzcard = '8600 1234 5678 9012',
  card_humo = '9860 1234 5678 9012'
WHERE card_uzcard IS NULL;
