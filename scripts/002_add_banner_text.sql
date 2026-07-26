-- Add banner text columns to store_settings
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS banner_text_uz TEXT DEFAULT 'Bepul yetkazib berish 500,000 so''mdan yuqori buyurtmalarga!',
ADD COLUMN IF NOT EXISTS banner_text_ru TEXT DEFAULT 'Бесплатная доставка от 500,000 сум!';
