export interface ApiErrorPayload {
  code: string;
  message: string;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFailure {
  success: false;
  error: ApiErrorPayload;
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code = 'REQUEST_FAILED') {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  body?: unknown;
};

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      method,
      headers: requestHeaders,
      credentials: 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiClientError('Unable to reach the server. Please try again.', 0, 'NETWORK_ERROR');
  }

  let payload: ApiResponse<T>;
  try {
    payload = await response.json() as ApiResponse<T>;
  } catch {
    throw new ApiClientError('The server returned an invalid response.', response.status, 'INVALID_RESPONSE');
  }

  if (!response.ok || !payload.success) {
    const error = !payload.success ? payload.error : undefined;
    throw new ApiClientError(error?.message || 'Request failed.', response.status, error?.code);
  }

  return payload.data;
}

/**
 * Shared browser-to-Pages-Function transport. Keeping requests here gives
 * later authentication work one place to add session headers and handling.
 */
export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('DELETE', path, options),
};
