// 리스크 분포 시각화를 위한 목 데이터 생성기입니다.
import { RiskDistribution } from '../types/dashboard';

const distributions: Record<string, RiskDistribution> = {
  '7d': {
    range: '7d',
    segments: [
      { key: 'SAFE', label: '낮음', count: 62, ratio: 0.62 },
      { key: 'WARN', label: '보통', count: 28, ratio: 0.28 },
      { key: 'RISK', label: '높음', count: 10, ratio: 0.1 },
    ],
    summary: {
      avgRiskLevel: 'LOW',
      topSector: { key: 'healthcare', label: '헬스케어' },
    },
  },
  '30d': {
    range: '30d',
    segments: [
      { key: 'SAFE', label: '낮음', count: 58, ratio: 0.58 },
      { key: 'WARN', label: '주의', count: 30, ratio: 0.3 },
      { key: 'RISK', label: '높음', count: 12, ratio: 0.12 },
    ],
    summary: {
      avgRiskLevel: 'LOW',
      topSector: { key: 'tech', label: '기술' },
    },
  },
  '90d': {
    range: '90d',
    segments: [],
    summary: {
      avgRiskLevel: 'MID',
      topSector: { key: 'unknown', label: '데이터 없음' },
    },
  },
};

export const getMockRiskDistribution = (range: string): RiskDistribution =>
  distributions[range] ?? distributions['30d'];
