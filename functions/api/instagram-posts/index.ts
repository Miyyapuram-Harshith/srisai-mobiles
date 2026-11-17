/**
 * /api/instagram-posts
 * 
 * GET  - Returns all instagram posts.
 * POST - Creates or upserts instagram posts (single or array).
 * PUT  - Batch replaces all instagram posts.
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
      'SELECT * FROM instagram_posts ORDER BY display_order ASC, created_at DESC'
    ).all();

    const parsed = (results || []).map((row: any) => parseJsonFields(row, 'instagram_posts'));
    return successResponse(parsed);
  } catch (err: any) {
    console.error('GET /api/instagram-posts error:', err);
    return errorResponse(err.message || 'Failed to fetch instagram posts', 'DB_ERROR', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    if (!body) return errorResponse('Missing request body', 'BAD_REQUEST', 400);

    const items = Array.isArray(body) ? body : [body];
    const created: any[] = [];

    for (const item of items) {
      const post = { ...item };
      if (!post.id) {
        post.id = generateId();
      }
      const { sql, values } = buildUpsertQuery('instagram_posts', post);
      await context.env.DB.prepare(sql).bind(...values).run();
      created.push(post);
    }

    return successResponse(Array.isArray(body) ? created : created[0], 201);
  } catch (err: any) {
    console.error('POST /api/instagram-posts error:', err);
    return errorResponse(err.message || 'Failed to save instagram post', 'DB_ERROR', 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any[];
    if (!Array.isArray(body)) {
      return errorResponse('Expected an array of posts for batch sync', 'BAD_REQUEST', 400);
    }

    // Delete existing posts and insert new ones
    await context.env.DB.prepare('DELETE FROM instagram_posts').run();

    for (const item of body) {
      const post = { ...item };
      if (!post.id) post.id = generateId();
      const { sql, values } = buildUpsertQuery('instagram_posts', post);
      await context.env.DB.prepare(sql).bind(...values).run();
    }

    const { results } = await context.env.DB.prepare(
      'SELECT * FROM instagram_posts ORDER BY display_order ASC'
    ).all();

    return successResponse((results || []).map((r: any) => parseJsonFields(r, 'instagram_posts')));
  } catch (err: any) {
    console.error('PUT /api/instagram-posts error:', err);
    return errorResponse(err.message || 'Failed to replace instagram posts', 'DB_ERROR', 500);
  }
};
