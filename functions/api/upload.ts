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

    // Security: Validate file size (max 15MB)
    if (fileObj.size > 15 * 1024 * 1024) {
      return errorResponse('File exceeds maximum allowed size of 15MB', 'FILE_TOO_LARGE', 400);
    }

    // Security: Validate allowed MIME types (Images & Videos only)
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (fileObj.type && !ALLOWED_TYPES.includes(fileObj.type.toLowerCase())) {
      return errorResponse('Invalid file type. Only JPEG, PNG, WebP, GIF, and MP4 media are permitted.', 'FORBIDDEN_FILE_TYPE', 400);
    }

    // Security: Prevent directory traversal and normalize file extension
    const cleanExt = (fileObj.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const safeExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm'];
    if (!safeExtensions.includes(cleanExt)) {
      return errorResponse('Unsafe file extension.', 'FORBIDDEN_EXTENSION', 400);
    }

    const sanitizedBase = fileObj.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    const key = `uploads/${Date.now()}-${sanitizedBase}.${cleanExt}`;

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
