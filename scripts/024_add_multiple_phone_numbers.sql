-- Add support for multiple phone numbers and additional contact fields
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS phone_numbers jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS card_visa text,
ADD COLUMN IF NOT EXISTS card_holder text,
ADD COLUMN IF NOT EXISTS working_hours_uz text DEFAULT 'Dushanba-Juma: 09:00-19:00, Shanba: 09:00-17:00, Yakshanba: Dam olish',
ADD COLUMN IF NOT EXISTS working_hours_ru text DEFAULT 'Понедельник-Пятница: 09:00-19:00, Суббота: 09:00-17:00, Воскресенье: Выходной';

-- Update default phone_numbers with main phone
UPDATE store_settings 
SET phone_numbers = jsonb_build_array(
  jsonb_build_object('number', COALESCE(phone, '+998 90 123 45 67'), 'label', 'Asosiy')
)
WHERE phone_numbers = '[]'::jsonb OR phone_numbers IS NULL;
