import React from 'react';
import { KpiCardDto } from '../../types/company';
import KpiCard from '../kpi/KpiCard';

interface KpiCardsProps {
  kpis: KpiCardDto[];
}

const formatDecimal = (value: number): string => value.toFixed(1);

const toTone = (tone?: KpiCardDto['tone']): 'positive' | 'negative' | 'neutral' => {
  if (tone === 'RISK') return 'negative';
  if (tone === 'WARN') return 'neutral';
  if (tone === 'GOOD') return 'positive';
  return 'neutral';
};

const toDeltaDirection = (direction?: 'UP' | 'DOWN' | 'FLAT'): 'up' | 'down' | 'flat' => {
  if (direction === 'UP') return 'up';
  if (direction === 'DOWN') return 'down';
  return 'flat';
};

const findKpi = (kpis: KpiCardDto[], keys: string[]): KpiCardDto | undefined =>
  kpis.find((item) => keys.includes(item.key));

const formatValue = (value: KpiCardDto['value']): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  return Number.isInteger(value) ? String(value) : formatDecimal(value);
};

const formatDeltaValue = (delta: NonNullable<KpiCardDto['delta']>): string => {
  const sign = delta.direction === 'UP' ? '+' : delta.direction === 'DOWN' ? '-' : '';
  const absValue = Math.abs(delta.value);
  const valueText = Number.isInteger(absValue) ? String(absValue) : formatDecimal(absValue);
  return `${sign}${valueText}${delta.unit ?? ''}`;
};

const KPI_ORDER = [
  'ACTIVE_COMPANIES',
  'RISK_COMPANIES',
  'CAUTION_RATE',
  'NETWORK_STATUS',
  'RISK_INDEX',
  'RISK_DWELL_TIME',
] as const;

const KPI_FALLBACKS: Record<
  string,
  { icon: string; title: string; unit?: string; tooltip: NonNullable<KpiCardDto['tooltip']> }
> = {
  ACTIVE_COMPANIES: {
    icon: 'fa-users',
    title: '활성 관심기업',
    tooltip: { description: '로그인 사용자의 현재 워치리스트 기업 수입니다.' },
  },
  RISK_COMPANIES: {
    icon: 'fa-triangle-exclamation',
    title: '고위험 기업 수',
    tooltip: { description: '최신 ACTUAL 분기에서 위험(RISK)으로 분류된 기업 수입니다.' },
  },
  CAUTION_RATE: {
    icon: 'fa-bell',
    title: '주의 비율',
    unit: '%',
    tooltip: { description: '최신 ACTUAL 분기에서 주의(CAUTION) 상태의 비율입니다.' },
  },
  NETWORK_STATUS: {
    icon: 'fa-heartbeat',
    title: '네트워크 상태',
    tooltip: { description: '활성 관심기업의 최신 ACTUAL 분기 internal_health_score 평균입니다.' },
  },
  RISK_INDEX: {
    icon: 'fa-shield-halved',
    title: '위험 지수',
    tooltip: {
      description: '포트폴리오 전체 위험 수준 요약 지표입니다.',
      interpretation: '주의·위험 구간 증가 시 원인 분석이 필요합니다.',
      actionHint: '위험 상위 협력사부터 상세 지표를 확인하세요.',
    },
  },
  RISK_DWELL_TIME: {
    icon: 'fa-hourglass-half',
    title: '리스크 체류 기간',
    unit: '분기',
    tooltip: {
      description: '주의/위험 상태에 머무른 평균 기간(분기 수)입니다.',
      interpretation: '낮을수록 리스크 구간에서 빠르게 회복합니다.',
      actionHint: '체류 기간이 긴 기업을 우선 점검하세요.',
    },
  },
};

const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {

  const createDelta = (
    delta?: KpiCardDto['delta'],
    fallbackLabel = '전기 대비',
  ): { value: string; direction: 'up' | 'down' | 'flat'; label?: string } | undefined => {
    if (!delta) return undefined;
    return {
      value: formatDeltaValue(delta),
      direction: toDeltaDirection(delta.direction),
      label: delta.label ?? fallbackLabel,
    };
  };

  // summary 응답에서 내려온 KPI 순서를 기준으로 최대 6개 카드를 노출합니다.
  const cards = KPI_ORDER.map((key) => {
    const aliases =
      key === 'NETWORK_STATUS'
        ? ['NETWORK_STATUS', 'NETWORK_HEALTH']
        : key === 'RISK_DWELL_TIME'
        ? ['RISK_DWELL_TIME', 'RISK_DWELL']
        : [key];

    const kpi = findKpi(kpis, aliases);
    const fallback = KPI_FALLBACKS[key];
    return {
      key,
      label: kpi?.title ?? fallback.title,
      valueText: formatValue(kpi?.value),
      unit: kpi?.unit ?? fallback.unit,
      delta: createDelta(kpi?.delta, key === 'RISK_DWELL_TIME' ? '지난 분기 대비' : '전기 대비'),
      icon: fallback.icon,
      tone: toTone(kpi?.tone),
      tooltip: kpi?.tooltip ?? fallback.tooltip,
    };
  });

  return (
    <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
      {cards.map((stat) => {
        return (
          <KpiCard
            key={stat.key}
            title={stat.label}
            value={stat.valueText}
            unit={stat.unit}
            delta={stat.delta}
            icon={<i className={`fas ${stat.icon}`} />}
            tone={stat.tone === 'negative' ? 'risk' : stat.tone === 'neutral' ? 'warn' : 'good'}
            tooltip={stat.tooltip}
          />
        );
      })}
    </div>
  );
};

export default KpiCards;
