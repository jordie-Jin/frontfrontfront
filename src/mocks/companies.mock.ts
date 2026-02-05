// 협력사 목록을 위한 목 데이터입니다.
import {
  CompanyOverview,
  CompanySummary,
  CompanyTimelineItem,
  ForecastResponse,
  MetricItem,
  SignalLight,
} from '../types/company';

export const INITIAL_COMPANIES: CompanySummary[] = [
  {
    id: 'c-001',
    name: '삼성물류',
    sector: { key: 'logistics', label: '물류/SCM' },
    overallScore: 92,
    riskLevel: 'SAFE',
    lastUpdatedAt: '2024-11-01',
    kpi: { networkHealth: 92, annualRevenue: 4200, reputationScore: 92 },
  },
  {
    id: 'c-002',
    name: '네오클라우드',
    sector: { key: 'it-platform', label: 'IT/플랫폼' },
    overallScore: 88,
    riskLevel: 'SAFE',
    lastUpdatedAt: '2024-11-02',
    kpi: { networkHealth: 88, annualRevenue: 1800, reputationScore: 89 },
  },
  {
    id: 'c-003',
    name: '바이오넥스',
    sector: { key: 'bio-health', label: '바이오/헬스' },
    overallScore: 45,
    riskLevel: 'RISK',
    lastUpdatedAt: '2024-10-28',
    kpi: { networkHealth: 45, annualRevenue: 900, reputationScore: 54 },
  },
  {
    id: 'c-004',
    name: '한빛기공',
    sector: { key: 'manufacturing', label: '제조업' },
    overallScore: 78,
    riskLevel: 'SAFE',
    lastUpdatedAt: '2024-10-30',
    kpi: { networkHealth: 78, annualRevenue: 12500, reputationScore: 86 },
  },
  {
    id: 'c-005',
    name: '솔라젠에너지',
    sector: { key: 'renewable', label: '신재생에너지' },
    overallScore: 62,
    riskLevel: 'WARN',
    lastUpdatedAt: '2024-11-03',
    kpi: { networkHealth: 62, annualRevenue: 2100, reputationScore: 68 },
  },
];

const BASE_TIMELINE: CompanyTimelineItem[] = [
  { date: '2024-11-12', title: '정기 컴플라이언스 점검 완료', tone: 'positive' },
  { date: '2024-09-05', title: '분기 전략 정렬 미팅 진행', tone: 'neutral' },
  { date: '2024-06-22', title: '공급망 지연 경보 발생', tone: 'risk' },
  { date: '2024-01-18', title: '파트너십 갱신 계약 체결', tone: 'positive' },
];

const clampPercent = (value: number) => Math.max(1, Math.min(99, value));

const makeSeriesPoints = (base: number) => [
  { quarter: '2024Q4', value: clampPercent(base - 3), type: 'ACTUAL' as const },
  { quarter: '2025Q1', value: clampPercent(base - 1), type: 'ACTUAL' as const },
  { quarter: '2025Q2', value: clampPercent(base + 1), type: 'ACTUAL' as const },
  { quarter: '2025Q3', value: clampPercent(base + 2), type: 'ACTUAL' as const },
  { quarter: '2025Q4', value: clampPercent(base + 3), type: 'PRED' as const },
];

