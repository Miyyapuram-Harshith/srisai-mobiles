/**
 * /api/orders
 * 
 * GET  - Returns all orders (or user orders if filtered).
 * POST - Creates a new order, safely migrates missing columns, and updates product inventory stock & sales.
 */

import { successResponse, errorResponse, handleCors } from '../../_shared/responses';
import { parseJsonFields, buildUpsertQuery, generateId } from '../../_shared/db';

interface Env {
  DB: D1Database;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return handleCors();
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const email = url.searchParams.get('email');
    const phone = url.searchParams.get('phone');
    const status = url.searchParams.get('status');

    let query = 'SELECT * FROM orders';
    const conditions: string[] = [];
    const bindings: any[] = [];

    if (email) {
      conditions.push('(customer_email = ? OR user_id = (SELECT id FROM users WHERE LOWER(email) = LOWER(?)))');
      bindings.push(email.toLowerCase().trim(), email.toLowerCase().trim());
    }
    if (phone) {
      conditions.push('phone = ?');
      bindings.push(phone);
    }
    if (status) {
      conditions.push('status = ?');
      bindings.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const stmt = context.env.DB.prepare(query);
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all();

    const parsed = (results || []).map((row: any) => parseJsonFields(row, 'orders'));
    return successResponse(parsed);
  } catch (err: any) {
    console.error('GET /api/orders error:', err);
    return errorResponse(err.message || 'Failed to fetch orders', 'DB_ERROR', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    if (!body) {
      return errorResponse('Missing request body', 'BAD_REQUEST', 400);
    }

    // Inspect existing columns in D1 orders table
    let existingCols = new Set<string>();
    try {
      const { results: cols } = await context.env.DB.prepare('PRAGMA table_info(orders)').all();
      existingCols = new Set((cols || []).map((c: any) => c.name));
    } catch (e) {
      console.warn('Could not read PRAGMA table_info(orders):', e);
    }

    // Dynamic schema migration: ensure all columns exist
    const schemaColumns = [
      { name: 'customer_email', type: 'TEXT' },
      { name: 'subtotal', type: 'REAL' },
      { name: 'discount', type: 'REAL DEFAULT 0' },
      { name: 'gst_amount', type: 'REAL DEFAULT 0' },
      { name: 'delivery_fee', type: 'REAL DEFAULT 0' },
      { name: 'is_preorder', type: 'INTEGER DEFAULT 0' },
      { name: 'estimated_delivery_date', type: 'TEXT' },
      { name: 'actual_delivery_date', type: 'TEXT' },
      { name: 'pickup_date', type: 'TEXT' },
      { name: 'pickup_time', type: 'TEXT' },
      { name: 'pickup_otp', type: 'TEXT' },
      { name: 'collected_by', type: 'TEXT' },
      { name: 'collection_time', type: 'TEXT' },
      { name: 'delivery_partner', type: 'TEXT' },
      { name: 'delivery_executive_name', type: 'TEXT' },
      { name: 'delivery_executive_phone', type: 'TEXT' },
      { name: 'tracking_number', type: 'TEXT' },
      { name: 'transaction_id', type: 'TEXT' },
      { name: 'payment_screenshot', type: 'TEXT' },
      { name: 'refund_id', type: 'TEXT' },
      { name: 'return_reason', type: 'TEXT' },
      { name: 'return_approval_status', type: 'TEXT' },
      { name: 'refund_amount', type: 'REAL' },
      { name: 'refund_method', type: 'TEXT' },
      { name: 'refund_date', type: 'TEXT' }
    ];

    if (existingCols.size > 0) {
      for (const col of schemaColumns) {
        if (!existingCols.has(col.name)) {
          try {
            await context.env.DB.prepare(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type}`).run();
            existingCols.add(col.name);
          } catch (e) {
            console.warn(`Could not add column ${col.name}:`, e);
          }
        }
      }
    }

    const items = Array.isArray(body) ? body : [body];
    const created: any[] = [];

    for (const item of items) {
      const order = { ...item };
      if (!order.id) {
        order.id = generateId();
      }

      // Filter properties to only existing columns if known, preventing SQLite column errors
      let sanitizedOrder = order;
      if (existingCols.size > 0) {
        sanitizedOrder = Object.fromEntries(
          Object.entries(order).filter(([k]) => existingCols.has(k))
        );
        sanitizedOrder.id = order.id;
      }

      const { sql, values } = buildUpsertQuery('orders', sanitizedOrder);
      await context.env.DB.prepare(sql).bind(...values).run();

      // Decrement product & accessory stock levels and increment sales counts in D1
      let orderProducts: any[] = [];
      try {
        if (Array.isArray(order.products)) {
          orderProducts = order.products;
        } else if (typeof order.products === 'string') {
          orderProducts = JSON.parse(order.products || '[]');
        }
      } catch {
        orderProducts = [];
      }

      for (const prod of orderProducts) {
        const prodId = prod.deviceId || prod.id;
        const qty = Number(prod.quantity) || 1;
        if (!prodId) continue;

        try {
          // Attempt to update product stock & sales in products table
          const resProduct = await context.env.DB.prepare(
            'UPDATE products SET stock_count = MAX(0, stock_count - ?), sales = sales + ? WHERE id = ?'
          ).bind(qty, qty, prodId).run();

          // If no product row was modified, attempt in accessories table
          if (resProduct.meta?.changes === 0) {
            await context.env.DB.prepare(
              'UPDATE accessories SET stock_count = MAX(0, stock_count - ?), sales = sales + ? WHERE id = ?'
            ).bind(qty, qty, prodId).run();
          }

          // If flash sale exists for that product, update sold count
          await context.env.DB.prepare(
            'UPDATE flash_sales SET sold_count = sold_count + ? WHERE device_id = ?'
          ).bind(qty, prodId).run();
        } catch (stockErr) {
          console.warn(`Failed to update stock for product ${prodId}:`, stockErr);
        }
      }

      created.push(order);
    }

    return successResponse(Array.isArray(body) ? created : created[0], 201);
  } catch (err: any) {
    console.error('POST /api/orders error:', err);
    return errorResponse(err.message || 'Failed to create order', 'DB_ERROR', 500);
  }
};
