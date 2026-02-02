// 대시보드 요약 데이터 타입 정의입니다.
import { KpiCardDto, Sector } from './company';

export type DashboardRange = '7d' | '30d' | '90d';

export interface DashboardSummary {
  range: string;
  kpis: KpiCardDto[];
  latestActualQuarter: string;
  forecastQuarter: string;
  windowQuarters: string[];
  riskStatusDistribution: {
    NORMAL: number;
    CAUTION: number;
    RISK: number;
  };
  riskStatusDistributionTrend: RiskStatusBucket[];
}

export type DataType = 'ACTUAL' | 'FORECAST';

export interface RiskStatusBucket {
  quarter: string;
  dataType: DataType;
  NORMAL: number;
  CAUTION: number;
  RISK: number;
}

export interface TimeSeriesPoint {
  x: string;
  y: number;
}

export interface TimeSeriesSeries {
  name: string;
  points: TimeSeriesPoint[];
}

export interface TimeSeriesResponse {
  range: string;
  metric: string;
  series: TimeSeriesSeries[];
}

export interface RiskSegment {
  key: 'SAFE' | 'WARN' | 'RISK';
  label: string;
  count: number;
  ratio: number;
}

export interface RiskDistribution {
  range?: string;
  segments: RiskSegment[];
  summary?: {
    avgRiskLevel?: 'LOW' | 'MID' | 'HIGH';
    topSector?: Sector;
  };
}
