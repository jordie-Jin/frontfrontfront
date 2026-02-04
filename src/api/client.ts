// HTTP 요청을 위한 API 클라이언트 래퍼입니다.
import {
  clearStoredSession,
  getAuthToken,
  refreshAccessToken,
  updateStoredToken,
} from '../services/auth';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method: HttpMethod;
  url: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  withCredentials?: boolean;
  retryAttempted?: boolean;
}

export interface ApiErrorDetail {
  field?: string;
  message?: string;
}

export interface ApiError {
  code?: string;
  message?: string;
  timestamp?: string;
  path?: string;
  errors?: ApiErrorDetail[];
  status?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError | null;
  timestamp: string;
}

export class ApiRequestError extends Error {
  apiError?: ApiError;

  constructor(message: string, apiError?: ApiError) {
    super(message);
    this.name = 'ApiRequestError';
    this.apiError = apiError;
  }
}

const resolveBaseUrl = () => (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

const buildUrl = (url: string, params?: RequestOptions['params']): string => {
  const baseUrl = resolveBaseUrl();
  const resolvedUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const finalUrl = new URL(resolvedUrl, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      finalUrl.searchParams.set(key, String(value));
    });
  }

  return finalUrl.toString();
};

const request = async <T>({
  method,
  url,
  body,
  params,
  skipAuth = false,
  withCredentials = false,
  retryAttempted = false,
}: RequestOptions): Promise<T> => {
  const token = skipAuth ? null : getAuthToken();
  const resolvedUrl = buildUrl(url, params);
  const response = await fetch(resolvedUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: withCredentials ? 'include' : 'omit',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (
    response.status === 401 &&
    !skipAuth &&
    !retryAttempted &&
    !isRefreshEndpoint(resolvedUrl)
  ) {
    try {
      const refreshResponse = await refreshAccessToken();
      updateStoredToken(refreshResponse.accessToken);
      return request({ method, url, body, params, skipAuth, withCredentials, retryAttempted: true });
    } catch (error) {
      clearStoredSession();
      window.location.href = '/';
      throw error;
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiRequestError('API request failed', { status: response.status });
    }
    return undefined as T;
  }

  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    let apiError: ApiError | undefined;
    let message = 'API request failed';

    if (isApiResponse(payload)) {
      apiError = payload.error ?? undefined;
      if (typeof apiError?.message === 'string') {
        message = apiError.message;
      }
    } else if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      if (typeof record.message === 'string') {
        message = record.message;
      }
      apiError = { message, status: response.status };
    }

    apiError = { ...(apiError ?? {}), status: apiError?.status ?? response.status };
    throw new ApiRequestError(message, apiError);
  }

  return payload as T;
};

const isApiResponse = (payload: unknown): payload is ApiResponse<unknown> => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const record = payload as Record<string, unknown>;
  return (
    typeof record.success === 'boolean' &&
    'data' in record &&
    typeof record.timestamp === 'string'
  );
};

const isRefreshEndpoint = (resolvedUrl: string): boolean => {
  try {
    const url = new URL(resolvedUrl, window.location.origin);
    return url.pathname.endsWith('/api/auth/refresh');
  } catch {
    return false;
  }
};

const unwrapApiResponse = <T>(
  payload: ApiResponse<T>
): T => {
  if (!payload.success || payload.error) {
    const message =
      typeof payload.error?.message === 'string'
        ? payload.error.message
        : 'API request failed';

    throw new ApiRequestError(message, payload.error ?? undefined);
  }

  return payload.data;
};

export const apiGet = async <T>(
  url: string,
  params?: RequestOptions['params'],
  options?: Pick<RequestOptions, 'skipAuth' | 'withCredentials'>,
): Promise<T> => {
  const response = await request<ApiResponse<T>>({ method: 'GET', url, params, ...options });
  return unwrapApiResponse(response);
};

export const apiPost = async <T, B = unknown>(
  url: string,
  body: B,
  options?: Pick<RequestOptions, 'skipAuth' | 'withCredentials'>,
): Promise<T> => {
  const response = await request<ApiResponse<T>>({ method: 'POST', url, body, ...options });
  return unwrapApiResponse(response);
};

export const apiPatch = async <T, B = unknown>(
  url: string,
  body: B,
  options?: Pick<RequestOptions, 'skipAuth' | 'withCredentials'>,
): Promise<T> => {
  const response = await request<ApiResponse<T>>({ method: 'PATCH', url, body, ...options });
  return unwrapApiResponse(response);
};

export const apiDelete = async <T>(
  url: string,
  options?: Pick<RequestOptions, 'skipAuth' | 'withCredentials'>,
): Promise<T> => {
  const response = await request<ApiResponse<T>>({ method: 'DELETE', url, ...options });
  return unwrapApiResponse(response);
};

export const apiRequest = request;
