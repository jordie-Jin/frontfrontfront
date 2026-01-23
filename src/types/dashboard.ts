export type DashboardRange = '7d' | '30d' | '90d';

export interface KpiValue {
  value: number;
  deltaPct?: number;
}

export interface KpiDaysValue {
  value: number;
  deltaDays?: number;
}

export type RiskIndexLabel = '최소' | '낮음' | '주의' | '높음';
export type RiskIndexStatus = 'safe' | 'watch' | 'risk';

export interface RiskIndexKpi {
  label: RiskIndexLabel;
  status: RiskIndexStatus;
  deltaText?: string;
}

export interface NetworkHealthKpi {
  valuePct: number;
  deltaPct?: number;
}

export interface DashboardKpis {
  activePartners: KpiValue;
  decisionVelocityDays: KpiDaysValue;
  riskIndex: RiskIndexKpi;
  networkHealth: NetworkHealthKpi;
}

export interface TrendPoint {
  period: string;
  score: number;
}

export interface RiskSegment {
  label: string;
  valuePct: number;
}

export interface RiskDistribution {
  segments: RiskSegment[];
  avgRiskLabel: string;
  topSector: string;
}

export interface KpiCard {
  label: string;
  valueText: string;
  deltaText?: string;
  icon: string;
  tone?: 'positive' | 'negative' | 'neutral';
}

export interface DashboardSummary {
  range: DashboardRange;
  kpis: DashboardKpis;
  trend: {
    points: TrendPoint[];
    metricLabel?: string;
  };
  riskDistribution: RiskDistribution;
}
