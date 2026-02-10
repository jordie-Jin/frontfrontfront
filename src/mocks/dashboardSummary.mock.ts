// 대시보드 요약 지표 목 데이터입니다.
import { DashboardSummary } from '../types/dashboard';

const summary: DashboardSummary = {
  latestActualQuarter: '2024Q4',
  forecastQuarter: '2025Q1',
  windowQuarters: ['2024Q1', '2024Q2', '2024Q3', '2024Q4', '2025Q1'],
  riskStatusDistribution: {
    NORMAL: 88,
    CAUTION: 24,
    RISK: 12,
  },
  riskStatusDistributionTrend: [
    { quarter: '2024Q1', dataType: 'ACTUAL', NORMAL: 75, CAUTION: 25, RISK: 10 },
    { quarter: '2024Q2', dataType: 'ACTUAL', NORMAL: 80, CAUTION: 26, RISK: 12 },
    { quarter: '2024Q3', dataType: 'ACTUAL', NORMAL: 84, CAUTION: 24, RISK: 10 },
    { quarter: '2024Q4', dataType: 'ACTUAL', NORMAL: 88, CAUTION: 24, RISK: 12 },
    { quarter: '2025Q1', dataType: 'FORECAST', NORMAL: 86, CAUTION: 26, RISK: 12 },
  ],
  kpis: [
    { key: 'ACTIVE_COMPANIES', title: '활성 협력사', value: 124, tone: 'GOOD', unit: '개' },
    { key: 'RISK_DWELL_TIME', title: '리스크 체류 기간', value: 2.2, unit: '분기', tone: 'WARN' },
    { key: 'RISK_INDEX', title: '위험 지수', value: '최소', tone: 'GOOD' },
    { key: 'NETWORK_STATUS', title: '네트워크 상태', value: 98.2, unit: '%', tone: 'GOOD' },
  ],
};

export function getMockDashboardSummary(): DashboardSummary {
  return summary;
}
