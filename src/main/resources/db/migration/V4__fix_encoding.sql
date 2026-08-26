-- Fix corrupted Cyrillic characters from previous seed migration
UPDATE products SET description = 'Next generation gaming console with ultra-high speed SSD and ray tracing support.' WHERE title = 'Sony PlayStation 5';
UPDATE products SET description = 'Wireless noise-cancelling headphones with industry-leading sound quality.' WHERE title = 'Sony WH-1000XM5';
UPDATE products SET description = 'High performance gaming mouse with optical switches and 25K DPI sensor.' WHERE title = 'Logitech G Pro X Superlight';
