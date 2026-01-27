import React from 'react';
import { DashboardKpis, KpiCard as KpiCardData } from '../../types/dashboard';
import KpiCard from '../kpi/KpiCard';

interface KpiCardsProps {
  kpis: DashboardKpis;
}

const formatDelta = (value?: number, suffix = '%'): string | undefined => {
  if (value === undefined) return undefined;
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}${suffix}`;
};

const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  const cards: KpiCardData[] = [
    {
      label: '활성 파트너',
      valueText: kpis.activePartners.value.toString(),
      deltaText: formatDelta(kpis.activePartners.deltaPct),
      icon: 'fa-users',
      tone:
        kpis.activePartners.deltaPct !== undefined && kpis.activePartners.deltaPct < 0
          ? 'negative'
          : 'positive',
    },
    {
      label: '의사결정 속도',
      valueText: `${kpis.decisionVelocityDays.value}일`,
      deltaText: kpis.decisionVelocityDays.deltaDays !== undefined
        ? `${kpis.decisionVelocityDays.deltaDays > 0 ? '+' : ''}${kpis.decisionVelocityDays.deltaDays}일`
        : undefined,
      icon: 'fa-bolt',
      tone:
        kpis.decisionVelocityDays.deltaDays !== undefined && kpis.decisionVelocityDays.deltaDays > 0
          ? 'negative'
          : 'positive',
    },
    {
      label: '위험 지수',
      valueText: kpis.riskIndex.label,
      deltaText: kpis.riskIndex.deltaText,
      icon: 'fa-shield-halved',
      tone: kpis.riskIndex.status === 'risk' ? 'negative' : kpis.riskIndex.status === 'watch' ? 'neutral' : 'positive',
    },
    {
      label: '네트워크 상태',
      valueText: `${kpis.networkHealth.valuePct}%`,
      deltaText: formatDelta(kpis.networkHealth.deltaPct),
      icon: 'fa-heartbeat',
      tone:
        kpis.networkHealth.deltaPct !== undefined && kpis.networkHealth.deltaPct < 0
          ? 'negative'
          : 'positive',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      {cards.map((stat) => {
        const deltaDirection = stat.tone === 'negative' ? 'down' : stat.tone === 'neutral' ? 'flat' : 'up';
        return (
          <KpiCard
            key={stat.label}
            title={stat.label}
            value={stat.valueText}
            delta={stat.deltaText ? { value: stat.deltaText, direction: deltaDirection } : undefined}
            icon={<i className={`fas ${stat.icon}`} />}
            tone={stat.tone === 'negative' ? 'risk' : stat.tone === 'neutral' ? 'warn' : 'good'}
            tooltip={{
              description:
                stat.label === '활성 파트너'
                  ? '현재 모니터링 중인 협력사 수입니다.'
                  : stat.label === '의사결정 속도'
                  ? '이슈 발생 후 조치까지 평균 소요 기간입니다.'
                  : stat.label === '위험 지수'
                  ? '포트폴리오 전체 위험 수준 요약 지표입니다.'
                  : '협력 네트워크의 전반적 정상 상태 비율입니다.',
              interpretation:
                stat.label === '활성 파트너'
                  ? '증가=신규 편입/재가동, 감소=종료/필터링'
                  : stat.label === '의사결정 속도'
                  ? '낮을수록 대응 프로세스가 빠릅니다.'
                  : stat.label === '위험 지수'
                  ? '주의·위험 구간 증가 시 원인 분석이 필요합니다.'
                  : '하락 시 특정 섹터 이상 가능성이 있습니다.',
              actionHint:
                stat.label === '활성 파트너'
                  ? '급증 시 편입 기준과 데이터 갱신을 확인하세요.'
                  : stat.label === '의사결정 속도'
                  ? '상승 추세면 승인·커뮤니케이션 병목을 점검하세요.'
                  : stat.label === '위험 지수'
                  ? '위험 상위 파트너부터 상세 지표를 확인하세요.'
                  : '최근 공시·외부 변수와 함께 확인하세요.',
            }}
          />
        );
      })}
    </div>
  );
};

export default KpiCards;
