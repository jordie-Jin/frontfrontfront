// 로컬 목 데이터를 위한 API 레이어입니다.
import {
  CompanyConfirmResult,
  CompanyOverview,
  CompanySearchItem,
  CompanySearchResponse,
} from '../types/company';
import { ModelRunRequest, ModelRunResponse } from '../types/model';
import { getMockCompanyOverview } from '../mocks/companies.mock';

const createCompanyId = (index: number) => {
  const seed = (index + 1).toString(16).padStart(12, '0');
  const tail = (index * 97 + 531).toString(16).padStart(12, '0');
  return `a1b2c3d4-${seed.slice(0, 4)}-${seed.slice(4, 8)}-${seed.slice(8, 12)}-${tail.slice(0, 12)}`;
};

const COMPANY_SEEDS = [
  { name: '한빛정밀', code: 'HB-210', sector: { key: 'manufacturing', label: '제조' } },
  { name: '로터스건설', code: 'LT-908', sector: { key: 'construction', label: '건설' } },
  { name: '네오클라우드', code: 'NC-441', sector: { key: 'it', label: 'IT' } },
  { name: '오로라물류', code: 'AL-778', sector: { key: 'logistics', label: '물류' } },
  { name: '블루핀바이오', code: 'BP-156', sector: { key: 'bio', label: '바이오' } },
  { name: '스톤브릿지에너지', code: 'SB-332', sector: { key: 'energy', label: '에너지' } },
  { name: '드림소프트웨어', code: 'DS-501', sector: { key: 'it', label: 'IT' } },
  { name: '파인어패럴', code: 'PA-284', sector: { key: 'retail', label: '유통' } },
  { name: '시그마철강', code: 'SG-449', sector: { key: 'manufacturing', label: '제조' } },
  { name: '뉴웨이브마케팅', code: 'NW-072', sector: { key: 'service', label: '서비스' } },
  { name: '메가푸드랩', code: 'MF-611', sector: { key: 'food', label: '식품' } },
  { name: '세림헬스케어', code: 'SH-921', sector: { key: 'healthcare', label: '헬스케어' } },
  { name: '에버그린모빌리티', code: 'EG-144', sector: { key: 'mobility', label: '모빌리티' } },
  { name: '리버스핀테크', code: 'RF-775', sector: { key: 'fintech', label: '핀테크' } },
  { name: '코어로보틱스', code: 'CR-010', sector: { key: 'robotics', label: '로봇' } },
  { name: '오션프라임', code: 'OP-509', sector: { key: 'shipping', label: '해운' } },
  { name: '하이랜드건자재', code: 'HL-608', sector: { key: 'construction', label: '건설' } },
  { name: '스카이라인미디어', code: 'SL-304', sector: { key: 'media', label: '미디어' } },
  { name: '포레스트케미칼', code: 'FC-117', sector: { key: 'chem', label: '화학' } },
  { name: '밸류애널리틱스', code: 'VA-663', sector: { key: 'data', label: '데이터' } },
  { name: '큐브하이브', code: 'CH-202', sector: { key: 'it', label: 'IT' } },
  { name: '그린스톤플랜트', code: 'GP-391', sector: { key: 'plant', label: '플랜트' } },
  { name: '엘리먼트테크', code: 'ET-052', sector: { key: 'semicon', label: '반도체' } },
  { name: '아틀라스메탈', code: 'AM-830', sector: { key: 'manufacturing', label: '제조' } },
  { name: '세컨드루프리테일', code: 'SR-270', sector: { key: 'retail', label: '유통' } },
  { name: '노바스마트팩토리', code: 'NS-945', sector: { key: 'smart-factory', label: '스마트팩토리' } },
  { name: '라이트하버건설', code: 'LH-514', sector: { key: 'construction', label: '건설' } },
  { name: '프리즘금융', code: 'PF-121', sector: { key: 'finance', label: '금융' } },
  { name: '썬라이즈바이오', code: 'SB-818', sector: { key: 'bio', label: '바이오' } },
  { name: '알파링크커머스', code: 'AL-690', sector: { key: 'commerce', label: '커머스' } },
];

const MOCK_COMPANIES: CompanySearchItem[] = COMPANY_SEEDS.map((seed, index) => ({
  companyId: createCompanyId(index),
  name: seed.name,
  code: seed.code,
  sector: seed.sector,
}));

export const mockSearchCompanies = async (payload: {
  name?: string;
  code?: string;
}): Promise<CompanySearchResponse> => {
  const name = payload.name?.trim().toLowerCase();
  const code = payload.code?.trim().toLowerCase();
  const matches = MOCK_COMPANIES.filter((company) => {
    const matchesName = name ? company.name.toLowerCase().includes(name) : true;
    const matchesCode = code ? company.code.toLowerCase().includes(code) : true;
    return matchesName && matchesCode;
  });
  return {
    items: matches.slice(0, 10),
    count: matches.length,
  };
};

export const mockConfirmCompany = async (payload: {
  companyId?: string;
  code?: string;
  name?: string;
}): Promise<CompanyConfirmResult> => {
  const selected = payload.companyId
    ? MOCK_COMPANIES.find((company) => company.companyId === payload.companyId)
    : MOCK_COMPANIES.find((company) => company.code === payload.code);

  if (!selected) {
    return {
      companyId: payload.companyId ?? payload.code ?? 'unknown',
      name: payload.name,
      sector: undefined,
      modelStatus: 'PROCESSING',
      isCached: false,
      lastAnalyzedAt: null,
    };
  }

  return {
    companyId: selected.companyId ?? selected.code,
    name: selected.name,
    sector: selected.sector,
    modelStatus: 'EXISTING',
    isCached: true,
    lastAnalyzedAt: '2024-11-01T12:30:00Z',
  };
};

export const mockGetCompanyOverview = async (companyId: string): Promise<CompanyOverview> => {
  return getMockCompanyOverview(companyId);
};

export const mockRunModel = async (payload: ModelRunRequest): Promise<ModelRunResponse> => {
  return {
    jobId: `job-${payload.companyId.slice(0, 6)}-${Date.now().toString(36)}`,
    status: 'queued',
  };
};

export const simulateLatency = async () => {
  const delay = 400 + Math.floor(Math.random() * 500);
  return new Promise((resolve) => setTimeout(resolve, delay));
};