const makeForecast = (company: CompanySummary): ForecastResponse => ({
  companyId: company.id,
  latestActualQuarter: '2025Q3',
  nextQuarter: '2025Q4',
  metricSeries: [
    {
      key: 'ROA',
      label: 'ROA',
      unit: '%',
      points: makeSeriesPoints(company.overallScore * 0.9),
    },
    {
      key: 'ROE',
      label: 'ROE',
      unit: '%',
      points: makeSeriesPoints(company.overallScore * 0.85 + 4),
    },
    {
      key: 'OpMargin',
      label: '매출액영업이익률',
      unit: '%',
      points: makeSeriesPoints(company.overallScore * 0.7 + 6),
    },
    {
      key: 'DbRatio',
      label: '부채비율',
      unit: '%',
      points: makeSeriesPoints(company.overallScore * 0.95 - 6),
    },
    {
      key: 'EqRatio',
      label: '자기자본비율',
      unit: '%',
      points: makeSeriesPoints(company.overallScore * 0.75 + 10),
    },
    {
      key: 'CapImpRatio',
      label: '자본잠식률',
      unit: '%',
      points: makeSeriesPoints(company.overallScore * 0.6 + 8),
    },
    {
      key: 'STDebtRatio',
      label: '단기차입금비율',
      unit: '%',
      points: makeSeriesPoints(company.overallScore * 0.65 + 7),
    },
    {
      key: 'CurRatio',
      label: '유동비율',
      unit: '%',
      points: makeSeriesPoints(company.overallScore * 0.8 + 5),
    },
    {
      key: 'QkRatio',
      label: '당좌비율',
      unit: '%',
      points: makeSeriesPoints(company.overallScore * 0.78 + 3),
    },
    {
      key: 'CurLibRatio',
      label: '유동부채비율',
      unit: '%',
      points: makeSeriesPoints(company.overallScore * 0.7 + 9),
    },
    {
      key: 'CFO_AsRatio',
      label: 'CFO_자산비율',
      unit: '%',
      points: makeSeriesPoints(company.overallScore * 0.6 + 12),
    },
    {
      key: 'CFO_Sale',
      label: 'CFO_매출액비율',
      unit: '%',
      points: makeSeriesPoints(company.overallScore * 0.62 + 11),
    },
  ],
  modelInfo: {
    name: 'Sentinel Indicator Prediction v1',
    updatedAt: '2024-11-01',
  },
});

const makeKeyMetrics = (company: CompanySummary): MetricItem[] => [
  {
    key: 'NETWORK_HEALTH',
    label: '네트워크 건강도',
    value: company.kpi?.networkHealth ?? company.overallScore,
    unit: '%',
    tooltip: {
      description: '연결된 협력사까지 포함한 네트워크 안정성 점수입니다.',
      interpretation: '높을수록 리스크 전파 가능성이 낮습니다.',
      actionHint: '하락 시 연관 협력사 신호등을 먼저 확인하세요.',
    },
  },
  {
    key: 'ANNUAL_REVENUE',
    label: '연 매출',
    value: company.kpi?.annualRevenue ?? 0,
    unit: '억',
    tooltip: {
      description: '기업의 사업 규모를 나타내는 지표입니다.',
      interpretation: '규모가 클수록 리스크 파급력이 큽니다.',
      actionHint: '위험 신호 발생 시 우선순위를 높게 배정하세요.',
    },
  },
  {
    key: 'EXTERNAL_REPUTATION',
    label: '외부 기업 평판',
    value: company.kpi?.reputationScore ?? null,
    unit: '점',
    tooltip: {
      description:
        '외부 뉴스·커뮤니티·공시 텍스트 등 비정형 데이터를 분석해 평판 점수를 산출합니다.',
      interpretation: '최근 30일 언급량과 감성을 종합한 지표입니다.',
      actionHint: '부정 키워드 급증 시 커뮤니케이션 전략을 점검하세요.',
    },
  },
];

