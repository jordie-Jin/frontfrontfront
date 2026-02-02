// 대시보드 요약 지표 목 데이터입니다.
import { DashboardRange, DashboardSummary } from '../types/dashboard';

const summaries: Record<DashboardRange, DashboardSummary> = {
  '7d': {
    range: '7d',
    latestActualQuarter: '2024Q4',
    forecastQuarter: '2025Q1',
    windowQuarters: ['2024Q1', '2024Q2', '2024Q3', '2024Q4', '2025Q1'],
    riskStatusDistribution: {
      NORMAL: 26,
      CAUTION: 8,
      RISK: 4,
    },
    riskStatusDistributionTrend: [
      { quarter: '2024Q1', dataType: 'ACTUAL', NORMAL: 20, CAUTION: 8, RISK: 2 },
      { quarter: '2024Q2', dataType: 'ACTUAL', NORMAL: 22, CAUTION: 9, RISK: 3 },
      { quarter: '2024Q3', dataType: 'ACTUAL', NORMAL: 24, CAUTION: 7, RISK: 3 },
      { quarter: '2024Q4', dataType: 'ACTUAL', NORMAL: 26, CAUTION: 8, RISK: 4 },
      { quarter: '2025Q1', dataType: 'FORECAST', NORMAL: 25, CAUTION: 9, RISK: 4 },
    ],
    kpis: [
      { key: 'ACTIVE_COMPANIES', title: '활성 협력사', value: 38, tone: 'GOOD', unit: '개' },
      { key: 'RISK_DWELL', title: '리스크 체류 기간', value: 1.6, unit: '분기', tone: 'WARN' },
      { key: 'RISK_INDEX', title: '위험 지수', value: '낮음', tone: 'GOOD' },
      { key: 'NETWORK_HEALTH', title: '네트워크 상태', value: 97.4, unit: '%', tone: 'GOOD' },
    ],
  },
  '30d': {
    range: '30d',
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
      { key: 'RISK_DWELL', title: '리스크 체류 기간', value: 2.2, unit: '분기', tone: 'WARN' },
      { key: 'RISK_INDEX', title: '위험 지수', value: '최소', tone: 'GOOD' },
      { key: 'NETWORK_HEALTH', title: '네트워크 상태', value: 98.2, unit: '%', tone: 'GOOD' },
    ],
  },
  '90d': {
    range: '90d',
    latestActualQuarter: '2024Q4',
    forecastQuarter: '2025Q1',
    windowQuarters: ['2024Q1', '2024Q2', '2024Q3', '2024Q4', '2025Q1'],
    riskStatusDistribution: {
      NORMAL: 210,
      CAUTION: 61,
      RISK: 30,
    },
    riskStatusDistributionTrend: [
      { quarter: '2024Q1', dataType: 'ACTUAL', NORMAL: 190, CAUTION: 60, RISK: 28 },
      { quarter: '2024Q2', dataType: 'ACTUAL', NORMAL: 200, CAUTION: 58, RISK: 27 },
      { quarter: '2024Q3', dataType: 'ACTUAL', NORMAL: 205, CAUTION: 59, RISK: 29 },
      { quarter: '2024Q4', dataType: 'ACTUAL', NORMAL: 210, CAUTION: 61, RISK: 30 },
      { quarter: '2025Q1', dataType: 'FORECAST', NORMAL: 208, CAUTION: 62, RISK: 31 },
    ],
    kpis: [
      { key: 'ACTIVE_COMPANIES', title: '활성 협력사', value: 301, tone: 'GOOD', unit: '개' },
      { key: 'RISK_DWELL', title: '리스크 체류 기간', value: 3.1, unit: '분기', tone: 'WARN' },
      { key: 'RISK_INDEX', title: '위험 지수', value: '주의', tone: 'WARN' },
      { key: 'NETWORK_HEALTH', title: '네트워크 상태', value: 94.9, unit: '%', tone: 'WARN' },
    ],
  },
};

export function getMockDashboardSummary(range: DashboardRange): DashboardSummary {
  return summaries[range];
}
