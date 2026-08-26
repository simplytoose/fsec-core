ALTER TABLE products
ADD COLUMN image_url VARCHAR(1000),
ADD COLUMN category VARCHAR(255);

ALTER TABLE orders
ADD COLUMN shipping_address TEXT,
ADD COLUMN payment_method VARCHAR(100);

-- Provide default values for existing orders
UPDATE orders SET shipping_address = 'N/A' WHERE shipping_address IS NULL;
UPDATE orders SET payment_method = 'CREDIT_CARD' WHERE payment_method IS NULL;

-- Make them non-null if we want, but since they are added later we can leave them nullable or set NOT NULL after default
-- ALTER TABLE orders ALTER COLUMN shipping_address SET NOT NULL;
-- ALTER TABLE orders ALTER COLUMN payment_method SET NOT NULL;