const makeSignals = (): SignalLight[] => [
  {
    key: 'current_ratio',
    label: '유동비율',
    level: 'GREEN',
    tooltip: {
      description: '단기 채무 대응 자산 여력입니다.',
      interpretation: '하락 시 단기 유동성 압박이 커집니다.',
      actionHint: '현금성 자산과 단기부채를 함께 보세요.',
    },
  },
  {
    key: 'quick_ratio',
    label: '당좌비율',
    level: 'GREEN',
    tooltip: {
      description: '즉시 현금화 가능한 유동성 지표입니다.',
      interpretation: '급락은 현금 고갈 신호일 수 있습니다.',
      actionHint: '매출채권 회수 추이를 확인하세요.',
    },
  },
  {
    key: 'cfo_delta',
    label: 'CFO 증감률',
    level: 'YELLOW',
    tooltip: {
      description: '영업활동 현금흐름 변화율입니다.',
      interpretation: '이익과 현금이 괴리될 수 있습니다.',
      actionHint: '재고·매출채권 증가 여부를 점검하세요.',
    },
  },
  {
    key: 'debt_ratio',
    label: '부채비율',
    level: 'YELLOW',
    tooltip: {
      description: '자기자본 대비 부채 부담 수준입니다.',
      interpretation: '지속 상승 시 재무 안정성이 저하됩니다.',
      actionHint: '차입 목적과 만기 구조를 확인하세요.',
    },
  },
  {
    key: 'interest_coverage',
    label: '이자보상배율',
    level: 'RED',
    tooltip: {
      description: '영업이익의 이자 감당 능력 지표입니다.',
      interpretation: '1 미만이면 이자 부담 위험이 큽니다.',
      actionHint: '차입 구조 조정 가능성을 검토하세요.',
    },
  },
  {
    key: 'short_term_debt',
    label: '단기차입금 비중',
    level: 'RED',
    tooltip: {
      description: '단기 상환 부채 비율입니다.',
      interpretation: '높을수록 만기 리스크가 큽니다.',
      actionHint: '만기 일정과 재조달 계획을 확인하세요.',
    },
  },
];

const COMPANY_COMMENTS: Record<string, string> = {
  'c-001':
    '삼성물류는 전반적으로 안정적인 현금 흐름과 높은 네트워크 신뢰도를 유지하고 있습니다.\n다만 단기 차입금 비중 증가와 이자보상배율 하락이 관측되고 있어,\n향후 분기 내 유동성 관리 전략에 대한 점검이 필요합니다.',
  'c-002':
    '네오클라우드는 클라우드 전환 수요 증가로 전반적 성장세가 유지되고 있습니다.\n고객 확장 속도 대비 인력 수급이 늦어 리소스 관리에 유의하세요.',
  'c-003':
    '바이오넥스는 현금 유동성 지표가 급감하고 있어 단기적인 리스크 대응이 필요합니다.\n핵심 파트너와의 계약 안정성 점검을 권장합니다.',
  'c-004':
    '한빛기공은 매출과 외부 평판 점수가 안정적으로 유지되고 있습니다.\n신규 설비 투자 계획에 따른 재무 레버리지 변화를 모니터링하세요.',
  'c-005':
    '솔라젠에너지는 프로젝트 일정 지연으로 운영 리스크가 확대되고 있습니다.\n공급망 리스크를 세부적으로 점검할 필요가 있습니다.',
};

export const COMPANY_TIMELINES: Record<string, CompanyTimelineItem[]> = INITIAL_COMPANIES.reduce(
  (acc, company) => {
    acc[company.id] = BASE_TIMELINE;
    return acc;
  },
  {} as Record<string, CompanyTimelineItem[]>,
);

export const getMockCompanyOverview = (id: string): CompanyOverview => {
  const companySummary = INITIAL_COMPANIES.find((item) => item.id === id) ?? INITIAL_COMPANIES[0];
  return {
    company: {
      id: companySummary.id,
      name: companySummary.name,
      sector: companySummary.sector,
      overallScore: companySummary.overallScore,
      riskLevel: companySummary.riskLevel,
      tags: ['주요 공급망', '전략 파트너'],
      updatedAt: companySummary.lastUpdatedAt,
    },
    forecast: makeForecast(companySummary),
    keyMetrics: makeKeyMetrics(companySummary),
    signals: makeSignals(),
    aiComment: COMPANY_COMMENTS[companySummary.id],
    externalReputationRisk: {
      score: companySummary.overallScore,
      label: companySummary.riskLevel,
      topKeywords: ['공급망', '현금흐름', '시장점유'],
    },
    modelStatus: 'EXISTING',
  };
};

export const getCompanyTimeline = (id: string): CompanyTimelineItem[] =>
  COMPANY_TIMELINES[id] ?? BASE_TIMELINE;
