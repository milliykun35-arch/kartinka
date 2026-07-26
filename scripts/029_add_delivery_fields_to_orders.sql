-- Orders table'ga yetkazish xizmati va topshirish punkti qo'shish
ALTER TABLE orders 
ADD COLUMN delivery_service TEXT,
ADD COLUMN pickup_location TEXT,
ADD COLUMN pickup_shown BOOLEAN DEFAULT FALSE;

-- pickup_shown - foydalanuvchi popup'ni ko'rgan-ko'rmagani
COMMENT ON COLUMN orders.delivery_service IS 'Yetkazish xizmati nomi (BIS Pochta, O''zbekiston Pochtasi, va h.k.)';
COMMENT ON COLUMN orders.pickup_location IS 'Topshirish punktining manzili';
COMMENT ON COLUMN orders.pickup_shown IS 'Foydalanuvchi popup''ni ko''rdimi?';
