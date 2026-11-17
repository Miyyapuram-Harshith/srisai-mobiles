/**
 * /api/banners
 * 
 * GET  - Returns all banners ordered by priority.
 * POST - Creates or upserts banners (single or array).
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
      'SELECT * FROM banners ORDER BY priority ASC, created_at DESC'
    ).all();

    const parsed = (results || []).map((row: any) => parseJsonFields(row, 'banners'));
    return successResponse(parsed);
  } catch (err: any) {
    console.error('GET /api/banners error:', err);
    return errorResponse(err.message || 'Failed to fetch banners', 'DB_ERROR', 500);
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
      const banner = { ...item };
      if (!banner.id) {
        banner.id = generateId();
      }
      const { sql, values } = buildUpsertQuery('banners', banner);
      await context.env.DB.prepare(sql).bind(...values).run();
      created.push(banner);
    }

    return successResponse(Array.isArray(body) ? created : created[0], 201);
  } catch (err: any) {
    console.error('POST /api/banners error:', err);
    return errorResponse(err.message || 'Failed to create banner', 'DB_ERROR', 500);
  }
};
