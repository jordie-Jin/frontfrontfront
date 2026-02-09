import React, { useMemo } from 'react';
import { KpiCardDto } from '../../types/company';
import { CompanyQuarterRisk } from '../../types/risk';
import { computeDwellTimeDelta, getRecentQuarterWindows } from '../../utils/kpi';
import KpiCard from '../kpi/KpiCard';

interface KpiCardsProps {
  kpis: KpiCardDto[];
  riskRecords: CompanyQuarterRisk[];
}

const formatDelta = (value?: number, suffix = '%'): string | undefined => {
  if (value === undefined) return undefined;
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}${suffix}`;
};

const formatDecimal = (value: number): string => value.toFixed(1);

const parseNumericValue = (value: KpiCardDto['value']): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const toTone = (tone?: KpiCardDto['tone']): 'positive' | 'negative' | 'neutral' => {
  if (tone === 'RISK') return 'negative';
  if (tone === 'WARN') return 'neutral';
  if (tone === 'GOOD') return 'positive';
  return 'neutral';
};

const toDeltaUnit = (deltaUnit?: string | null): string => deltaUnit ?? '%';

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
  const dwellDeltaText =
    dwellDelta === null ? '—' : `${dwellDelta > 0 ? '+' : ''}${formatDecimal(dwellDelta)}`;

  const dwellTone: 'positive' | 'negative' | 'neutral' =
    dwellDelta === null || dwellDelta === 0 ? 'neutral' : dwellDelta > 0 ? 'negative' : 'positive';

  const activeKpi = kpis.find((item) => item.key === 'ACTIVE_COMPANIES');
  const riskIndexKpi = kpis.find((item) => item.key === 'RISK_INDEX');
  const networkKpi = kpis.find((item) => item.key === 'NETWORK_HEALTH');

  const activeValue = parseNumericValue(activeKpi?.value) ?? 0;
  const networkValue = parseNumericValue(networkKpi?.value) ?? 0;

  const cards = [
    {
      label: activeKpi?.title ?? '활성 협력사',
      valueText: activeValue.toString(),
      deltaText: formatDelta(activeKpi?.delta?.value, toDeltaUnit(activeKpi?.delta?.unit)),
      icon: 'fa-users',
      tone: toTone(activeKpi?.tone),
    },
    {
      label: '리스크 체류 기간',
      valueText: dwellValueText,
      unit: '분기',
      deltaText: dwellDeltaText,
      icon: 'fa-hourglass-half',
      tone: dwellTone,
    },
    {
      label: riskIndexKpi?.title ?? '위험 지수',
      valueText: typeof riskIndexKpi?.value === 'string' ? riskIndexKpi.value : '—',
      deltaText: riskIndexKpi?.delta?.label ?? undefined,
      icon: 'fa-shield-halved',
      tone: toTone(riskIndexKpi?.tone),
    },
    {
      label: networkKpi?.title ?? '네트워크 상태',
      valueText: `${networkValue}%`,
      deltaText: formatDelta(networkKpi?.delta?.value, toDeltaUnit(networkKpi?.delta?.unit)),
      icon: 'fa-heartbeat',
      tone: toTone(networkKpi?.tone),
    },
  ];

  return (
    <div className="relative z-20 grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      {cards.map((stat) => {
        const deltaDirection =
          stat.tone === 'negative' ? 'down' : stat.tone === 'neutral' ? 'flat' : 'up';
        return (
          <KpiCard
            key={stat.label}
            title={stat.label}
            value={stat.valueText}
            unit={stat.unit}
            delta={stat.deltaText ? { value: stat.deltaText, direction: deltaDirection } : undefined}
            icon={<i className={`fas ${stat.icon}`} />}
            tone={stat.tone === 'negative' ? 'risk' : stat.tone === 'neutral' ? 'warn' : 'good'}
            tooltip={{
              description:
                stat.label === '활성 협력사'
                  ? '현재 모니터링 중인 협력사 수입니다.'
                  : stat.label === '리스크 체류 기간'
                  ? "Risk Dwell Time: 협력사가 '주의/위험' 상태에 머무른 평균 기간(분기 수)입니다."
                  : stat.label === '위험 지수'
                  ? '포트폴리오 전체 위험 수준 요약 지표입니다.'
                  : '협력 네트워크의 전반적 양호 상태 비율입니다.',
              interpretation:
                stat.label === '활성 협력사'
                  ? '증가=신규 편입/재가동, 감소=종료/필터링'
                  : stat.label === '리스크 체류 기간'
                  ? '낮을수록 리스크 구간에서 빠르게 회복/탈출합니다.'
                  : stat.label === '위험 지수'
                  ? '주의·위험 구간 증가 시 원인 분석이 필요합니다.'
                  : '하락 시 특정 섹터 이상 가능성이 있습니다.',
              actionHint:
                stat.label === '활성 협력사'
                  ? '급증 시 편입 기준과 데이터 갱신을 확인하세요.'
                  : stat.label === '리스크 체류 기간'
                  ? '체류 기간이 긴 협력사를 우선 점검하고, 산업/섹터별로 체류 기간을 비교하세요.'
                  : stat.label === '위험 지수'
                  ? '위험 상위 협력사부터 상세 지표를 확인하세요.'
                  : '최근 공시·외부 변수와 함께 확인하세요.',
            }}
          />
        );
      })}
    </div>
  );
};

export default KpiCards;
