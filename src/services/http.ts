import { mockGetCompanyDetail, mockRunModel, mockSearchCompanies, simulateLatency } from './mockApi';
import { ModelRunRequest } from '../types/model';

const USE_MOCK_API = true;

type HttpMethod = 'GET' | 'POST';

const mockRequest = async <T>(method: HttpMethod, url: string, body?: unknown): Promise<T> => {
  await simulateLatency();

  if (method === 'POST' && url === '/api/companies/search') {
    return (await mockSearchCompanies(body as { name?: string; code?: string })) as T;
  }

  if (method === 'GET' && url.startsWith('/api/companies/')) {
    const companyId = url.split('/api/companies/')[1];
    return (await mockGetCompanyDetail(companyId)) as T;
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

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error('Request failed');
  }

  return (await response.json()) as T;
};

export const httpGet = async <T>(url: string): Promise<T> => request<T>('GET', url);

export const httpPost = async <T, B = unknown>(url: string, body: B): Promise<T> => request<T>('POST', url, body);
