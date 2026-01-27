import { Partner, PartnerDetail, PartnerSummary } from '../types/partner';

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'p-001',
    name: '삼성물류',
    industry: '물류/SCM',
    healthScore: 92,
    revenue: 4200,
    status: '정상',
  },
  {
    id: 'p-002',
    name: '네오클라우드',
    industry: 'IT/플랫폼',
    healthScore: 88,
    revenue: 1800,
    status: '정상',
  },
  {
    id: 'p-003',
    name: '바이오넥스',
    industry: '바이오/헬스',
    healthScore: 45,
    revenue: 900,
    status: '위험',
  },
  {
    id: 'p-004',
    name: '한빛기공',
    industry: '제조업',
    healthScore: 78,
    revenue: 12500,
    status: '정상',
  },
  {
    id: 'p-005',
    name: '솔라젠에너지',
    industry: '신재생에너지',
    healthScore: 62,
    revenue: 2100,
    status: '주의',
  },
];

const BASE_TIMELINE = [
  { date: '2024-11-12', title: '정기 컴플라이언스 점검 완료', tone: 'positive' as const },
  { date: '2024-09-05', title: '분기 전략 정렬 미팅 진행', tone: 'neutral' as const },
  { date: '2024-06-22', title: '공급망 지연 경보 발생', tone: 'risk' as const },
  { date: '2024-01-18', title: '파트너십 갱신 계약 체결', tone: 'positive' as const },
];

const createSummary = (partner: Partner): PartnerSummary => ({
  id: partner.id,
  networkHealth: partner.healthScore,
  annualRevenue: partner.revenue,
  timeline: BASE_TIMELINE,
});

const buildDetail = (partner: Partner, commentary: string): PartnerDetail => ({
  partner,
  forecast: [
    { month: '1월', score: Math.max(20, partner.healthScore - 8) },
    { month: '2월', score: Math.max(20, partner.healthScore - 4) },
    { month: '3월', score: Math.max(20, partner.healthScore - 2) },
    { month: '4월', score: Math.max(20, partner.healthScore - 3) },
    { month: '5월', score: partner.healthScore },
    { month: '6월', score: Math.min(100, partner.healthScore + 1) },
  ],
  metrics: [
    {
      label: '네트워크 건강도',
      value: `${partner.healthScore}%`,
      tooltip: {
        description: '연결된 파트너까지 포함한 네트워크 안정성 점수입니다.',
        interpretation: '높을수록 리스크 전파 가능성이 낮습니다.',
        actionHint: '하락 시 연관 파트너 신호등을 먼저 확인하세요.',
      },
    },
    {
      label: '연 매출',
      value: `${partner.revenue.toLocaleString('ko-KR')}억 원`,
      tooltip: {
        description: '기업의 사업 규모를 나타내는 지표입니다.',
        interpretation: '규모가 클수록 리스크 파급력이 큽니다.',
        actionHint: '위험 신호 발생 시 우선순위를 높게 배정하세요.',
      },
    },
    {
      label: '계약 진행률',
      value: '84%',
      tooltip: {
        description: '체결 계약 대비 정상 이행 비율입니다.',
        interpretation: '하락은 운영 리스크 신호일 수 있습니다.',
        actionHint: '지연 원인을 항목별로 점검하세요.',
      },
    },
  ],
  trafficSignals: [
    {
      label: '유동비율',
      status: 'green',
      tooltip: {
        description: '단기 채무 대응 자산 여력입니다.',
        interpretation: '하락 시 단기 유동성 압박이 커집니다.',
        actionHint: '현금성 자산과 단기부채를 함께 보세요.',
      },
    },
    {
      label: '당좌비율',
      status: 'green',
      tooltip: {
        description: '즉시 현금화 가능한 유동성 지표입니다.',
        interpretation: '급락은 현금 고갈 신호일 수 있습니다.',
        actionHint: '매출채권 회수 추이를 확인하세요.',
      },
    },
    {
      label: 'CFO 증감률',
      status: 'yellow',
      tooltip: {
        description: '영업활동 현금흐름 변화율입니다.',
        interpretation: '이익과 현금이 괴리될 수 있습니다.',
        actionHint: '재고·매출채권 증가 여부를 점검하세요.',
      },
    },
    {
      label: '부채비율',
      status: 'yellow',
      tooltip: {
        description: '자기자본 대비 부채 부담 수준입니다.',
        interpretation: '지속 상승 시 재무 안정성이 저하됩니다.',
        actionHint: '차입 목적과 만기 구조를 확인하세요.',
      },
    },
    {
      label: '이자보상배율',
      status: 'red',
      tooltip: {
        description: '영업이익의 이자 감당 능력 지표입니다.',
        interpretation: '1 미만이면 이자 부담 위험이 큽니다.',
        actionHint: '차입 구조 조정 가능성을 검토하세요.',
      },
    },
    {
      label: '단기차입금 비중',
      status: 'red',
      tooltip: {
        description: '단기 상환 부채 비율입니다.',
        interpretation: '높을수록 만기 리스크가 큽니다.',
        actionHint: '만기 일정과 재조달 계획을 확인하세요.',
      },
    },
  ],
  aiCommentary: commentary,
  summary: createSummary(partner),
});

export const getMockPartnerDetail = (id: string): PartnerDetail => {
  const partner = INITIAL_PARTNERS.find((item) => item.id === id) ?? INITIAL_PARTNERS[0];
  return buildDetail(
    partner,
    '삼성물류는 전반적으로 안정적인 현금 흐름과 높은 네트워크 신뢰도를 유지하고 있습니다.\n다만 단기 차입금 비중 증가와 이자보상배율 하락이 관측되고 있어,\n향후 분기 내 유동성 관리 전략에 대한 점검이 필요합니다.',
  );
};
