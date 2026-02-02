// HTTP 요청을 위한 API 클라이언트 래퍼입니다.
import { getAuthToken } from '../services/auth';

type HttpMethod = 'GET' | 'POST';

interface RequestOptions {
  method: HttpMethod;
  url: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

const buildUrl = (url: string, params?: RequestOptions['params']): string => {
  if (!params) return url;
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `${url}?${query}` : url;
};

const request = async <T>({ method, url, body, params }: RequestOptions): Promise<T> => {
  const token = getAuthToken();
  const response = await fetch(buildUrl(url, params), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return (await response.json()) as T;
};

export const apiGet = async <T>(url: string, params?: RequestOptions['params']): Promise<T> =>
  request<T>({ method: 'GET', url, params });

export const apiPost = async <T, B = unknown>(url: string, body: B): Promise<T> =>
  request<T>({ method: 'POST', url, body });
