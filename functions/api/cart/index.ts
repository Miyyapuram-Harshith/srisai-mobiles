/**
 * /api/cart
 * 
 * GET    - Returns cart items for ?user_id=...
 * POST   - Adds or updates an item in cart.
 * DELETE - Removes item(s) from cart.
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
      'SELECT item_id, quantity, selected_color FROM cart_items WHERE user_id = ? ORDER BY created_at ASC'
    ).bind(userId).all();

    return successResponse(results || []);
  } catch (err: any) {
    console.error('GET /api/cart error:', err);
    return errorResponse(err.message || 'Failed to fetch cart', 'DB_ERROR', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    const { user_id, item_id, quantity = 1, selected_color = '' } = body || {};

    if (!user_id || !item_id) {
      return errorResponse('user_id and item_id are required', 'BAD_REQUEST', 400);
    }

    // Check if item already exists in cart for this user and color
    const existing = await context.env.DB.prepare(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND item_id = ? AND selected_color = ?'
    ).bind(user_id, item_id, selected_color).first<{ id: string; quantity: number }>();

    if (existing) {
      await context.env.DB.prepare(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(quantity, existing.id).run();
      return successResponse({ id: existing.id, user_id, item_id, quantity, selected_color });
    }

    const id = generateId();
    await context.env.DB.prepare(
      'INSERT INTO cart_items (id, user_id, item_id, quantity, selected_color) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, user_id, item_id, quantity, selected_color).run();

    return successResponse({ id, user_id, item_id, quantity, selected_color }, 201);
  } catch (err: any) {
    console.error('POST /api/cart error:', err);
    return errorResponse(err.message || 'Failed to update cart', 'DB_ERROR', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const userId = url.searchParams.get('user_id');
    const itemId = url.searchParams.get('item_id');
    const selectedColor = url.searchParams.get('selected_color');

    if (!userId) return errorResponse('user_id is required', 'BAD_REQUEST', 400);

    if (itemId && selectedColor !== null) {
      await context.env.DB.prepare(
        'DELETE FROM cart_items WHERE user_id = ? AND item_id = ? AND selected_color = ?'
      ).bind(userId, itemId, selectedColor).run();
    } else if (itemId) {
      await context.env.DB.prepare(
        'DELETE FROM cart_items WHERE user_id = ? AND item_id = ?'
      ).bind(userId, itemId).run();
    } else {
      // Clear entire cart for user
      await context.env.DB.prepare('DELETE FROM cart_items WHERE user_id = ?').bind(userId).run();
    }

    return successResponse({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/cart error:', err);
    return errorResponse(err.message || 'Failed to remove from cart', 'DB_ERROR', 500);
  }
};
