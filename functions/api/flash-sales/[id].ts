/**
 * /api/flash-sales/:id
 * 
 * GET    - Returns a single flash sale.
 * PUT    - Updates a flash sale.
 * DELETE - Deletes a flash sale.
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
    if (!id) return errorResponse('Flash sale ID is required', 'BAD_REQUEST', 400);

    const row = await context.env.DB.prepare('SELECT * FROM flash_sales WHERE id = ?').bind(id).first();
    if (!row) return errorResponse('Flash sale not found', 'NOT_FOUND', 404);

    return successResponse(parseJsonFields(row as Record<string, any>, 'flash_sales'));
  } catch (err: any) {
    console.error('GET /api/flash-sales/:id error:', err);
    return errorResponse(err.message || 'Failed to fetch flash sale', 'DB_ERROR', 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return errorResponse('Flash sale ID is required', 'BAD_REQUEST', 400);

    const body = await context.request.json() as Record<string, any>;
    if (!body) return errorResponse('Missing request body', 'BAD_REQUEST', 400);

    const sale = { ...body };
    if (sale.deviceId && !sale.product_id) sale.product_id = sale.deviceId;
    if (sale.device_id && !sale.product_id) sale.product_id = sale.device_id;
    delete sale.deviceId;
    delete sale.device_id;

    const { sql, values } = buildUpdateQuery('flash_sales', id, sale);
    await context.env.DB.prepare(sql).bind(...values).run();

    const row = await context.env.DB.prepare('SELECT * FROM flash_sales WHERE id = ?').bind(id).first();
    return successResponse(parseJsonFields(row as Record<string, any>, 'flash_sales'));
  } catch (err: any) {
    console.error('PUT /api/flash-sales/:id error:', err);
    return errorResponse(err.message || 'Failed to update flash sale', 'DB_ERROR', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return errorResponse('Flash sale ID is required', 'BAD_REQUEST', 400);

    await context.env.DB.prepare('DELETE FROM flash_sales WHERE id = ?').bind(id).run();
    return successResponse({ deleted: true, id });
  } catch (err: any) {
    console.error('DELETE /api/flash-sales/:id error:', err);
    return errorResponse(err.message || 'Failed to delete flash sale', 'DB_ERROR', 500);
  }
};
