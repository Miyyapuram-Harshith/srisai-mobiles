/**
 * Shared error definitions for the API layer.
 */

export class ApiError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const Errors = {
  notFound: (resource: string) =>
    new ApiError(`${resource} not found`, 'NOT_FOUND', 404),

  badRequest: (message: string) =>
    new ApiError(message, 'BAD_REQUEST', 400),

  unauthorized: (message = 'Authentication required') =>
    new ApiError(message, 'UNAUTHORIZED', 401),

  forbidden: (message = 'Insufficient permissions') =>
    new ApiError(message, 'FORBIDDEN', 403),

  internal: (message = 'Internal server error') =>
    new ApiError(message, 'INTERNAL_ERROR', 500),

  methodNotAllowed: () =>
    new ApiError('Method not allowed', 'METHOD_NOT_ALLOWED', 405),
};
