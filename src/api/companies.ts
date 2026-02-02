// 협력사 관련 API 호출 헬퍼입니다.
import { apiGet, apiPost } from './client';
import {
  CompanyConfirmRequest,
  CompanyConfirmResult,
  CompanyOverview,
  CompanySearchResponse,
  CompanySummary,
  UpdateRequestCreate,
} from '../types/company';
import { DashboardSummary } from '../types/dashboard';

export const searchCompanies = async (params: {
  name?: string;
  code?: string;
  limit?: number;
}): Promise<CompanySearchResponse> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  const response = await apiGet<{ data: CompanySearchResponse }>('/api/companies/search', params);
  return response.data;
};

export const confirmCompany = async (
  payload: CompanyConfirmRequest,
): Promise<CompanyConfirmResult> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  const response = await apiPost<{ data: CompanyConfirmResult }, CompanyConfirmRequest>(
    '/api/companies/confirm',
    payload,
  );
  return response.data;
};

export const listCompanies = async (params?: {
  q?: string;
  sector?: string;
  risk?: string;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<CompanySummary[]> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  const response = await apiGet<{ data: { items: CompanySummary[] } }>('/api/companies', params);
  return response.data.items;
};

export const getCompanySummary = async (companyId: string): Promise<CompanySummary> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  const response = await apiGet<{ data: CompanySummary }>(`/api/companies/${companyId}`);
  return response.data;
};

export const getCompanyOverview = async (companyId: string): Promise<CompanyOverview> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  const response = await apiGet<{ data: CompanyOverview }>(
    `/api/companies/${companyId}/overview`,
  );
  return response.data;
};

export const getDashboardSummary = async (range?: string): Promise<DashboardSummary> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  const response = await apiGet<{ data: DashboardSummary }>('/api/dashboard/summary', {
    range,
  });
  return response.data;
};

export const createUpdateRequest = async (
  companyId: string,
  payload?: UpdateRequestCreate,
): Promise<{ id: number }> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  const response = await apiPost<{ data: { id: number } }, UpdateRequestCreate | undefined>(
    `/api/companies/${companyId}/update-requests`,
    payload,
  );
  return response.data;
};
