/**
 * /api/accessories
 * 
 * GET  - Returns all accessories from D1.
 * POST - Creates or upserts accessories (single or array).
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
    const category = url.searchParams.get('category');
    const brand = url.searchParams.get('brand');
    const status = url.searchParams.get('status');

    let query = 'SELECT * FROM accessories';
    const conditions: string[] = [];
    const bindings: any[] = [];

    if (category) {
      conditions.push('category = ?');
      bindings.push(category);
    }
    if (brand) {
      conditions.push('brand = ?');
      bindings.push(brand);
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

    const parsed = (results || []).map((row: any) => parseJsonFields(row, 'accessories'));
    return successResponse(parsed);
  } catch (err: any) {
    console.error('GET /api/accessories error:', err);
    return errorResponse(err.message || 'Failed to fetch accessories', 'DB_ERROR', 500);
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
      const accessory = { ...item };
      if (!accessory.id) {
        accessory.id = generateId();
      }
      const { sql, values } = buildUpsertQuery('accessories', accessory);
      await context.env.DB.prepare(sql).bind(...values).run();
      created.push(accessory);
    }

    return successResponse(Array.isArray(body) ? created : created[0], 201);
  } catch (err: any) {
    console.error('POST /api/accessories error:', err);
    return errorResponse(err.message || 'Failed to create accessory', 'DB_ERROR', 500);
  }
};
