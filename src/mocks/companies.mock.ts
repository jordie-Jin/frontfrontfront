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
      description: '유동자산이 유동부채를 얼마나 커버하는지 보는 비율입니다.',
      interpretation: '낮아질수록 단기 유동성 압박이 커집니다.',
      actionHint: '유동자산 구성과 단기 부채 만기를 함께 점검하세요.',
    },
  },
  {
    key: 'cfo_sales_ratio',
    label: 'CFO / 매출액 비율',
    level: 'GREEN',
    tooltip: {
      description: '영업활동 현금흐름이 매출에서 차지하는 비중입니다.',
      interpretation: '낮을수록 매출 대비 현금 창출력이 약합니다.',
      actionHint: '매출채권 회수와 재고 회전 속도를 확인하세요.',
    },
  },
  {
    key: 'equity_ratio',
    label: '자기자본비율',
    level: 'YELLOW',
    tooltip: {
      description: '총자산 대비 자기자본이 차지하는 비중입니다.',
      interpretation: '낮을수록 재무 레버리지 의존도가 큽니다.',
      actionHint: '부채 구조와 자본 확충 계획을 검토하세요.',
    },
  },
  {
    key: 'short_term_debt',
    label: '단기차입금 비중',
    level: 'YELLOW',
    tooltip: {
      description: '총차입금 중 단기차입금이 차지하는 비율입니다.',
      interpretation: '높을수록 만기 리스크가 커집니다.',
      actionHint: '차입 만기 분산과 재조달 계획을 확인하세요.',
    },
  },
  {
    key: 'current_liability_ratio',
    label: '유동부채비율',
    level: 'RED',
    tooltip: {
      description: '총부채 중 유동부채가 차지하는 비중입니다.',
      interpretation: '높을수록 단기 상환 부담이 커집니다.',
      actionHint: '단기 부채 증가 원인을 점검하세요.',
    },
  },
  {
    key: 'operating_margin',
    label: '매출액영업이익률',
    level: 'RED',
    tooltip: {
      description: '매출 대비 영업이익이 차지하는 비율입니다.',
      interpretation: '하락은 수익성 둔화 신호입니다.',
      actionHint: '원가율과 고정비 변화를 함께 확인하세요.',
    },
  },
];

const COMPANY_COMMENTS: Record<string, string> = {
  'c-001':
    '삼성물류는 ROA·ROE가 안정적인 수준을 유지하고 있으며 유동비율/당좌비율도 녹색 구간입니다.\n다만 부채비율과 단기차입금비율이 완만히 상승하고 이자보상배율이 둔화되고 있어,\n단기 만기 구조와 금리 민감도를 함께 점검하는 것이 좋겠습니다.\n\n추가로 최근 3개 분기 동안 운전자본 회전일수가 늘어나고 있어,\n재고 회전과 매출채권 회수 주기를 분리해 모니터링할 필요가 있습니다.\n특히 단기차입금 비중이 높은 상태라 시장 금리 상승 시 이자비용 증가폭이 커질 수 있으므로,\n차입 구조를 중장기로 분산하는 방안을 함께 검토해 주세요.\n\n공급망 측면에서는 핵심 협력사 의존도가 높아 특정 부품 리드타임 변화에 취약합니다.\n대체 공급선 확보 계획과 SLA 재협상 일정도 병행해 점검하는 것이 바람직합니다.',
  'c-002':
    '네오클라우드는 매출액영업이익률과 자기자본비율이 개선되며 성장 모멘텀이 유지되고 있습니다.\n반면 CFO_매출액비율 변동성이 커지고 유동부채비율이 높아져 운전자본 관리에 유의하세요.',
  'c-003':
    '바이오넥스는 ROA·ROE 하락과 함께 유동비율/당좌비율이 빠르게 둔화되고 있습니다.\n부채비율과 자본잠식률이 상승해 단기 유동성 압박이 커지고 있으니,\nCFO_자산비율 회복과 비용 구조 개선을 우선 점검하세요.',
  'c-004':
    '한빛기공은 매출액영업이익률과 자기자본비율이 안정적으로 유지되고 있습니다.\n설비 투자 확대 구간에서 부채비율과 단기차입금비율이 상승할 수 있으니,\n현금흐름 추이와 유동비율 변화를 함께 모니터링하세요.',
  'c-005':
    '솔라젠에너지는 매출액영업이익률 하락과 함께 CFO_매출액비율이 약화되고 있습니다.\n유동부채비율과 단기차입금비율이 상승해 프로젝트 일정 지연 리스크가 커진 상태이니,\n공급망 리드타임과 단기 자금 조달 계획을 점검하세요.',
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
