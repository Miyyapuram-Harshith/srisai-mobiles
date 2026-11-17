-- D1 SQLite Migration: 0001_initial_schema.sql
-- Translated from Supabase PostgreSQL

DROP TABLE IF EXISTS compare_items;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS flash_sales;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS dashboard_analytics;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS banners;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS accessories;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS instagram_posts;

-- 1. Create Categories Table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_categories_modtime
AFTER UPDATE ON categories
FOR EACH ROW
BEGIN
  UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 2. Create Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'customer' NOT NULL,
  name TEXT,
  phone TEXT,
  enabled INTEGER DEFAULT 1 NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_users_modtime
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 3. Create Products Table (Phones / Devices)
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  discount_price REAL,
  stock INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  images TEXT DEFAULT '[]',
  specifications TEXT DEFAULT '{}',
  features TEXT DEFAULT '[]',
  colors TEXT DEFAULT '[]',
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
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Preowned fields
  factory_sealed INTEGER,
  official_brand_warranty INTEGER,
  warranty_duration TEXT,
  launch_date TEXT,
  invoice_available INTEGER,
  ownership TEXT,
  used_duration TEXT,
  original_purchase_date TEXT,
  purchase_bill_available INTEGER,
  box_available INTEGER,
  original_charger_available INTEGER,
  original_cable_available INTEGER,
  earphones_available INTEGER,
  back_cover_available INTEGER,
  screen_guard_applied INTEGER,
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
  quality_checks TEXT DEFAULT '[]',
  seller_notes TEXT,

  -- Open box fields
  open_box_box INTEGER,
  open_box_accessories INTEGER,
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
  seen_on_instagram INTEGER,
  instagram_url TEXT
);

CREATE TRIGGER update_products_modtime
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category_id);

-- 4. Create Accessories Table
CREATE TABLE accessories (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'cases' NOT NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  discount_price REAL,
  stock INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  colors TEXT DEFAULT '[]',
  images TEXT DEFAULT '[]',
  status TEXT DEFAULT 'available',
  specifications TEXT DEFAULT '{}',
  features TEXT DEFAULT '[]',
  views INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_accessories_modtime
AFTER UPDATE ON accessories
FOR EACH ROW
BEGIN
  UPDATE accessories SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE INDEX idx_accessories_brand ON accessories(brand);
CREATE INDEX idx_accessories_category ON accessories(category_id);

-- 5. Create Inventory Table
CREATE TABLE inventory (
  id TEXT PRIMARY KEY,
  product_id TEXT UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  stock_count INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_inventory_modtime
AFTER UPDATE ON inventory
FOR EACH ROW
BEGIN
  UPDATE inventory SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 6. Create Banners Table
CREATE TABLE banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  active INTEGER DEFAULT 1 NOT NULL,
  priority INTEGER DEFAULT 0 NOT NULL,
  redirect_link TEXT,
  start_date TEXT,
  end_date TEXT,
  slideshow_timer INTEGER DEFAULT 5,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_banners_modtime
AFTER UPDATE ON banners
FOR EACH ROW
BEGIN
  UPDATE banners SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 7. Create Orders Table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  products TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  payment_method TEXT DEFAULT 'cod' NOT NULL,
  payment_status TEXT DEFAULT 'pending' NOT NULL,
  delivery_type TEXT DEFAULT 'home_delivery' NOT NULL,
  timeline TEXT DEFAULT '[]',
  internal_notes TEXT DEFAULT '[]',
  call_logs TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_orders_modtime
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
  UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- 8. Create Dashboard Analytics Table
CREATE TABLE dashboard_analytics (
  id TEXT PRIMARY KEY,
  daily_sales REAL DEFAULT 0 NOT NULL,
  monthly_sales REAL DEFAULT 0 NOT NULL,
  visitors INTEGER DEFAULT 0 NOT NULL,
  conversion_rate REAL DEFAULT 0.0 NOT NULL,
  total_orders INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_analytics_modtime
AFTER UPDATE ON dashboard_analytics
FOR EACH ROW
BEGIN
  UPDATE dashboard_analytics SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 9. Create Settings Table
CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  store_name TEXT DEFAULT 'Sri Sai Mobiles' NOT NULL,
  store_address TEXT NOT NULL,
  store_phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  default_greeting TEXT,
  whatsapp_settings TEXT,
  instagram_settings TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_settings_modtime
AFTER UPDATE ON settings
FOR EACH ROW
BEGIN
  UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 10. Create Flash Sales Table
CREATE TABLE flash_sales (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  discount_percentage REAL DEFAULT 0 NOT NULL,
  stock_limit INTEGER DEFAULT 0 NOT NULL,
  sold_count INTEGER DEFAULT 0 NOT NULL,
  start_time TEXT,
  end_time TEXT,
  enabled INTEGER DEFAULT 1 NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_flash_sales_modtime
AFTER UPDATE ON flash_sales
FOR EACH ROW
BEGIN
  UPDATE flash_sales SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 11. Create Addresses Table
CREATE TABLE addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
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
  is_default INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_addresses_modtime
AFTER UPDATE ON addresses
FOR EACH ROW
BEGIN
  UPDATE addresses SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- 12. Create Wishlist Table
CREATE TABLE wishlist (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT DEFAULT 'product' NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- 13. Create Cart Items Table
CREATE TABLE cart_items (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT DEFAULT 'product' NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  selected_color TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_cart_items_modtime
AFTER UPDATE ON cart_items
FOR EACH ROW
BEGIN
  UPDATE cart_items SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE INDEX idx_cart_items_user ON cart_items(user_id);

-- 14. Create Compare Items Table
CREATE TABLE compare_items (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_compare_items_user ON compare_items(user_id);

-- 15. Create Instagram Posts table
CREATE TABLE instagram_posts (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  custom_title TEXT,
  custom_description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  position TEXT DEFAULT 'middle',
  expiry_date TEXT,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_instagram_posts_modtime
AFTER UPDATE ON instagram_posts
FOR EACH ROW
BEGIN
  UPDATE instagram_posts SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
