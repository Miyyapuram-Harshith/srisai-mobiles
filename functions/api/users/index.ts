/**
 * /api/users
 * 
 * GET  - Returns users, optional ?role=admin/customer or ?email=...
 * POST - Creates or upserts a user.
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
    const role = url.searchParams.get('role');

    let query = 'SELECT * FROM users';
    const conditions: string[] = [];
    const bindings: any[] = [];

    if (email) {
      conditions.push('email = ?');
      bindings.push(email.toLowerCase().trim());
    }
    if (role) {
      if (role === 'admin_staff') {
        conditions.push("role != 'customer'");
      } else {
        conditions.push('role = ?');
        bindings.push(role);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const stmt = context.env.DB.prepare(query);
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all();

    const parsed = (results || []).map((row: any) => parseJsonFields(row, 'users'));
    return successResponse(parsed);
  } catch (err: any) {
    console.error('GET /api/users error:', err);
    return errorResponse(err.message || 'Failed to fetch users', 'DB_ERROR', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    if (!body || !body.email) {
      return errorResponse('Email is required', 'BAD_REQUEST', 400);
    }

    const email = body.email.toLowerCase().trim();
    // Check if user exists by email
    const existing = await context.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>();

    const user = {
      ...body,
      id: existing?.id || body.id || generateId(),
      email,
    };

    const { sql, values } = buildUpsertQuery('users', user);
    await context.env.DB.prepare(sql).bind(...values).run();

    const saved = await context.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first();
    return successResponse(parseJsonFields(saved as Record<string, any>, 'users'), 201);
  } catch (err: any) {
    console.error('POST /api/users error:', err);
    return errorResponse(err.message || 'Failed to save user', 'DB_ERROR', 500);
  }
};
