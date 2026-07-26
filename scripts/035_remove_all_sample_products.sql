-- Remove all sample products from database
-- This clears the products table so admin can add real products

-- First delete orders (they reference products)
DELETE FROM orders;

-- Delete all favorites (they reference products)
DELETE FROM favorites;

-- Delete all reviews (they reference products)  
DELETE FROM reviews;

-- Delete all product variants (they reference products)
DELETE FROM product_variants;

-- Delete all products
DELETE FROM products;

-- Clear admin notifications
DELETE FROM admin_notifications;
