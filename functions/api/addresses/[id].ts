/**
 * /api/addresses/:id
 * 
 * PUT    - Updates an address.
 * DELETE - Deletes an address.
 */

import { successResponse, errorResponse, handleCors } from '../../_shared/responses';
import { parseJsonFields, buildUpdateQuery } from '../../_shared/db';

interface Env {
  DB: D1Database;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return handleCors();
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return errorResponse('Address ID is required', 'BAD_REQUEST', 400);

    const body = await context.request.json() as Record<string, any>;
    if (!body) return errorResponse('Missing request body', 'BAD_REQUEST', 400);

    if (body.is_default && body.user_id) {
      await context.env.DB.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').bind(body.user_id).run();
    }

    const { sql, values } = buildUpdateQuery('addresses', id, body);
    await context.env.DB.prepare(sql).bind(...values).run();

    const row = await context.env.DB.prepare('SELECT * FROM addresses WHERE id = ?').bind(id).first();
    return successResponse(parseJsonFields(row as Record<string, any>, 'addresses'));
  } catch (err: any) {
    console.error('PUT /api/addresses/:id error:', err);
    return errorResponse(err.message || 'Failed to update address', 'DB_ERROR', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return errorResponse('Address ID is required', 'BAD_REQUEST', 400);

    await context.env.DB.prepare('DELETE FROM addresses WHERE id = ?').bind(id).run();
    return successResponse({ deleted: true, id });
  } catch (err: any) {
    console.error('DELETE /api/addresses/:id error:', err);
    return errorResponse(err.message || 'Failed to delete address', 'DB_ERROR', 500);
  }
};
