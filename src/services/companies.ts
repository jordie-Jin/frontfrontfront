// 앱 흐름에 맞춘 협력사 서비스 헬퍼입니다.
import { httpGet, httpPost } from './http';
import {
  CompanyConfirmRequest,
  CompanyConfirmResult,
  CompanyOverview,
  CompanySearchResponse,
} from '../types/company';

const buildSearchQuery = (payload: { name?: string; code?: string }) => {
  const params = new URLSearchParams();
  if (payload.name) params.append('name', payload.name);
  if (payload.code) params.append('code', payload.code);
  return params.toString();
};

export const searchCompanies = async (payload: { name?: string; code?: string }): Promise<CompanySearchResponse> => {
  const query = buildSearchQuery(payload);
  return httpGet<CompanySearchResponse>(`/api/companies/search${query ? `?${query}` : ''}`);
};

export const confirmCompany = async (
  payload: CompanyConfirmRequest,
): Promise<CompanyConfirmResult> => {
  return httpPost<CompanyConfirmResult, CompanyConfirmRequest>('/api/companies/confirm', payload);
};

export const getCompanyOverview = async (companyId: string): Promise<CompanyOverview> => {
  return httpGet<CompanyOverview>(`/api/companies/${companyId}/overview`);
};
