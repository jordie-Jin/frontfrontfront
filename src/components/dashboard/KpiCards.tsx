import React, { useMemo } from 'react';
import { KpiCardDto } from '../../types/company';
import { CompanyQuarterRisk } from '../../types/risk';
import { computeDwellTimeDelta, getRecentQuarterWindows } from '../../utils/kpi';
import KpiCard from '../kpi/KpiCard';

interface KpiCardsProps {
  kpis: KpiCardDto[];
  riskRecords: CompanyQuarterRisk[];
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

const KpiCards: React.FC<KpiCardsProps> = ({ kpis, riskRecords }) => {
  const { currentWindow, previousWindow } = useMemo(
    () => getRecentQuarterWindows(riskRecords, 4),
    [riskRecords],
  );

  const { value: dwellValue, delta: dwellDelta } = useMemo(
    () => computeDwellTimeDelta(riskRecords, currentWindow, previousWindow),
    [currentWindow, previousWindow, riskRecords],
  );

  const dwellValueText = dwellValue === null ? '—' : formatDecimal(dwellValue);
  const dwellTone: 'positive' | 'negative' | 'neutral' =
    dwellDelta === null || dwellDelta === 0 ? 'neutral' : dwellDelta > 0 ? 'negative' : 'positive';

  const activeKpi = findKpi(kpis, ['ACTIVE_COMPANIES']);
  const dwellKpi = findKpi(kpis, ['RISK_DWELL_TIME', 'RISK_DWELL']);
  const riskIndexKpi = findKpi(kpis, ['RISK_INDEX']);
  const networkKpi = findKpi(kpis, ['NETWORK_STATUS', 'NETWORK_HEALTH']);

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

  const dwellDeltaFromSummary = createDelta(dwellKpi?.delta, '지난 분기 대비');
  const computedDwellDelta =
    dwellDelta === null
      ? undefined
      : {
          value: `${dwellDelta > 0 ? '+' : ''}${formatDecimal(dwellDelta)}분기`,
          direction:
            (dwellTone === 'negative'
              ? 'up'
              : dwellTone === 'positive'
              ? 'down'
              : 'flat') as 'up' | 'down' | 'flat',
          label: '지난 분기 대비',
        };

  const cards = [
    {
      label: activeKpi?.title ?? '활성 관심기업',
      valueText: formatValue(activeKpi?.value),
      unit: activeKpi?.unit ?? undefined,
      delta: createDelta(activeKpi?.delta),
      icon: 'fa-users',
      tone: toTone(activeKpi?.tone),
      tooltip: activeKpi?.tooltip ?? {
        description: '로그인 사용자의 현재 워치리스트 기업 수입니다.',
      },
    },
    {
      label: dwellKpi?.title ?? '리스크 체류 기간',
      valueText: dwellKpi ? formatValue(dwellKpi.value) : dwellValueText,
      unit: dwellKpi?.unit ?? '분기',
      delta: dwellDeltaFromSummary ?? computedDwellDelta,
      icon: 'fa-hourglass-half',
      tone: dwellKpi ? toTone(dwellKpi.tone) : dwellTone,
      tooltip: dwellKpi?.tooltip ?? {
        description: "주의/위험 상태에 머무른 평균 기간(분기 수)입니다.",
        interpretation: '낮을수록 리스크 구간에서 빠르게 회복합니다.',
        actionHint: '체류 기간이 긴 기업을 우선 점검하세요.',
      },
    },
    {
      label: riskIndexKpi?.title ?? '위험 지수',
      valueText: formatValue(riskIndexKpi?.value),
      unit: riskIndexKpi?.unit ?? undefined,
      delta: createDelta(riskIndexKpi?.delta),
      icon: 'fa-shield-halved',
      tone: toTone(riskIndexKpi?.tone),
      tooltip: riskIndexKpi?.tooltip ?? {
        description: '포트폴리오 전체 위험 수준 요약 지표입니다.',
        interpretation: '주의·위험 구간 증가 시 원인 분석이 필요합니다.',
        actionHint: '위험 상위 협력사부터 상세 지표를 확인하세요.',
      },
    },
    {
      label: networkKpi?.title ?? '네트워크 상태',
      valueText: formatValue(networkKpi?.value),
      unit: networkKpi?.unit ?? undefined,
      delta: createDelta(networkKpi?.delta),
      icon: 'fa-heartbeat',
      tone: toTone(networkKpi?.tone),
      tooltip: networkKpi?.tooltip ?? {
        description: '활성 관심기업의 최신 ACTUAL 분기 internal_health_score 평균입니다.',
      },
    },
  ];

  return (
    <div className="relative z-20 grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      {cards.map((stat) => {
        return (
          <KpiCard
            key={stat.label}
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
