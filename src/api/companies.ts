// 협력사 관련 API 호출 헬퍼입니다.
import { ApiRequestError, apiGet, apiPost } from './client';
import {
  CompanyConfirmRequest,
  CompanyConfirmResult,
  CompanyInsightItem,
  CompanyInsightsResponse,
  CompanyOverview,
  CompanyAiAnalysisResponse,
  CompanySearchResponse,
  CompanySummary,
  UpdateRequestCreate,
} from '../types/company';
import { DashboardSummary } from '../types/dashboard';
import { CompanyQuarterRisk } from '../types/risk';
import { getAuthToken } from '../services/auth';

const resolveBaseUrl = () => (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

const buildUrl = (
  url: string,
  params?: Record<string, string | number | boolean | undefined>,
): string => {
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

export const searchCompanies = async (params: {
  keyword?: string;
  name?: string;
  code?: string;
}): Promise<CompanySearchResponse> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  const normalizedParams =
    params.keyword && !params.name && !params.code
      ? { ...params, name: params.keyword }
      : params;

  return apiGet<CompanySearchResponse>('/api/companies/search', normalizedParams);
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

export const createWatchlistCompany = async (payload: {
  companyId: number;
  note?: string;
}): Promise<string> => {
  return apiPost<string, { companyId: number; note?: string }>(
    '/api/watchlists',
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
  userId?: string;
}): Promise<CompanySummary[]> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  return apiGet<CompanySummary[]>('/api/companies', params);
};

export const getCompanySummary = async (
  companyId: string,
  params?: { userId?: string },
): Promise<CompanySummary> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  return apiGet<CompanySummary>(`/api/companies/${companyId}`, params);
};

export const getCompanyOverview = async (
  companyId: string,
  params?: { userId?: string; quarterKey?: string },
): Promise<CompanyOverview> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  return apiGet<CompanyOverview>(`/api/companies/${companyId}/overview`, params);
};

export const getCompanyInsights = async (
  companyId: string,
  params?: { userId?: string },
): Promise<CompanyInsightItem[]> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  const response = await apiGet<CompanyInsightItem[] | CompanyInsightsResponse>(
    `/api/companies/${companyId}/insights`,
    params,
  );

  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.items) ? response.items : [];
};

export const getDashboardSummary = async (params?: {
  userId?: string;
}): Promise<DashboardSummary> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  return apiGet<DashboardSummary>('/api/dashboard/summary', params);
};

export const getDashboardRiskRecords = async (params?: {
  range?: string;
  limit?: number;
  userId?: string;
}): Promise<CompanyQuarterRisk[]> => {
  return apiGet<CompanyQuarterRisk[]>('/api/dashboard/risk-records', params);
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

export const getCompanyAiAnalysis = async (
  companyCode: string,
  params?: { year?: number; quarter?: number; userId?: string },
): Promise<CompanyAiAnalysisResponse> => {
  return apiGet<CompanyAiAnalysisResponse>(
    `/api/companies/${companyCode}/ai-analysis`,
    params,
  );
};

export const downloadCompanyAiReport = async (
  companyCode: string,
  params: { year: number; quarter: number; userId?: string },
): Promise<Blob> => {
  const url = buildUrl(`/api/companies/${companyCode}/ai-report/download`, params);
  const token = getAuthToken();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new ApiRequestError('AI 리포트 다운로드에 실패했습니다.', {
      status: response.status,
    });
  }

  return response.blob();
};
