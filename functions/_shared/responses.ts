/**
 * Shared API response utilities.
 * Ensures a consistent JSON response format across all endpoints.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/**
 * Standard success response.
 * { success: true, data: ... }
 */
export function successResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: CORS_HEADERS,
  });
}

/**
 * Standard error response.
 * { success: false, error: { code: "...", message: "..." } }
 */
export function errorResponse(message: string, code = 'INTERNAL_ERROR', status = 500): Response {
  return new Response(JSON.stringify({ success: false, error: { code, message } }), {
    status,
    headers: CORS_HEADERS,
  });
}

/**
 * Handle CORS preflight OPTIONS requests.
 */
export function handleCors(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
