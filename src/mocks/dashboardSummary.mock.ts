import { DashboardRange, DashboardSummary } from '../types/dashboard';

const summaries: Record<DashboardRange, DashboardSummary> = {
  '7d': {
    range: '7d',
    kpis: {
      activePartners: { value: 38, deltaPct: 3.2 },
      decisionVelocityDays: { value: 3.6, deltaDays: -0.4 },
      riskIndex: { label: '낮음', status: 'safe', deltaText: '안정 유지' },
      networkHealth: { valuePct: 97.4, deltaPct: 0.6 },
    },
    trend: {
      metricLabel: '종합 점수',
      points: [
        { period: '월', score: 72 },
        { period: '화', score: 74 },
        { period: '수', score: 70 },
        { period: '목', score: 76 },
        { period: '금', score: 80 },
        { period: '토', score: 78 },
        { period: '일', score: 82 },
      ],
    },
    riskDistribution: {
      segments: [
        { label: '낮음', valuePct: 62 },
        { label: '보통', valuePct: 28 },
        { label: '높음', valuePct: 10 },
      ],
      avgRiskLabel: '낮음',
      topSector: '헬스케어',
    },
  },
  '30d': {
    range: '30d',
    kpis: {
      activePartners: { value: 124, deltaPct: 12.4 },
      decisionVelocityDays: { value: 4.2, deltaDays: -0.5 },
      riskIndex: { label: '최소', status: 'safe', deltaText: '안정적' },
      networkHealth: { valuePct: 98.2, deltaPct: 0.4 },
    },
    trend: {
      metricLabel: '종합 점수',
      points: [
        { period: '1주', score: 68 },
        { period: '2주', score: 72 },
        { period: '3주', score: 75 },
        { period: '4주', score: 80 },
      ],
    },
    riskDistribution: {
      segments: [
        { label: '낮음', valuePct: 58 },
        { label: '주의', valuePct: 30 },
        { label: '높음', valuePct: 12 },
      ],
      avgRiskLabel: '낮음',
      topSector: '기술',
    },
  },
  '90d': {
    range: '90d',
    kpis: {
      activePartners: { value: 301, deltaPct: 6.8 },
      decisionVelocityDays: { value: 5.1, deltaDays: 0.3 },
      riskIndex: { label: '주의', status: 'watch', deltaText: '변동성 증가' },
      networkHealth: { valuePct: 94.9, deltaPct: -1.2 },
    },
    trend: {
      metricLabel: '종합 점수',
      points: [],
    },
    riskDistribution: {
      segments: [],
      avgRiskLabel: '데이터 없음',
      topSector: '데이터 없음',
    },
  },
};

export function getMockDashboardSummary(range: DashboardRange): DashboardSummary {
  return summaries[range];
}
