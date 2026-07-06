-- SRI SAI MOBILLES - DATABASE MIGRATION SCRIPT
-- RUN THIS SCRIPT IN THE SUPABASE SQL EDITOR TO INITIALIZE THE DATABASE

-- Drop Existing Tables (If they exist) to avoid conflicts
DROP TABLE IF EXISTS compare_items CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS flash_sales CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS dashboard_analytics CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS accessories CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Auto-update updated_at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Create Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER update_categories_modtime
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'customer' NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER update_users_modtime
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Create Products Table (Phones / Devices)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  stock INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  variant TEXT,
  ram TEXT,
  storage TEXT,
  processor TEXT,
  display TEXT,
  battery TEXT,
  charging TEXT,
  cameras TEXT,
  weight TEXT,
  warranty TEXT,
  video_url TEXT,
  status TEXT DEFAULT 'available',
  views INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Preowned fields
  factory_sealed BOOLEAN,
  official_brand_warranty BOOLEAN,
  warranty_duration TEXT,
  launch_date TEXT,
  invoice_available BOOLEAN,
  ownership TEXT,
  used_duration TEXT,
  original_purchase_date TEXT,
  purchase_bill_available BOOLEAN,
  box_available BOOLEAN,
  original_charger_available BOOLEAN,
  original_cable_available BOOLEAN,
  earphones_available BOOLEAN,
  back_cover_available BOOLEAN,
  screen_guard_applied BOOLEAN,
  current_warranty_status TEXT,
  warranty_expiry_date TEXT,
  battery_health INTEGER,
  condition_grade TEXT,
  cosmetic_description TEXT,
  display_condition TEXT,
  frame_condition TEXT,
  back_panel_condition TEXT,
  biometric_status TEXT,
  camera_condition TEXT,
  speaker_condition TEXT,
  microphone_condition TEXT,
  network_lock_status TEXT,
  repair_history TEXT,
  repair_description TEXT,
  quality_checks JSONB DEFAULT '[]'::jsonb,
  seller_notes TEXT,

  -- Open box fields
  open_box_box BOOLEAN,
  open_box_accessories BOOLEAN,
  open_box_warranty TEXT,
  open_box_activation TEXT,
  open_box_reason TEXT,

  -- Refurbished fields
  refurbished_grade TEXT,
  refurbished_parts TEXT,
  refurbished_date TEXT,
  refurbished_by TEXT,
  refurbished_warranty TEXT,

  -- Demo unit fields
  demo_duration TEXT,
  demo_hours TEXT,
  demo_condition TEXT,
  demo_warranty TEXT,

  -- Instagram fields
  seen_on_instagram BOOLEAN,
  instagram_url TEXT
);

CREATE TRIGGER update_products_modtime
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category_id);

-- 4. Create Accessories Table
CREATE TABLE accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'cases' NOT NULL,
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
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER update_accessories_modtime
  BEFORE UPDATE ON accessories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_accessories_brand ON accessories(brand);
CREATE INDEX idx_accessories_category ON accessories(category_id);

