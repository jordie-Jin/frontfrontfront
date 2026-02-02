// 협력사 엔티티 타입 정의입니다.
export type RiskLevel = 'SAFE' | 'WARN' | 'RISK';

export type ModelStatus = 'EXISTING' | 'PROCESSING' | 'COMPLETED';

export interface Sector {
  key: string;
  label: string;
}

export interface TooltipContent {
  description: string;
  interpretation?: string | null;
  actionHint?: string | null;
}

export interface DeltaValue {
  value: number;
  unit?: string | null;
  direction: 'UP' | 'DOWN' | 'FLAT';
  label?: string | null;
}

export interface KpiCardDto {
  key: string;
  title: string;
  value: string | number | null;
  unit?: string | null;
  tone?: 'DEFAULT' | 'GOOD' | 'WARN' | 'RISK';
  delta?: DeltaValue | null;
  badge?: {
    label: string;
    subLabel?: string | null;
  } | null;
  tooltip?: TooltipContent | null;
}

export interface CompanyKpiMini {
  networkHealth?: number;
  annualRevenue?: number;
  reputationScore?: number;
}

export interface CompanySummary {
  id: string;
  name: string;
  sector: Sector;
  overallScore: number;
  riskLevel: RiskLevel;
  lastUpdatedAt?: string;
  kpi?: CompanyKpiMini;
}

export interface Company {
  id: string;
  name: string;
  sector: Sector;
  overallScore: number;
  riskLevel: RiskLevel;
  tags?: string[];
  updatedAt?: string;
}

export interface CompanyKpiSummary {
  companyId: string;
  range?: string;
  kpis: KpiCardDto[];
}

export interface CompanySignalItem {
  key: string;
  label: string;
  status: 'GOOD' | 'WARN' | 'RISK';
  value?: number | null;
  unit?: string | null;
  tooltip?: TooltipContent;
}

export interface MetricForecastPoint {
  quarter: string;
  value: number;
  type: 'ACTUAL' | 'PRED';
}

export interface MetricSeries {
  key: string;
  label: string;
  unit?: string | null;
  points: MetricForecastPoint[];
}

export interface ForecastResponse {
  companyId: string;
  latestActualQuarter: string;
  nextQuarter: string;
  metricSeries: MetricSeries[];
  modelInfo?: {
    name?: string;
    updatedAt?: string;
  };
}

export interface MetricItem {
  key: string;
  label: string;
  value: number | null;
  unit?: string | null;
  delta?: DeltaValue;
  tooltip?: TooltipContent;
}

export interface SignalLight {
  key: string;
  label: string;
  level: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  value?: number | null;
  unit?: string | null;
  tooltip?: TooltipContent;
}

export interface CompanyOverview {
  company: Company;
  forecast?: ForecastResponse;
  keyMetrics?: MetricItem[];
  signals?: SignalLight[];
  aiComment?: string;
  externalReputationRisk?: {
    score?: number;
    label?: RiskLevel;
    topKeywords?: string[];
  };
  modelStatus: ModelStatus;
}

export interface CompanySearchItem {
  companyId?: string;
  name: string;
  code: string;
  sector?: Sector;
}

export interface CompanySearchResponse {
  items: CompanySearchItem[];
  count: number;
}

export interface CompanyConfirmRequest {
  companyId?: string;
  code?: string;
  name?: string;
}

export interface CompanyConfirmResult {
  companyId: string;
  name?: string;
  sector?: Sector;
  modelStatus: ModelStatus;
  isCached?: boolean;
  lastAnalyzedAt?: string | null;
}

export interface UpdateRequestCreate {
  message?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CompanyTimelineItem {
  date: string;
  title: string;
  tone: 'positive' | 'neutral' | 'risk';
}
