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
  return apiGet<CompanySearchResponse>('/api/companies/search', params);
};

export const confirmCompany = async (
  payload: CompanyConfirmRequest,
): Promise<CompanyConfirmResult> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  return apiPost<CompanyConfirmResult, CompanyConfirmRequest>(
    '/api/companies/confirm',
    payload,
  );
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
  return apiGet<CompanySummary[]>('/api/companies', params);
};

export const getCompanySummary = async (companyId: string): Promise<CompanySummary> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  return apiGet<CompanySummary>(`/api/companies/${companyId}`);
};

export const getCompanyOverview = async (companyId: string): Promise<CompanyOverview> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  return apiGet<CompanyOverview>(`/api/companies/${companyId}/overview`);
};

export const getDashboardSummary = async (range?: string): Promise<DashboardSummary> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  return apiGet<DashboardSummary>('/api/dashboard/summary', {
    range,
  });
};

export const createUpdateRequest = async (
  companyId: string,
  payload?: UpdateRequestCreate,
): Promise<{ id: number }> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  return apiPost<{ id: number }, UpdateRequestCreate | undefined>(
    `/api/companies/${companyId}/update-requests`,
    payload,
  );
};
