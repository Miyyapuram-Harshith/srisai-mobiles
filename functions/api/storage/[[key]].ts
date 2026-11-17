/**
 * /api/storage/*
 * 
 * GET - Serves an object directly from R2.
 */

import { handleCors, errorResponse } from '../../_shared/responses';

interface Env {
  STORAGE: R2Bucket;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return handleCors();
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    if (!context.env.STORAGE) {
      return errorResponse('R2 Storage bucket is not configured yet', 'STORAGE_NOT_CONFIGURED', 503);
    }

    const rawKey = context.params.key;
    const key = Array.isArray(rawKey) ? rawKey.join('/') : (rawKey as string);

    if (!key) {
      return errorResponse('Object key required', 'BAD_REQUEST', 400);
    }

    const object = await context.env.STORAGE.get(key);
    if (!object) {
      return errorResponse('Object not found', 'NOT_FOUND', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, { headers });
  } catch (err: any) {
    console.error('GET /api/storage error:', err);
    return errorResponse(err.message || 'Failed to retrieve object', 'STORAGE_ERROR', 500);
  }
};