-- 5. Create Inventory Table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  stock_count INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER update_inventory_modtime
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Create Banners Table
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  priority INTEGER DEFAULT 0 NOT NULL,
  redirect_link TEXT,
  start_date TEXT,
  end_date TEXT,
  slideshow_timer INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER update_banners_modtime
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Create Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address JSONB NOT NULL,
  products JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  payment_method TEXT DEFAULT 'cod' NOT NULL,
  payment_status TEXT DEFAULT 'pending' NOT NULL,
  delivery_type TEXT DEFAULT 'home_delivery' NOT NULL,
  timeline JSONB DEFAULT '[]'::jsonb,
  internal_notes JSONB DEFAULT '[]'::jsonb,
  call_logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER update_orders_modtime
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- 8. Create Dashboard Analytics Table
CREATE TABLE dashboard_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_sales NUMERIC DEFAULT 0 NOT NULL,
  monthly_sales NUMERIC DEFAULT 0 NOT NULL,
  visitors INTEGER DEFAULT 0 NOT NULL,
  conversion_rate NUMERIC DEFAULT 0.0 NOT NULL,
  total_orders INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER update_analytics_modtime
  BEFORE UPDATE ON dashboard_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Create Settings Table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT DEFAULT 'Sri Sai Mobiles' NOT NULL,
  store_address TEXT NOT NULL,
  store_phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  default_greeting TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER update_settings_modtime
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Create Flash Sales Table
CREATE TABLE flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  discount_percentage NUMERIC DEFAULT 0 NOT NULL,
  stock_limit INTEGER DEFAULT 0 NOT NULL,
  sold_count INTEGER DEFAULT 0 NOT NULL,
  start_time TEXT,
  end_time TEXT,
  enabled BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER update_flash_sales_modtime
  BEFORE UPDATE ON flash_sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Create Addresses Table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  house_number TEXT,
  apartment_name TEXT,
  street_name TEXT,
  landmark TEXT,
  area_colony TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER update_addresses_modtime
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- 12. Create Wishlist Table
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT DEFAULT 'product' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- 13. Create Cart Items Table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT DEFAULT 'product' NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  selected_color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER update_cart_items_modtime
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_cart_items_user ON cart_items(user_id);

-- 14. Create Compare Items Table
CREATE TABLE compare_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_compare_items_user ON compare_items(user_id);

-- ===================================================
-- SEED INITIAL DATA (all IDs use valid hex-only UUIDs)
-- ===================================================

-- Categories Seeds
INSERT INTO categories (id, name, slug) VALUES
('c0000000-0000-0000-0000-000000000001', 'Smartphones', 'smartphones'),
('c0000000-0000-0000-0000-000000000002', 'Cases', 'cases'),
('c0000000-0000-0000-0000-000000000003', 'Chargers', 'chargers'),
('c0000000-0000-0000-0000-000000000004', 'Earbuds', 'earbuds'),
('c0000000-0000-0000-0000-000000000005', 'Screen Protectors', 'screen_protectors'),
('c0000000-0000-0000-0000-000000000006', 'Power Banks', 'power_banks');

-- Users Seeds (u→aa prefix fix)
INSERT INTO users (id, email, role, name, phone) VALUES
('aa000000-0000-0000-0000-000000000001', 'superadmin@srisaimobiles.com', 'super_admin', 'Sri Sai Super Admin', '+91 8688303048'),
('aa000000-0000-0000-0000-000000000002', 'admin@srisaimobiles.com', 'admin', 'Store Admin', '+91 8688303048');

