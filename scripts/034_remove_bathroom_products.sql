-- Remove bathroom/hammom related products and categories
DELETE FROM products WHERE category_id IN (
  SELECT id FROM categories WHERE name_uz ILIKE '%hammom%' OR name_ru ILIKE '%ванн%'
);

DELETE FROM categories WHERE name_uz ILIKE '%hammom%' OR name_ru ILIKE '%ванн%';

-- Also remove any orphaned products without valid categories
DELETE FROM products WHERE category_id NOT IN (SELECT id FROM categories);
