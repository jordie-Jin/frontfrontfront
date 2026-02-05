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
  const METRIC_LABEL_MAP: Record<string, string> = {
    ROA: 'ROA',
    ROE: 'ROE',
    OpMargin: '매출액영업이익률',
    DbRatio: '부채비율',
    EqRatio: '자기자본비율',
    CapImpRatio: '자본잠식률',
    STDebtRatio: '단기차입금비율',
    CurRatio: '유동비율',
    QkRatio: '당좌비율',
    CurLibRatio: '유동부채비율',
    CFO_AsRatio: 'CFO 자산비율',
    CFO_Sale: 'CFO 매출액비율',
  };
  const LABEL_KEY_MAP = Object.fromEntries(
    Object.entries(METRIC_LABEL_MAP).map(([key, label]) => [label, key]),
  ) as Record<string, string>;
  const ALLOWED_METRIC_KEYS = Object.keys(METRIC_LABEL_MAP);
  const METRIC_ORDER = new Map(
    ALLOWED_METRIC_KEYS.map((key, index) => [key, index]),
  );

  const normalizedSeries = forecast.metricSeries
    .map((series) => {
      const normalizedKey =
        METRIC_LABEL_MAP[series.key] ? series.key : LABEL_KEY_MAP[series.label] ?? series.key;
      return {
        ...series,
        key: normalizedKey,
        label: METRIC_LABEL_MAP[normalizedKey] ?? series.label,
        unit: '%',
      };
    })
    .filter((series) => ALLOWED_METRIC_KEYS.includes(series.key))
    .sort((a, b) => (METRIC_ORDER.get(a.key) ?? 0) - (METRIC_ORDER.get(b.key) ?? 0));

  return {
    ...forecast,
    metricSeries: normalizedSeries,
  };
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
