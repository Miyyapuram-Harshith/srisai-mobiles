/**
 * /api/orders
 * 
 * GET  - Returns all orders (or user orders if filtered).
 * POST - Creates a new order.
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
      conditions.push('customer_email = ?');
      bindings.push(email);
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

    const items = Array.isArray(body) ? body : [body];
    const created: any[] = [];

    for (const item of items) {
      const order = { ...item };
      if (!order.id) {
        order.id = generateId();
      }
      const { sql, values } = buildUpsertQuery('orders', order);
      await context.env.DB.prepare(sql).bind(...values).run();
      created.push(order);
    }

    return successResponse(Array.isArray(body) ? created : created[0], 201);
  } catch (err: any) {
    console.error('POST /api/orders error:', err);
    return errorResponse(err.message || 'Failed to create order', 'DB_ERROR', 500);
  }
};
