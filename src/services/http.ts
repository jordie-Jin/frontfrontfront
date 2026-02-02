// 공용 인터셉터를 포함한 HTTP 클라이언트 설정입니다.
import { getAuthToken } from './auth';
import {
  mockConfirmCompany,
  mockGetCompanyOverview,
  mockRunModel,
  mockSearchCompanies,
  simulateLatency,
} from './mockApi';
import { ModelRunRequest } from '../types/model';

const USE_MOCK_API = true;

type HttpMethod = 'GET' | 'POST';

const parseQuery = (url: string): Record<string, string | undefined> => {
  const [, query] = url.split('?');
  if (!query) return {};
  const params = new URLSearchParams(query);
  return {
    name: params.get('name') ?? undefined,
    code: params.get('code') ?? undefined,
  };
};

const mockRequest = async <T>(method: HttpMethod, url: string, body?: unknown): Promise<T> => {
  await simulateLatency();

  if (method === 'GET' && url.startsWith('/api/companies/search')) {
    return (await mockSearchCompanies(parseQuery(url))) as T;
  }

  if (method === 'POST' && url === '/api/companies/confirm') {
    return (await mockConfirmCompany(body as { companyId?: string; code?: string; name?: string })) as T;
  }

  if (method === 'GET' && url.startsWith('/api/companies/') && url.endsWith('/overview')) {
    const companyId = url.split('/api/companies/')[1].replace('/overview', '');
    return (await mockGetCompanyOverview(companyId)) as T;
  }

  if (method === 'POST' && url === '/api/model/run') {
    return (await mockRunModel(body as ModelRunRequest)) as T;
  }

  throw new Error('Mock endpoint not found');
};

const request = async <T>(method: HttpMethod, url: string, body?: unknown): Promise<T> => {
  if (USE_MOCK_API) {
    return mockRequest<T>(method, url, body);
  }

  const token = getAuthToken();
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error('Request failed');
  }

  return (await response.json()) as T;
};

export const httpGet = async <T>(url: string): Promise<T> => request<T>('GET', url);

export const httpPost = async <T, B = unknown>(url: string, body: B): Promise<T> =>
  request<T>('POST', url, body);
