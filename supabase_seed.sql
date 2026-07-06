-- SUPABASE SQL SEED SCRIPT
-- Copy and execute this script inside your Supabase SQL Editor.

-- 1. Insert Sample Banners
INSERT INTO banners (id, title, subtitle, image_url, active, priority, redirect_link, slideshow_timer) VALUES
('banner-1', 'iPhone 15 Pro Max', 'Titanium Design & A17 Pro Chip', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200&auto=format&fit=crop', true, 1, 'product/apple-iphone-15-pro-max', 5),
('banner-2', 'Galaxy S24 Ultra', 'Samsung Galaxy AI is Here', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200&auto=format&fit=crop', true, 2, 'product/samsung-galaxy-s24-ultra', 5),
('banner-3', 'Premium Pre-Owned Mobiles', 'Certified 40+ Points Checked Devices', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop', true, 3, 'filter/deviceType/used', 5)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  image_url = EXCLUDED.image_url,
  active = EXCLUDED.active,
  priority = EXCLUDED.priority,
  redirect_link = EXCLUDED.redirect_link,
  slideshow_timer = EXCLUDED.slideshow_timer;

-- 2. Insert Sample Products
INSERT INTO products (
  id, name, brand, price, discount_price, stock, category, images, specifications, features, colors, description, variant, ram, storage, status, views, sales
) VALUES
(
  'apple-iphone-15-pro-max',
  'iPhone 15 Pro Max',
  'Apple',
  159900,
  148900,
  5,
  'brand_new',
  '["https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1695048133107-1b076f8de644?q=80&w=800&auto=format&fit=crop"]'::jsonb,
  '{"display": "6.7-inch Super Retina XDR OLED, 120Hz, HDR10, Dolby Vision, 2000 nits (peak)", "processor": "Apple A17 Pro (3 nm) Hexa-core CPU, 6-core GPU", "ram": "8GB LPDDR5", "storage": "256GB NVMe", "battery": "4441 mAh, Li-Ion, non-removable", "charging": "USB-PD 2.0, 50% charge in 30 min, 15W wireless (MagSafe)", "camera": "48 MP Main + 12 MP Telephoto + 12 MP Ultra Wide", "weight": "221g", "connectivity": "5G, Wi-Fi 6e, Bluetooth 5.3, NFC, USB Type-C 3.0", "warranty": "1 Year Brand Warranty"}'::jsonb,
  '["Aerospace-grade titanium design is lightweight yet extremely robust.", "A17 Pro chip delivers industry-leading graphics and gaming performance.", "Pro Camera system with 5x optical zoom on iPhone 15 Pro Max.", "Customizable Action button to launch your favorite feature instantly."]'::jsonb,
  '["Natural Titanium", "Blue Titanium", "Black Titanium", "White Titanium"]'::jsonb,
  'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
  '256GB',
  '8GB',
  '256GB',
  'available',
  120,
  5
),
(
  'samsung-galaxy-s24-ultra',
  'Galaxy S24 Ultra',
  'Samsung',
  139999,
  129999,
  4,
  'brand_new',
  '["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop"]'::jsonb,
  '{"display": "6.8-inch Dynamic AMOLED 2X, 120Hz, HDR10+, 2600 nits (peak)", "processor": "Snapdragon 8 Gen 3 for Galaxy (4 nm)", "ram": "12GB LPDDR5X", "storage": "512GB UFS 4.0", "battery": "5000 mAh, non-removable", "charging": "45W wired, 15W wireless", "camera": "200 MP Main + 50 MP Periscope + 10 MP Telephoto + 12 MP Ultra Wide", "weight": "232g", "connectivity": "5G, Wi-Fi 7, Bluetooth 5.3, NFC, USB Type-C 3.2", "warranty": "1 Year Brand Warranty"}'::jsonb,
  '["Galaxy AI powers search, translation, and advanced photography.", "Titanium frame with Gorilla Armor glass offers unparalleled durability.", "Embedded S Pen lets you write, sketch, and navigate with precision."]'::jsonb,
  '["Titanium Gray", "Titanium Black", "Titanium Violet", "Titanium Yellow"]'::jsonb,
  'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.',
  '512GB',
  '12GB',
  '512GB',
  'available',
  95,
  3
),
(
  'oneplus-12-5g',
  'OnePlus 12',
  'OnePlus',
  69999,
  64999,
  8,
  'brand_new',
  '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop"]'::jsonb,
  '{"display": "6.82-inch LTPO AMOLED, 120Hz, HDR10+, 4500 nits (peak)", "processor": "Snapdragon 8 Gen 3 (4 nm)", "ram": "16GB LPDDR5X", "storage": "512GB UFS 4.0", "battery": "5400 mAh, non-removable", "charging": "100W wired (SuperVOOC), 50W wireless", "camera": "50 MP Main + 64 MP Periscope + 48 MP Ultra Wide", "weight": "220g", "connectivity": "5G, Wi-Fi 7, Bluetooth 5.4, NFC, USB Type-C 3.2", "warranty": "1 Year Brand Warranty"}'::jsonb,
  '["4th Gen Hasselblad Camera System for Mobile.", "Ultra-fast 100W wired and 50W wireless charging.", "Breathtaking 2K 120Hz display with 4500 nits peak brightness."]'::jsonb,
  '["Flowy Emerald", "Silky Black"]'::jsonb,
  'Redefined flagship specifications. Incorporates Snapdragon 8 Gen 3, Hasselblad Triple Camera system, and industry-leading cooling system.',
  '512GB',
  '16GB',
  '512GB',
  'available',
  74,
  2
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  stock = EXCLUDED.stock,
  category = EXCLUDED.category,
  images = EXCLUDED.images,
  specifications = EXCLUDED.specifications,
  features = EXCLUDED.features,
  colors = EXCLUDED.colors,
  description = EXCLUDED.description,
  variant = EXCLUDED.variant,
  ram = EXCLUDED.ram,
  storage = EXCLUDED.storage,
  status = EXCLUDED.status;

-- 3. Insert Default Super Admin User
INSERT INTO users (id, email, role) VALUES
('00000000-0000-0000-0000-000000000001', 'superadmin@srisaimobiles.com', 'super_admin'),
('00000000-0000-0000-0000-000000000002', 'admin@srisaimobiles.com', 'admin')
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role;

-- 4. Initialize Analytics Row
INSERT INTO analytics (id, daily_sales, monthly_sales, visitors, conversion_rate) VALUES
('analytics-main', 12500, 375000, 1420, 2.8)
ON CONFLICT (id) DO NOTHING;

-- 5. Create Accessories and Flash Sales Tables (If they don't exist)
CREATE TABLE IF NOT EXISTS accessories (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  stock INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  colors JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'available',
  specifications JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  views INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS flash_sales (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  discount_percentage NUMERIC DEFAULT 0,
  stock_limit INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  start_time TEXT,
  end_time TEXT,
  enabled BOOLEAN DEFAULT true NOT NULL
);

-- Enable Row Level Security & Policies for Accessories and Flash Sales
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;

-- Drop existing if any, and create clean policies
DROP POLICY IF EXISTS "Allow public select accessories" ON accessories;
CREATE POLICY "Allow public select accessories" ON accessories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admins insert accessories" ON accessories;
CREATE POLICY "Allow admins insert accessories" ON accessories FOR INSERT TO authenticated WITH CHECK (exists (select 1 from users where id = auth.uid() and role in ('admin', 'super_admin')));
DROP POLICY IF EXISTS "Allow admins update accessories" ON accessories;
CREATE POLICY "Allow admins update accessories" ON accessories FOR UPDATE TO authenticated USING (exists (select 1 from users where id = auth.uid() and role in ('admin', 'super_admin')));
DROP POLICY IF EXISTS "Allow super_admin delete accessories" ON accessories;
CREATE POLICY "Allow super_admin delete accessories" ON accessories FOR DELETE TO authenticated USING (exists (select 1 from users where id = auth.uid() and role = 'super_admin'));

DROP POLICY IF EXISTS "Allow public select flash_sales" ON flash_sales;
CREATE POLICY "Allow public select flash_sales" ON flash_sales FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admins insert flash_sales" ON flash_sales;
CREATE POLICY "Allow admins insert flash_sales" ON flash_sales FOR INSERT TO authenticated WITH CHECK (exists (select 1 from users where id = auth.uid() and role in ('admin', 'super_admin')));
DROP POLICY IF EXISTS "Allow admins update flash_sales" ON flash_sales;
CREATE POLICY "Allow admins update flash_sales" ON flash_sales FOR UPDATE TO authenticated USING (exists (select 1 from users where id = auth.uid() and role in ('admin', 'super_admin')));
DROP POLICY IF EXISTS "Allow super_admin delete flash_sales" ON flash_sales;
CREATE POLICY "Allow super_admin delete flash_sales" ON flash_sales FOR DELETE TO authenticated USING (exists (select 1 from users where id = auth.uid() and role = 'super_admin'));

-- Safely add tables to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  EXCEPTION WHEN duplicate_object OR others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE banners;
  EXCEPTION WHEN duplicate_object OR others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  EXCEPTION WHEN duplicate_object OR others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
  EXCEPTION WHEN duplicate_object OR others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE analytics;
  EXCEPTION WHEN duplicate_object OR others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE accessories;
  EXCEPTION WHEN duplicate_object OR others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE flash_sales;
  EXCEPTION WHEN duplicate_object OR others THEN NULL;
  END;
END $$;
