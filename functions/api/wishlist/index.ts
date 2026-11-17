/**
 * /api/wishlist
 * 
 * GET    - Returns wishlist item IDs for ?user_id=...
 * POST   - Adds an item to wishlist.
 * DELETE - Removes an item from wishlist.
 */

import { successResponse, errorResponse, handleCors } from '../../_shared/responses';
import { generateId } from '../../_shared/db';

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
      'SELECT item_id FROM wishlist WHERE user_id = ? ORDER BY created_at ASC'
    ).bind(userId).all<{ item_id: string }>();

    return successResponse((results || []).map(r => r.item_id));
  } catch (err: any) {
    console.error('GET /api/wishlist error:', err);
    return errorResponse(err.message || 'Failed to fetch wishlist', 'DB_ERROR', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { user_id, item_id } = body || {};

    if (!user_id || !item_id) {
      return errorResponse('user_id and item_id are required', 'BAD_REQUEST', 400);
    }

    const existing = await context.env.DB.prepare(
      'SELECT id FROM wishlist WHERE user_id = ? AND item_id = ?'
    ).bind(user_id, item_id).first<{ id: string }>();

    if (existing) {
      return successResponse({ id: existing.id, user_id, item_id });
    }

    const id = generateId();
    await context.env.DB.prepare(
      'INSERT INTO wishlist (id, user_id, item_id) VALUES (?, ?, ?)'
    ).bind(id, user_id, item_id).run();

    return successResponse({ id, user_id, item_id }, 201);
  } catch (err: any) {
    console.error('POST /api/wishlist error:', err);
    return errorResponse(err.message || 'Failed to add to wishlist', 'DB_ERROR', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const userId = url.searchParams.get('user_id');
    const itemId = url.searchParams.get('item_id');

    if (!userId) return errorResponse('user_id is required', 'BAD_REQUEST', 400);

    if (itemId) {
      await context.env.DB.prepare(
        'DELETE FROM wishlist WHERE user_id = ? AND item_id = ?'
      ).bind(userId, itemId).run();
    } else {
      await context.env.DB.prepare('DELETE FROM wishlist WHERE user_id = ?').bind(userId).run();
    }

    return successResponse({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/wishlist error:', err);
    return errorResponse(err.message || 'Failed to remove from wishlist', 'DB_ERROR', 500);
  }
};
