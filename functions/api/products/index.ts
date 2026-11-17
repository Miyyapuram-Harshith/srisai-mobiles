/**
 * /api/products
 * 
 * GET  - Returns products from D1, with JSON fields parsed.
 * POST - Creates or upserts products (supports single product or array of products).
 */

import { successResponse, errorResponse, handleCors } from '../../_shared/responses';
import { parseJsonFields, buildUpsertQuery, generateId } from '../../_shared/db';

interface Env {
  DB: D1Database;
}

const MAX_PAGE_SIZE = 100;

function readNonNegativeInteger(value: string | null): number | undefined {
  if (value === null || !/^\d+$/.test(value)) return undefined;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return handleCors();
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const brand = url.searchParams.get('brand');
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const requestedLimit = readNonNegativeInteger(url.searchParams.get('limit'));
    const requestedOffset = readNonNegativeInteger(url.searchParams.get('offset'));

    if (url.searchParams.has('limit') && (!requestedLimit || requestedLimit > MAX_PAGE_SIZE)) {
      return errorResponse(`limit must be an integer between 1 and ${MAX_PAGE_SIZE}`, 'BAD_REQUEST', 400);
    }
    if (url.searchParams.has('offset') && requestedOffset === undefined) {
      return errorResponse('offset must be a non-negative integer', 'BAD_REQUEST', 400);
    }

    let query = 'SELECT * FROM products';
    const conditions: string[] = [];
    const bindings: any[] = [];

    if (brand) {
      conditions.push('brand = ?');
      bindings.push(brand);
    }
    if (category) {
      conditions.push('category = ?');
      bindings.push(category);
    }
    if (status) {
      conditions.push('status = ?');
      bindings.push(status);
    }
    if (search) {
      conditions.push('(name LIKE ? OR brand LIKE ?)');
      bindings.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (requestedLimit) {
      query += ' LIMIT ?';
      bindings.push(requestedLimit);
      if (requestedOffset) {
        query += ' OFFSET ?';
        bindings.push(requestedOffset);
      }
    }

    const stmt = context.env.DB.prepare(query);
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all();

    const parsed = (results || []).map((row: any) => parseJsonFields(row, 'products'));

    return successResponse(parsed);
  } catch (err: any) {
    console.error('GET /api/products error:', err);
    return errorResponse(err.message || 'Failed to fetch products', 'DB_ERROR', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    if (!body) {
      return errorResponse('Missing request body', 'BAD_REQUEST', 400);
    }

    const items = Array.isArray(body) ? body : [body];
    const created: any[] = [];

    for (const item of items) {
      const product = { ...item };
      if (!product.id) {
        product.id = generateId();
      }
      const { sql, values } = buildUpsertQuery('products', product);
      await context.env.DB.prepare(sql).bind(...values).run();
      created.push(product);
    }

    return successResponse(Array.isArray(body) ? created : created[0], 201);
  } catch (err: any) {
    console.error('POST /api/products error:', err);
    return errorResponse(err.message || 'Failed to create product', 'DB_ERROR', 500);
  }
};
