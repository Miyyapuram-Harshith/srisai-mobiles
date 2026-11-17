/**
 * GET /api/categories
 * 
 * Returns all categories from D1.
 * Note: The existing frontend doesn't have a separate categories query to Supabase.
 * Categories are used implicitly via the product.category_id field.
 * This endpoint provides them for future use and current schema verification.
 */

import { successResponse, errorResponse, handleCors } from '../_shared/responses';

interface Env {
  DB: D1Database;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return handleCors();
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      'SELECT id, name, slug FROM categories ORDER BY name ASC'
    ).all();

    return successResponse(results || []);
  } catch (err: any) {
    console.error('GET /api/categories error:', err);
    return errorResponse(err.message || 'Failed to fetch categories', 'DB_ERROR', 500);
  }
};