-- Banners Seeds
INSERT INTO banners (id, title, subtitle, image_url, active, priority, redirect_link, slideshow_timer) VALUES
('b0000000-0000-0000-0000-000000000001', 'iPhone 15 Pro Max', 'Titanium Design & A17 Pro Chip', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200&auto=format&fit=crop', true, 1, 'home', 5),
('b0000000-0000-0000-0000-000000000002', 'Samsung Galaxy AI is Here', 'Experience Galaxy S24 Ultra', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200&auto=format&fit=crop', true, 2, 'home', 5),
('b0000000-0000-0000-0000-000000000003', 'Accessories Bonanza', 'Cases & Chargers at Best Prices', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200&auto=format&fit=crop', true, 3, 'accessories', 5),
('b0000000-0000-0000-0000-000000000004', 'Hot Flash Sales', 'Limited Time Discounts on Premium Devices', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop', true, 4, 'home', 5);

-- Products Seeds (15 Premium Mobile Products) (p→ab prefix fix)
INSERT INTO products (
  id, category_id, brand, name, price, discount_price, stock, category, images, specifications, features, colors, description, variant, ram, storage, status, views, sales
) VALUES
-- 1. Apple
('ab000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Apple', 'iPhone 15 Pro Max', 159900, 148900, 5, 'brand_new', '["https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.7-inch Super Retina XDR OLED", "processor": "A17 Pro", "battery": "4441 mAh", "camera": "48MP + 12MP + 12MP"}'::jsonb, '["Titanium Frame", "A17 Pro Chip", "5x Telephoto Zoom"]'::jsonb, '["Natural Titanium", "Blue Titanium"]'::jsonb, 'Premium titanium design with powerful zoom capability.', '256GB', '8GB', '256GB', 'available', 300, 10),
('ab000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Apple', 'iPhone 15', 79900, 72900, 8, 'brand_new', '["https://images.unsplash.com/photo-1695048133107-1b076f8de644?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.1-inch OLED", "processor": "A16 Bionic", "battery": "3349 mAh", "camera": "48MP + 12MP"}'::jsonb, '["Dynamic Island", "USB-C Port", "A16 Bionic"]'::jsonb, '["Black", "Blue", "Green"]'::jsonb, 'The classic iPhone experience with Dynamic Island and USB-C.', '128GB', '6GB', '128GB', 'available', 150, 4),
('ab000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Apple', 'iPhone 14 Pro', 129900, 115900, 4, 'used', '["https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.1-inch OLED", "processor": "A16 Bionic", "battery": "3200 mAh", "camera": "48MP + 12MP + 12MP"}'::jsonb, '["Always-On Display", "Dynamic Island", "48MP Main Camera"]'::jsonb, '["Deep Purple", "Space Black"]'::jsonb, 'Pro phone with A16 Bionic and unique Always-On display.', '256GB', '6GB', '256GB', 'available', 180, 6),
('ab000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Apple', 'iPhone 13', 59900, 52900, 10, 'used', '["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.1-inch OLED", "processor": "A15 Bionic", "battery": "3240 mAh", "camera": "12MP + 12MP"}'::jsonb, '["Super Retina display", "A15 Bionic", "Dual Camera"]'::jsonb, '["Midnight", "Starlight", "Blue"]'::jsonb, 'Incredible value iPhone with outstanding battery life.', '128GB', '4GB', '128GB', 'available', 90, 2),

-- 2. Samsung
('ab000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Samsung', 'Galaxy S24 Ultra', 139900, 129900, 3, 'brand_new', '["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.8-inch AMOLED 2X", "processor": "Snapdragon 8 Gen 3", "battery": "5000 mAh", "camera": "200MP + 50MP + 12MP + 10MP"}'::jsonb, '["Galaxy AI", "S Pen Embedded", "Titanium Frame"]'::jsonb, '["Titanium Gray", "Titanium Black"]'::jsonb, 'Samsung flagship with industry leading camera and AI.', '512GB', '12GB', '512GB', 'available', 250, 8),
('ab000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'Samsung', 'Galaxy S24+', 99900, 89900, 6, 'brand_new', '["https://images.unsplash.com/photo-1610945415295-d9bdf067e581?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.7-inch QHD+ AMOLED", "processor": "Exynos 2400", "battery": "4900 mAh", "camera": "50MP + 10MP + 12MP"}'::jsonb, '["Galaxy AI", "QHD+ Display", "Armor Aluminum"]'::jsonb, '["Onyx Black", "Marble Gray"]'::jsonb, 'Gorgeous display and powerful processor in a plus size.', '256GB', '12GB', '256GB', 'available', 120, 3),
('ab000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'Samsung', 'Galaxy A55 5G', 44900, 39900, 12, 'brand_new', '["https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.6-inch AMOLED", "processor": "Exynos 1480", "battery": "5000 mAh", "camera": "50MP + 12MP + 5MP"}'::jsonb, '["IP67 Rating", "Gorilla Glass Victus+", "Exynos 1480"]'::jsonb, '["Awesome Ice Blue", "Awesome Navy"]'::jsonb, 'Best-in-class mid-ranger with premium build and display.', '128GB', '8GB', '128GB', 'available', 160, 5),

-- 3. OnePlus
('ab000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'OnePlus', 'OnePlus 12', 69999, 64999, 5, 'brand_new', '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.82-inch AMOLED", "processor": "Snapdragon 8 Gen 3", "battery": "5400 mAh", "camera": "50MP + 64MP + 48MP"}'::jsonb, '["100W Charging", "Hasselblad Camera", "Snapdragon 8 Gen 3"]'::jsonb, '["Flowy Emerald", "Silky Black"]'::jsonb, 'Powerhouse flagship with Hasselblad partnership and 100W charging.', '512GB', '16GB', '512GB', 'available', 190, 7),
('ab000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', 'OnePlus', 'OnePlus Nord CE4', 26999, 24999, 7, 'brand_new', '["https://images.unsplash.com/photo-1598327106026-d9521da673d1?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.7-inch AMOLED", "processor": "Snapdragon 7 Gen 3", "battery": "5500 mAh", "camera": "50MP + 8MP"}'::jsonb, '["100W SuperVOOC", "Snapdragon 7 Gen 3", "Fluid AMOLED"]'::jsonb, '["Dark Chrome", "Celadon Marble"]'::jsonb, 'Super fast charging and smooth performance under budget.', '128GB', '8GB', '128GB', 'available', 110, 4),

-- 4. Nothing
('ab000000-0000-0000-0000-00000000000a', 'c0000000-0000-0000-0000-000000000001', 'Nothing', 'Phone (2)', 44999, 39999, 9, 'brand_new', '["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.7-inch LTPO OLED", "processor": "Snapdragon 8+ Gen 1", "battery": "4700 mAh", "camera": "50MP + 50MP"}'::jsonb, '["Glyph Interface 2.0", "Nothing OS 2.0", "LTPO OLED"]'::jsonb, '["Dark Grey", "White"]'::jsonb, 'Unique transparent design with Glyph notification lights.', '256GB', '12GB', '256GB', 'available', 220, 5),
('ab000000-0000-0000-0000-00000000000b', 'c0000000-0000-0000-0000-000000000001', 'Nothing', 'Phone (2a)', 25999, 23999, 4, 'brand_new', '["https://images.unsplash.com/photo-1610945415295-d9bdf067e581?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.7-inch OLED", "processor": "Dimensity 7200 Pro", "battery": "5000 mAh", "camera": "50MP + 50MP"}'::jsonb, '["Glyph Interface Light", "Dimensity 7200 Pro", "Nothing OS"]'::jsonb, '["Black", "White"]'::jsonb, 'Budget Nothing phone with iconic design and solid battery.', '128GB', '8GB', '128GB', 'available', 140, 3),

-- 5. Xiaomi
('ab000000-0000-0000-0000-00000000000c', 'c0000000-0000-0000-0000-000000000001', 'Xiaomi', 'Xiaomi 14', 79999, 69999, 3, 'brand_new', '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.36-inch LTPO OLED", "processor": "Snapdragon 8 Gen 3", "battery": "4610 mAh", "camera": "50MP + 50MP + 50MP"}'::jsonb, '["Leica Lens Optic", "Compact Flagship", "90W HyperCharge"]'::jsonb, '["Black", "Jade Green"]'::jsonb, 'Compact premium smartphone with incredible Leica optics.', '512GB', '12GB', '512GB', 'available', 110, 2),

-- 6. Vivo
('ab000000-0000-0000-0000-00000000000d', 'c0000000-0000-0000-0000-000000000001', 'Vivo', 'V30 Pro 5G', 46999, 41999, 6, 'brand_new', '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.78-inch AMOLED", "processor": "Dimensity 8200", "battery": "5000 mAh", "camera": "50MP + 50MP + 50MP"}'::jsonb, '["Zeiss Professional Portrait", "Aura Light Portrait", "AMOLED 120Hz"]'::jsonb, '["Andaman Blue", "Classic Black"]'::jsonb, 'Zeiss camera portrait expertise with slim design.', '256GB', '8GB', '256GB', 'available', 80, 1),

-- 7. Oppo
('ab000000-0000-0000-0000-00000000000e', 'c0000000-0000-0000-0000-000000000001', 'Oppo', 'Reno11 Pro 5G', 39999, 36999, 5, 'brand_new', '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.7-inch OLED", "processor": "Dimensity 8200", "battery": "4600 mAh", "camera": "50MP + 32MP + 8MP"}'::jsonb, '["Ultra-Clear Portrait Camera", "80W SuperVOOC", "ColorOS"]'::jsonb, '["Pearl White", "Rock Grey"]'::jsonb, 'Premium design and super fast charging curves.', '256GB', '12GB', '256GB', 'available', 75, 2),
('ab000000-0000-0000-0000-00000000000f', 'c0000000-0000-0000-0000-000000000001', 'Oppo', 'F25 Pro 5G', 25999, 23999, 10, 'brand_new', '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop"]'::jsonb, '{"display": "6.7-inch AMOLED", "processor": "Dimensity 7050", "battery": "5000 mAh", "camera": "64MP + 8MP + 2MP"}'::jsonb, '["Border-less 120Hz Display", "67W Charging", "64MP Main"]'::jsonb, '["Lava Red", "Ocean Blue"]'::jsonb, 'Stunning borderless display with awesome cameras.', '128GB', '8GB', '128GB', 'available', 100, 3);

-- Seeding Inventory for 15 Products
INSERT INTO inventory (product_id, stock_count, low_stock_threshold) VALUES
('ab000000-0000-0000-0000-000000000001', 5, 2),
('ab000000-0000-0000-0000-000000000002', 8, 3),
('ab000000-0000-0000-0000-000000000003', 4, 2),
('ab000000-0000-0000-0000-000000000004', 10, 3),
('ab000000-0000-0000-0000-000000000005', 3, 1),
('ab000000-0000-0000-0000-000000000006', 6, 2),
('ab000000-0000-0000-0000-000000000007', 12, 3),
('ab000000-0000-0000-0000-000000000008', 5, 2),
('ab000000-0000-0000-0000-000000000009', 7, 2),
('ab000000-0000-0000-0000-00000000000a', 9, 3),
('ab000000-0000-0000-0000-00000000000b', 4, 1),
('ab000000-0000-0000-0000-00000000000c', 3, 2),
('ab000000-0000-0000-0000-00000000000d', 6, 2),
('ab000000-0000-0000-0000-00000000000e', 5, 2),
('ab000000-0000-0000-0000-00000000000f', 10, 3);

-- Seeding Sample Accessories
INSERT INTO accessories (
  id, category_id, category, brand, name, price, discount_price, stock, description, colors, images, status, specifications, features, views, sales
) VALUES
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'chargers', 'Apple', 'Apple 20W USB-C Power Adapter', 1900, 1699, 15, 'Fast and efficient power delivery.', '["White"]'::jsonb, '["https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop"]'::jsonb, 'available', '{"Type": "Wall Charger", "Port": "USB-C"}'::jsonb, '["Safe PD Charging", "Compact design"]'::jsonb, 120, 2),
('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'cases', 'Spigen', 'Spigen Liquid Air Case (iPhone 15)', 1499, 999, 20, 'Slim and military grade shock absorption.', '["Matte Black", "Navy Blue"]'::jsonb, '["https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop"]'::jsonb, 'available', '{"Material": "TPU", "Weight": "30g"}'::jsonb, '["Air Cushion Tech", "Anti-slip pattern"]'::jsonb, 85, 5),
('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'earphones', 'Nothing', 'Nothing Ear (a)', 7999, 6999, 8, 'Transparent style earbuds with Active Noise Cancellation.', '["Yellow", "Black", "White"]'::jsonb, '["https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop"]'::jsonb, 'available', '{"Battery": "up to 42.5 hrs", "Driver": "11mm Dynamic"}'::jsonb, '["ANC 45dB", "Hi-Res Audio", "ChatGPT Integrated"]'::jsonb, 190, 6),
('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 'cases', 'Anker', 'Anker Tempered Glass (Galaxy S24)', 999, 799, 30, 'Ultra clear scratch resistant glass protector.', '["Clear"]'::jsonb, '["https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop"]'::jsonb, 'available', '{"Hardness": "9H", "Thickness": "0.33mm"}'::jsonb, '["9H Hardness", "Anti-fingerprint"]'::jsonb, 40, 1),
('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000006', 'power_banks', 'Xiaomi', 'Mi Power Bank 3i 20000mAh', 2199, 1899, 10, 'Massive capacity with 18W fast charge capabilities.', '["Sandstone Black"]'::jsonb, '["https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop"]'::jsonb, 'available', '{"Capacity": "20000mAh", "Ports": "Dual Input / Triple Output"}'::jsonb, '["18W Fast Charge", "Triple Port Output", "Smart Power Management"]'::jsonb, 75, 2);

-- Seeding Store Settings (s→ac prefix fix)
INSERT INTO settings (id, store_name, store_address, store_phone, whatsapp_number, default_greeting) VALUES
('ac000000-0000-0000-0000-000000000001', 'Sri Sai Mobiles', 'H.No. 4-2-120, Near Tower Circle, Jagtial, Telangana - 505327', '+91 8688303048', '8688303048', 'Welcome to Sri Sai Mobiles Jagtial! How can we assist you today?');

-- Seeding Dashboard Analytics
INSERT INTO dashboard_analytics (id, daily_sales, monthly_sales, visitors, conversion_rate, total_orders) VALUES
('d0000000-0000-0000-0000-000000000001', 0.0, 0.0, 0, 0.0, 0);

-- Seeding Sample Flash Sales
INSERT INTO flash_sales (id, product_id, discount_percentage, stock_limit, sold_count, start_time, end_time, enabled) VALUES
('f0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 15.0, 5, 1, '2026-07-06T10:00:00Z', '2026-07-07T22:00:00Z', true),
('f0000000-0000-0000-0000-000000000002', 'ab000000-0000-0000-0000-000000000005', 20.0, 3, 0, '2026-07-06T10:00:00Z', '2026-07-07T22:00:00Z', true);

-- Enable RLS for all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE compare_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public select categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow admins write categories" ON categories FOR ALL TO authenticated USING (exists (select 1 from users where id = auth.uid() and role in ('admin', 'super_admin')));

CREATE POLICY "Allow public select users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow write users" ON users FOR ALL USING (true);

CREATE POLICY "Allow public select products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow admins write products" ON products FOR ALL TO authenticated USING (exists (select 1 from users where id = auth.uid() and role in ('admin', 'super_admin')));

CREATE POLICY "Allow public select accessories" ON accessories FOR SELECT USING (true);
CREATE POLICY "Allow admins write accessories" ON accessories FOR ALL TO authenticated USING (exists (select 1 from users where id = auth.uid() and role in ('admin', 'super_admin')));

CREATE POLICY "Allow public select inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Allow admins write inventory" ON inventory FOR ALL TO authenticated USING (exists (select 1 from users where id = auth.uid() and role in ('admin', 'super_admin')));

CREATE POLICY "Allow public select banners" ON banners FOR SELECT USING (true);
CREATE POLICY "Allow admins write banners" ON banners FOR ALL TO authenticated USING (exists (select 1 from users where id = auth.uid() and role in ('admin', 'super_admin')));

CREATE POLICY "Allow insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow admins write orders" ON orders FOR ALL TO authenticated USING (exists (select 1 from users where id = auth.uid() and role in ('admin', 'super_admin')));

CREATE POLICY "Allow public select analytics" ON dashboard_analytics FOR SELECT USING (true);
CREATE POLICY "Allow admins write analytics" ON dashboard_analytics FOR ALL TO authenticated USING (exists (select 1 from users where id = auth.uid() and role in ('admin', 'super_admin')));

CREATE POLICY "Allow public select settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow admins write settings" ON settings FOR ALL TO authenticated USING (exists (select 1 from users where id = auth.uid() and role in ('admin', 'super_admin')));

CREATE POLICY "Allow public select flash_sales" ON flash_sales FOR SELECT USING (true);
CREATE POLICY "Allow admins write flash_sales" ON flash_sales FOR ALL TO authenticated USING (exists (select 1 from users where id = auth.uid() and role in ('admin', 'super_admin')));

CREATE POLICY "Allow all addresses" ON addresses FOR ALL USING (true);
CREATE POLICY "Allow all wishlist" ON wishlist FOR ALL USING (true);
CREATE POLICY "Allow all cart_items" ON cart_items FOR ALL USING (true);
CREATE POLICY "Allow all compare_items" ON compare_items FOR ALL USING (true);

-- ===================================================
-- ENABLE REALTIME PUBLICATION
-- ===================================================
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
    ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_analytics;
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

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE settings;
  EXCEPTION WHEN duplicate_object OR others THEN NULL;
  END;
END $$;
