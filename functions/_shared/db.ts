/**
 * Shared D1 database helper utilities.
 * All database access happens server-side through these helpers.
 */

/** JSON fields in the D1 schema that need parsing from TEXT to objects */
const JSON_FIELDS: Record<string, string[]> = {
  products: ['images', 'specifications', 'features', 'colors', 'quality_checks'],
  accessories: ['images', 'specifications', 'features', 'colors'],
  orders: ['address', 'products', 'timeline', 'internal_notes', 'call_logs'],
  banners: [],
  categories: [],
  users: [],
  settings: ['whatsapp_settings', 'instagram_settings'],
  flash_sales: [],
  addresses: [],
  wishlist: [],
  cart_items: [],
  compare_items: [],
  instagram_posts: [],
  dashboard_analytics: [],
  inventory: [],
};

/** Boolean fields in SQLite (INTEGER 0/1) to map back to JS boolean */
const BOOLEAN_FIELDS: Record<string, string[]> = {
  banners: ['active'],
  users: ['enabled'],
  flash_sales: ['enabled'],
  addresses: ['is_default'],
  instagram_posts: ['is_featured', 'is_active'],
  products: [
    'factory_sealed', 'official_brand_warranty', 'invoice_available',
    'purchase_bill_available', 'box_available', 'original_charger_available',
    'original_cable_available', 'earphones_available', 'back_cover_available',
    'screen_guard_applied', 'open_box_box', 'open_box_accessories',
    'seen_on_instagram'
  ],
  orders: ['is_preorder'],
};

/**
 * Parse JSON TEXT and boolean fields in a D1 row back into JS objects and booleans.
 */
export function parseJsonFields(row: Record<string, any>, table: string): Record<string, any> {
  if (!row) return row;
  const jsonFields = JSON_FIELDS[table] || [];
  const boolFields = BOOLEAN_FIELDS[table] || [];
  const parsed = { ...row };

  for (const field of jsonFields) {
    if (parsed[field] && typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field]);
      } catch {
        // leave as-is if parse fails
      }
    }
  }

  for (const field of boolFields) {
    if (parsed[field] !== undefined && parsed[field] !== null) {
      parsed[field] = Boolean(parsed[field]);
    }
  }

  return parsed;
}

/**
 * Serialize JS objects to JSON TEXT and booleans to integers for D1 insertion.
 */
export function serializeJsonFields(row: Record<string, any>, table: string): Record<string, any> {
  const jsonFields = JSON_FIELDS[table] || [];
  const serialized = { ...row };

  for (const [key, value] of Object.entries(serialized)) {
    if (jsonFields.includes(key)) {
      if (value !== undefined && value !== null && typeof value !== 'string') {
        serialized[key] = JSON.stringify(value);
      }
    } else if (typeof value === 'boolean') {
      serialized[key] = value ? 1 : 0;
    }
  }

  return serialized;
}

/**
 * Generate a UUID v4 string for use as primary keys.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Build dynamic INSERT statement for SQLite / D1.
 */
export function buildInsertQuery(tableName: string, data: Record<string, any>) {
  const serialized = serializeJsonFields(data, tableName);
  const keys = Object.keys(serialized).filter(k => serialized[k] !== undefined);
  const columns = keys.map(k => `"${k}"`).join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map(k => serialized[k]);
  return {
    sql: `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders})`,
    values,
  };
}

/**
 * Build dynamic UPSERT statement (INSERT ... ON CONFLICT DO UPDATE SET) for SQLite / D1.
 */
export function buildUpsertQuery(tableName: string, data: Record<string, any>, conflictKey = 'id') {
  const serialized = serializeJsonFields(data, tableName);
  const keys = Object.keys(serialized).filter(k => serialized[k] !== undefined);
  const columns = keys.map(k => `"${k}"`).join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const updateClauses = keys.filter(k => k !== conflictKey).map(k => `"${k}" = EXCLUDED."${k}"`).join(', ');
  const values = keys.map(k => serialized[k]);
  return {
    sql: `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders}) ON CONFLICT ("${conflictKey}") DO UPDATE SET ${updateClauses}`,
    values,
  };
}

/**
 * Build dynamic UPDATE statement for SQLite / D1.
 */
export function buildUpdateQuery(tableName: string, id: string, data: Record<string, any>, idCol = 'id') {
  const serialized = serializeJsonFields(data, tableName);
  const keys = Object.keys(serialized).filter(k => k !== idCol && serialized[k] !== undefined);
  const setClauses = keys.map(k => `"${k}" = ?`).join(', ');
  const values = keys.map(k => serialized[k]);
  values.push(id);
  return {
    sql: `UPDATE "${tableName}" SET ${setClauses} WHERE "${idCol}" = ?`,
    values,
  };
}
