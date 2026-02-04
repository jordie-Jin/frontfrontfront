// HTTP 요청을 위한 API 클라이언트 래퍼입니다.
import { getAuthToken } from '../services/auth';

type HttpMethod = 'GET' | 'POST';

interface RequestOptions {
  method: HttpMethod;
  url: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
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

const request = async <T>({ method, url, body, params }: RequestOptions): Promise<T> => {
  const token = getAuthToken();
  const response = await fetch(buildUrl(url, params), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new Error('API request failed');
    }
    return undefined as T;
  }

  const payload = (await response.json()) as T;

  if (!response.ok) {
    const message =
      typeof (payload as { error?: { message?: string } }).error?.message === 'string'
        ? (payload as { error: { message: string } }).error.message
        : 'API request failed';
    throw new Error(message);
  }

  return payload;
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

export const apiGet = async <T>(url: string, params?: RequestOptions['params']): Promise<T> => {
  const response = await request<ApiResponse<T>>({ method: 'GET', url, params });
  return unwrapApiResponse(response);
};

export const apiPost = async <T, B = unknown>(url: string, body: B): Promise<T> => {
  const response = await request<ApiResponse<T>>({ method: 'POST', url, body });
  return unwrapApiResponse(response);
};

export const apiRequest = request;
