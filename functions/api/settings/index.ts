/**
 * /api/settings
 * 
 * GET - Returns store and integration settings.
 * PUT - Updates store settings.
 */

import { successResponse, errorResponse, handleCors } from '../../_shared/responses';
import { parseJsonFields, buildUpsertQuery, buildUpdateQuery } from '../../_shared/db';

interface Env {
  DB: D1Database;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return handleCors();
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    let row = await context.env.DB.prepare('SELECT * FROM settings LIMIT 1').first();
    
    if (!row) {
      // Return default configuration if empty
      const defaultSettings = {
        id: 'default',
        store_name: 'Sri Sai Mobiles',
        store_address: 'Opposite Big C, Angadi Bazar, Jagtial, Telangana - 505327',
        store_phone: '+91 8688303048',
        whatsapp_number: '8688303048',
        default_greeting: 'Welcome to Sri Sai Mobiles Jagtial! How can we assist you today?',
        whatsapp_settings: null,
        instagram_settings: null,
      };
      return successResponse(defaultSettings);
    }

    return successResponse(parseJsonFields(row as Record<string, any>, 'settings'));
  } catch (err: any) {
    console.error('GET /api/settings error:', err);
    return errorResponse(err.message || 'Failed to fetch settings', 'DB_ERROR', 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as Record<string, any>;
    if (!body) return errorResponse('Missing request body', 'BAD_REQUEST', 400);

    const existing = await context.env.DB.prepare('SELECT id FROM settings LIMIT 1').first<{ id: string }>();

    if (existing) {
      const { sql, values } = buildUpdateQuery('settings', existing.id, body);
      await context.env.DB.prepare(sql).bind(...values).run();
    } else {
      const toInsert = { ...body, id: body.id || 'default' };
      const { sql, values } = buildUpsertQuery('settings', toInsert);
      await context.env.DB.prepare(sql).bind(...values).run();
    }

    const updated = await context.env.DB.prepare('SELECT * FROM settings LIMIT 1').first();
    return successResponse(parseJsonFields(updated as Record<string, any>, 'settings'));
  } catch (err: any) {
    console.error('PUT /api/settings error:', err);
    return errorResponse(err.message || 'Failed to update settings', 'DB_ERROR', 500);
  }
};
