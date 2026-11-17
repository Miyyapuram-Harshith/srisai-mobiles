/**
 * /api/products/:id
 * 
 * GET    - Returns a single product by ID from D1, with JSON fields parsed.
 * PUT    - Updates product by ID.
 * DELETE - Deletes product by ID.
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

    if (!id) {
      return errorResponse('Product ID is required', 'BAD_REQUEST', 400);
    }

    const row = await context.env.DB.prepare(
      'SELECT * FROM products WHERE id = ?'
    ).bind(id).first();

    if (!row) {
      return errorResponse('Product not found', 'NOT_FOUND', 404);
    }

    const parsed = parseJsonFields(row as Record<string, any>, 'products');

    return successResponse(parsed);
  } catch (err: any) {
    console.error('GET /api/products/:id error:', err);
    return errorResponse(err.message || 'Failed to fetch product', 'DB_ERROR', 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) {
      return errorResponse('Product ID is required', 'BAD_REQUEST', 400);
    }

    const body = await context.request.json() as Record<string, any>;
    if (!body) {
      return errorResponse('Missing request body', 'BAD_REQUEST', 400);
    }

    const { sql, values } = buildUpdateQuery('products', id, body);
    await context.env.DB.prepare(sql).bind(...values).run();

    const row = await context.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    return successResponse(parseJsonFields(row as Record<string, any>, 'products'));
  } catch (err: any) {
    console.error('PUT /api/products/:id error:', err);
    return errorResponse(err.message || 'Failed to update product', 'DB_ERROR', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) {
      return errorResponse('Product ID is required', 'BAD_REQUEST', 400);
    }

    await context.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    return successResponse({ deleted: true, id });
  } catch (err: any) {
    console.error('DELETE /api/products/:id error:', err);
    return errorResponse(err.message || 'Failed to delete product', 'DB_ERROR', 500);
  }
};
