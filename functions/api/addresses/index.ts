/**
 * /api/addresses
 * 
 * GET  - Returns addresses for ?user_id=...
 * POST - Adds an address.
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
    const userId = url.searchParams.get('user_id');
    if (!userId) return errorResponse('user_id is required', 'BAD_REQUEST', 400);

    const { results } = await context.env.DB.prepare(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC'
    ).bind(userId).all();

    const parsed = (results || []).map((row: any) => parseJsonFields(row, 'addresses'));
    return successResponse(parsed);
  } catch (err: any) {
    console.error('GET /api/addresses error:', err);
    return errorResponse(err.message || 'Failed to fetch addresses', 'DB_ERROR', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    if (!body || !body.user_id) return errorResponse('user_id is required', 'BAD_REQUEST', 400);

    // If new address is default, reset existing defaults
    if (body.is_default) {
      await context.env.DB.prepare(
        'UPDATE addresses SET is_default = 0 WHERE user_id = ?'
      ).bind(body.user_id).run();
    }

    const addr = {
      ...body,
      id: body.id || generateId(),
    };

    const { sql, values } = buildUpsertQuery('addresses', addr);
    await context.env.DB.prepare(sql).bind(...values).run();

    const saved = await context.env.DB.prepare('SELECT * FROM addresses WHERE id = ?').bind(addr.id).first();
    return successResponse(parseJsonFields(saved as Record<string, any>, 'addresses'), 201);
  } catch (err: any) {
    console.error('POST /api/addresses error:', err);
    return errorResponse(err.message || 'Failed to save address', 'DB_ERROR', 500);
  }
};
