// HTTP 요청을 위한 API 클라이언트 래퍼입니다.
import { getAuthToken } from '../services/auth';

type HttpMethod = 'GET' | 'POST';

interface RequestOptions {
  method: HttpMethod;
  url: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiResponse<T> {
  data: T;
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

  if (!response.ok) {
    throw new Error('API request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const apiGet = async <T>(url: string, params?: RequestOptions['params']): Promise<T> => {
  const response = await request<ApiResponse<T>>({ method: 'GET', url, params });
  return response.data;
};

export const apiPost = async <T, B = unknown>(url: string, body: B): Promise<T> => {
  const response = await request<ApiResponse<T>>({ method: 'POST', url, body });
  return response.data;
};

export const apiRequest = request;
