// 협력사 데이터 파생 셀렉터 유틸리티입니다.
import type {
  CompanyOverview,
  CompanySignalItem,
  CompanySummary,
  ForecastResponse,
  MetricItem,
  RiskLevel,
  SignalLight,
} from '../types/company';
import type { KpiTooltipContent } from '../types/kpi';

export type TrafficLight = 'green' | 'yellow' | 'red';

export const getCompanyStatusLabel = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'SAFE':
      return '정상';
    case 'WARN':
      return '주의';
    case 'RISK':
      return '위험';
    default:
      return '정상';
  }
};

export const getCompanyHealthScore = (company: CompanySummary): number =>
  company.kpi?.networkHealth ?? company.overallScore ?? 0;

export const getCompanyRevenue = (company: CompanySummary): number =>
  company.kpi?.annualRevenue ?? 0;

export const getMetricValue = (metrics: MetricItem[] | undefined, key: string): number | null => {
  if (!metrics) return null;
  const metric = metrics.find((item) => item.key === key);
  return metric?.value ?? null;
};

export const formatCompanyRevenue = (value: number): string => {
  if (value >= 10000) {
    return `1조 ${(value - 10000).toLocaleString('ko-KR')}억`;
  }
  return `${value.toLocaleString('ko-KR')}억`;
};

export const toMetricForecast = (forecast?: ForecastResponse) => {
  if (!forecast) {
    return {
      latestActualQuarter: '',
      nextQuarter: '',
      metricSeries: [],
      modelInfo: undefined,
      companyId: '',
    };
  }
  return forecast;
};

export const toMetricCards = (metrics?: MetricItem[]) => {
  if (!metrics) return [];
  return metrics.map((metric) => {
    if (metric.value === null || metric.value === undefined) {
      return {
        label: metric.label,
        value: '—',
        tooltip: {
          description: '데이터 수집중입니다.',
        } satisfies KpiTooltipContent,
      };
    }

    return {
      label: metric.label,
      value: `${metric.value}${metric.unit ?? ''}`,
      tooltip: metric.tooltip as KpiTooltipContent | undefined,
    };
  });
};

const toTrafficStatus = (status: 'GOOD' | 'WARN' | 'RISK'): TrafficLight => {
  if (status === 'GOOD') return 'green';
  if (status === 'WARN') return 'yellow';
  return 'red';
};

const toSignalStatus = (level: SignalLight['level']): TrafficLight => {
  switch (level) {
    case 'GREEN':
      return 'green';
    case 'YELLOW':
      return 'yellow';
    case 'RED':
      return 'red';
    default:
      return 'yellow';
  }
};

export const toSignalCards = (signals?: SignalLight[]) => {
  if (!signals) return [];
  return signals.map((signal) => ({
    label: signal.label,
    status: toSignalStatus(signal.level),
    tooltip: signal.tooltip as KpiTooltipContent | undefined,
  }));
};

export const toCompanySignalCards = (signals?: CompanySignalItem[]) => {
  if (!signals) return [];
  return signals.map((signal) => ({
    label: signal.label,
    status: toTrafficStatus(signal.status),
    tooltip: signal.tooltip as KpiTooltipContent | undefined,
  }));
};

export const getCompanyOverviewStatusLabel = (overview?: CompanyOverview): string => {
  if (!overview) return '—';
  return getCompanyStatusLabel(overview.company.riskLevel);
};
