/**
 * /api/upload
 * 
 * POST - Uploads a file to R2 bucket.
 */

import { successResponse, errorResponse, handleCors } from '../_shared/responses';

interface Env {
  STORAGE: R2Bucket;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return handleCors();
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    if (!context.env.STORAGE) {
      return errorResponse('R2 Storage bucket is not configured yet', 'STORAGE_NOT_CONFIGURED', 503);
    }

    const formData = await context.request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return errorResponse('No file provided in form data field "file"', 'BAD_REQUEST', 400);
    }

    const fileObj = file as File;
    const sanitizedName = fileObj.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `uploads/${Date.now()}-${sanitizedName}`;

    await context.env.STORAGE.put(key, await fileObj.arrayBuffer(), {
      httpMetadata: {
        contentType: fileObj.type || 'application/octet-stream',
      },
    });

    const url = `/api/storage/${key}`;
    return successResponse({ url, key }, 201);
  } catch (err: any) {
    console.error('POST /api/upload error:', err);
    return errorResponse(err.message || 'Failed to upload file', 'STORAGE_ERROR', 500);
  }
};
