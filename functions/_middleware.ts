/**
 * Global Middleware for Cloudflare Pages Functions
 * Enforces security headers, CORS protection, and payload guardrails across all API routes.
 */

export const onRequest: PagesFunction = async (context) => {
  // 1. CORS Preflight Handling
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // 2. Request payload guardrails (Reject body > 15MB)
  const contentLength = context.request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > 15 * 1024 * 1024) {
    return new Response(
      JSON.stringify({ success: false, error: { message: 'Payload exceeds 15MB limit', code: 'PAYLOAD_TOO_LARGE' } }),
      {
        status: 413,
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }

  // 3. Process downstream API handler
  const response = await context.next();

  // 4. Attach strict security headers to all responses
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
