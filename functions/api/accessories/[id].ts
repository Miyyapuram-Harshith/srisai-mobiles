/**
 * /api/accessories/:id
 * 
 * GET    - Returns a single accessory by ID.
 * PUT    - Updates an accessory by ID.
 * DELETE - Deletes an accessory by ID.
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
    if (!id) return errorResponse('Accessory ID is required', 'BAD_REQUEST', 400);

    const row = await context.env.DB.prepare('SELECT * FROM accessories WHERE id = ?').bind(id).first();
    if (!row) return errorResponse('Accessory not found', 'NOT_FOUND', 404);

    return successResponse(parseJsonFields(row as Record<string, any>, 'accessories'));
  } catch (err: any) {
    console.error('GET /api/accessories/:id error:', err);
    return errorResponse(err.message || 'Failed to fetch accessory', 'DB_ERROR', 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return errorResponse('Accessory ID is required', 'BAD_REQUEST', 400);

    const body = await context.request.json() as Record<string, any>;
    if (!body) return errorResponse('Missing request body', 'BAD_REQUEST', 400);

    const { sql, values } = buildUpdateQuery('accessories', id, body);
    await context.env.DB.prepare(sql).bind(...values).run();

    const row = await context.env.DB.prepare('SELECT * FROM accessories WHERE id = ?').bind(id).first();
    return successResponse(parseJsonFields(row as Record<string, any>, 'accessories'));
  } catch (err: any) {
    console.error('PUT /api/accessories/:id error:', err);
    return errorResponse(err.message || 'Failed to update accessory', 'DB_ERROR', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return errorResponse('Accessory ID is required', 'BAD_REQUEST', 400);

    await context.env.DB.prepare('DELETE FROM accessories WHERE id = ?').bind(id).run();
    return successResponse({ deleted: true, id });
  } catch (err: any) {
    console.error('DELETE /api/accessories/:id error:', err);
    return errorResponse(err.message || 'Failed to delete accessory', 'DB_ERROR', 500);
  }
};
