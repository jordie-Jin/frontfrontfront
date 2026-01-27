import { httpGet, httpPost } from './http';
import { CompanyDetail, CompanySearchResponse } from '../types/company';

export const searchCompanies = async (payload: { name?: string; code?: string }): Promise<CompanySearchResponse> => {
  return httpPost<CompanySearchResponse, { name?: string; code?: string }>('/api/companies/search', payload);
};

export const getCompanyDetail = async (companyId: string): Promise<CompanyDetail> => {
  return httpGet<CompanyDetail>(`/api/companies/${companyId}`);
};
