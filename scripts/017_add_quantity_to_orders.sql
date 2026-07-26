-- Adding quantity column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;
