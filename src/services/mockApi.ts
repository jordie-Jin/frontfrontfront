import { CompanyDetail, CompanySearchItem, CompanySearchResponse } from '../types/company';
import { ModelRunRequest, ModelRunResponse } from '../types/model';

const createCompanyId = (index: number) => {
  const seed = (index + 1).toString(16).padStart(12, '0');
  const tail = (index * 97 + 531).toString(16).padStart(12, '0');
  return `a1b2c3d4-${seed.slice(0, 4)}-${seed.slice(4, 8)}-${seed.slice(8, 12)}-${tail.slice(0, 12)}`;
};

const COMPANY_SEEDS = [
  { name: '한빛정밀', code: 'HB-210', industry: '제조', region: '경기' },
  { name: '로터스건설', code: 'LT-908', industry: '건설', region: '서울' },
  { name: '네오클라우드', code: 'NC-441', industry: 'IT', region: '서울' },
  { name: '오로라물류', code: 'AL-778', industry: '물류', region: '부산' },
  { name: '블루핀바이오', code: 'BP-156', industry: '바이오', region: '대전' },
  { name: '스톤브릿지에너지', code: 'SB-332', industry: '에너지', region: '울산' },
  { name: '드림소프트웨어', code: 'DS-501', industry: 'IT', region: '판교' },
  { name: '파인어패럴', code: 'PA-284', industry: '유통', region: '서울' },
  { name: '시그마철강', code: 'SG-449', industry: '제조', region: '포항' },
  { name: '뉴웨이브마케팅', code: 'NW-072', industry: '서비스', region: '서울' },
  { name: '메가푸드랩', code: 'MF-611', industry: '식품', region: '광주' },
  { name: '세림헬스케어', code: 'SH-921', industry: '헬스케어', region: '서울' },
  { name: '에버그린모빌리티', code: 'EG-144', industry: '모빌리티', region: '수원' },
  { name: '리버스핀테크', code: 'RF-775', industry: '핀테크', region: '서울' },
  { name: '코어로보틱스', code: 'CR-010', industry: '로봇', region: '대구' },
  { name: '오션프라임', code: 'OP-509', industry: '해운', region: '부산' },
  { name: '하이랜드건자재', code: 'HL-608', industry: '건설', region: '인천' },
  { name: '스카이라인미디어', code: 'SL-304', industry: '미디어', region: '서울' },
  { name: '포레스트케미칼', code: 'FC-117', industry: '화학', region: '울산' },
  { name: '밸류애널리틱스', code: 'VA-663', industry: '데이터', region: '서울' },
  { name: '큐브하이브', code: 'CH-202', industry: 'IT', region: '판교' },
  { name: '그린스톤플랜트', code: 'GP-391', industry: '플랜트', region: '여수' },
  { name: '엘리먼트테크', code: 'ET-052', industry: '반도체', region: '이천' },
  { name: '아틀라스메탈', code: 'AM-830', industry: '제조', region: '창원' },
  { name: '세컨드루프리테일', code: 'SR-270', industry: '유통', region: '서울' },
  { name: '노바스마트팩토리', code: 'NS-945', industry: '스마트팩토리', region: '구미' },
  { name: '라이트하버건설', code: 'LH-514', industry: '건설', region: '부산' },
  { name: '프리즘금융', code: 'PF-121', industry: '금융', region: '서울' },
  { name: '썬라이즈바이오', code: 'SB-818', industry: '바이오', region: '대전' },
  { name: '알파링크커머스', code: 'AL-690', industry: '커머스', region: '서울' }
];

const MOCK_COMPANIES: CompanySearchItem[] = COMPANY_SEEDS.map((seed, index) => ({
  companyId: createCompanyId(index),
  name: seed.name,
  code: seed.code,
  industry: seed.industry,
  region: seed.region
}));

const RISK_LEVELS: CompanyDetail['riskLevel'][] = ['low', 'medium', 'high'];

const pickRiskLevel = (index: number) => RISK_LEVELS[index % RISK_LEVELS.length];

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
    total: matches.length
  };
};

export const mockGetCompanyDetail = async (companyId: string): Promise<CompanyDetail> => {
  const base = MOCK_COMPANIES.find((company) => company.companyId === companyId);
  if (!base) {
    throw new Error('Company not found');
  }

  const index = MOCK_COMPANIES.findIndex((company) => company.companyId === companyId);
  return {
    ...base,
    foundedYear: 1998 + (index % 20),
    employeeCount: 120 + index * 7,
    revenueBillionKrw: 120 + index * 9,
    riskLevel: pickRiskLevel(index),
    overview: `${base.name}는 ${base.industry} 분야에서 안정적인 파이프라인을 유지하며, ${base.region} 거점을 중심으로 성장하고 있습니다.`,
    highlights: [
      '최근 3개 분기 매출 성장세 유지',
      `${base.region} 핵심 고객사와 장기 공급 계약`,
      '디지털 전환 로드맵 수립 완료'
    ]
  };
};

export const mockRunModel = async (payload: ModelRunRequest): Promise<ModelRunResponse> => {
  return {
    jobId: `job-${payload.companyId.slice(0, 6)}-${Date.now().toString(36)}`,
    status: 'queued'
  };
};

export const simulateLatency = async () => {
  const delay = 400 + Math.floor(Math.random() * 500);
  return new Promise((resolve) => setTimeout(resolve, delay));
};
