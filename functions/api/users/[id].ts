/**
 * /api/users/:id
 * 
 * GET    - Returns user by ID or email.
 * PUT    - Updates user by ID or email.
 * DELETE - Deletes user by ID or email.
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
    const idOrEmail = decodeURIComponent(context.params.id as string);
    if (!idOrEmail) return errorResponse('User ID or email is required', 'BAD_REQUEST', 400);

    const isEmail = idOrEmail.includes('@');
    const query = isEmail
      ? 'SELECT * FROM users WHERE email = ?'
      : 'SELECT * FROM users WHERE id = ?';

    const row = await context.env.DB.prepare(query).bind(idOrEmail.toLowerCase().trim()).first();
    if (!row) return errorResponse('User not found', 'NOT_FOUND', 404);

    return successResponse(parseJsonFields(row as Record<string, any>, 'users'));
  } catch (err: any) {
    console.error('GET /api/users/:id error:', err);
    return errorResponse(err.message || 'Failed to fetch user', 'DB_ERROR', 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const idOrEmail = decodeURIComponent(context.params.id as string);
    if (!idOrEmail) return errorResponse('User ID or email is required', 'BAD_REQUEST', 400);

    const isEmail = idOrEmail.includes('@');
    const existing = await context.env.DB.prepare(
      isEmail ? 'SELECT id FROM users WHERE email = ?' : 'SELECT id FROM users WHERE id = ?'
    ).bind(idOrEmail.toLowerCase().trim()).first<{ id: string }>();

    if (!existing) return errorResponse('User not found', 'NOT_FOUND', 404);

    const body = await context.request.json() as Record<string, any>;
    if (!body) return errorResponse('Missing request body', 'BAD_REQUEST', 400);

    const { sql, values } = buildUpdateQuery('users', existing.id, body);
    await context.env.DB.prepare(sql).bind(...values).run();

    const row = await context.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(existing.id).first();
    return successResponse(parseJsonFields(row as Record<string, any>, 'users'));
  } catch (err: any) {
    console.error('PUT /api/users/:id error:', err);
    return errorResponse(err.message || 'Failed to update user', 'DB_ERROR', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const idOrEmail = decodeURIComponent(context.params.id as string);
    if (!idOrEmail) return errorResponse('User ID or email is required', 'BAD_REQUEST', 400);

    const isEmail = idOrEmail.includes('@');
    const query = isEmail ? 'DELETE FROM users WHERE email = ?' : 'DELETE FROM users WHERE id = ?';
    await context.env.DB.prepare(query).bind(idOrEmail.toLowerCase().trim()).run();

    return successResponse({ deleted: true, identifier: idOrEmail });
  } catch (err: any) {
    console.error('DELETE /api/users/:id error:', err);
    return errorResponse(err.message || 'Failed to delete user', 'DB_ERROR', 500);
  }
};
