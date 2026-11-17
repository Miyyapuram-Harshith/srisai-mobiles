/**
 * /api/flash-sales
 * 
 * GET  - Returns all flash sales.
 * POST - Creates or upserts flash sales (single or array).
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
    const { results } = await context.env.DB.prepare(
      'SELECT * FROM flash_sales ORDER BY created_at DESC'
    ).all();

    const parsed = (results || []).map((row: any) => parseJsonFields(row, 'flash_sales'));
    return successResponse(parsed);
  } catch (err: any) {
    console.error('GET /api/flash-sales error:', err);
    return errorResponse(err.message || 'Failed to fetch flash sales', 'DB_ERROR', 500);
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
      const sale = { ...item };
      if (!sale.id) {
        sale.id = generateId();
      }
      if (sale.deviceId && !sale.product_id) {
        sale.product_id = sale.deviceId;
      }
      if (sale.device_id && !sale.product_id) {
        sale.product_id = sale.device_id;
      }
      delete sale.deviceId;
      delete sale.device_id;

      const { sql, values } = buildUpsertQuery('flash_sales', sale);
      await context.env.DB.prepare(sql).bind(...values).run();
      created.push(sale);
    }

    return successResponse(Array.isArray(body) ? created : created[0], 201);
  } catch (err: any) {
    console.error('POST /api/flash-sales error:', err);
    return errorResponse(err.message || 'Failed to create flash sale', 'DB_ERROR', 500);
  }
};
