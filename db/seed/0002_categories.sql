-- Add the category rows that were present in the legacy schema seed but
-- omitted from the initial D1 seed. This script is safe to run repeatedly.

INSERT INTO categories (id, name, slug) VALUES
('c0000000-0000-0000-0000-000000000001', 'Smartphones', 'smartphones'),
('c0000000-0000-0000-0000-000000000002', 'Cases', 'cases'),
('c0000000-0000-0000-0000-000000000003', 'Chargers', 'chargers'),
('c0000000-0000-0000-0000-000000000004', 'Earbuds', 'earbuds'),
('c0000000-0000-0000-0000-000000000005', 'Screen Protectors', 'screen_protectors'),
('c0000000-0000-0000-0000-000000000006', 'Power Banks', 'power_banks')
ON CONFLICT (id) DO NOTHING;

UPDATE products
SET category_id = 'c0000000-0000-0000-0000-000000000001'
WHERE id IN (
  'apple-iphone-15-pro-max',
  'samsung-galaxy-s24-ultra',
  'oneplus-12-5g'
)
AND category_id IS NULL;
