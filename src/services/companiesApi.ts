// 협력사 API 호출을 위한 서비스 레이어입니다.
import { INITIAL_COMPANIES, getMockCompanyOverview } from '../mocks/companies.mock';
import { CompanyOverview, CompanySummary } from '../types/company';

const simulateDelay = async (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchCompanies = async (): Promise<CompanySummary[]> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  await simulateDelay();
  return INITIAL_COMPANIES;
};

export const fetchCompanyOverview = async (id: string): Promise<CompanyOverview> => {
  // TODO(API 연결): 더미 데이터 제거 후 이 함수 사용
  await simulateDelay();
  return getMockCompanyOverview(id);
};
