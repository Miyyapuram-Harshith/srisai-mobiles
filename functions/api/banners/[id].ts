/**
 * /api/banners/:id
 * 
 * GET    - Returns a single banner.
 * PUT    - Updates a banner.
 * DELETE - Deletes a banner.
 */

import { successResponse, errorResponse, handleCors } from '../../_shared/responses';
import { parseJsonFields, buildUpdateQuery } from '../../_shared/db';

interface Env {
  DB: D1Database;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return handleCors();
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return errorResponse('Banner ID is required', 'BAD_REQUEST', 400);

    const row = await context.env.DB.prepare('SELECT * FROM banners WHERE id = ?').bind(id).first();
    if (!row) return errorResponse('Banner not found', 'NOT_FOUND', 404);

    return successResponse(parseJsonFields(row as Record<string, any>, 'banners'));
  } catch (err: any) {
    console.error('GET /api/banners/:id error:', err);
    return errorResponse(err.message || 'Failed to fetch banner', 'DB_ERROR', 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return errorResponse('Banner ID is required', 'BAD_REQUEST', 400);

    const body = await context.request.json() as Record<string, any>;
    if (!body) return errorResponse('Missing request body', 'BAD_REQUEST', 400);

    const { sql, values } = buildUpdateQuery('banners', id, body);
    await context.env.DB.prepare(sql).bind(...values).run();

    const row = await context.env.DB.prepare('SELECT * FROM banners WHERE id = ?').bind(id).first();
    return successResponse(parseJsonFields(row as Record<string, any>, 'banners'));
  } catch (err: any) {
    console.error('PUT /api/banners/:id error:', err);
    return errorResponse(err.message || 'Failed to update banner', 'DB_ERROR', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return errorResponse('Banner ID is required', 'BAD_REQUEST', 400);

    await context.env.DB.prepare('DELETE FROM banners WHERE id = ?').bind(id).run();
    return successResponse({ deleted: true, id });
  } catch (err: any) {
    console.error('DELETE /api/banners/:id error:', err);
    return errorResponse(err.message || 'Failed to delete banner', 'DB_ERROR', 500);
  }
};
