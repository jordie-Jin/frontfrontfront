import React from 'react';
import { DashboardKpis, KpiCard } from '../../types/dashboard';

interface KpiCardsProps {
  kpis: DashboardKpis;
}

const formatDelta = (value?: number, suffix = '%'): string | undefined => {
  if (value === undefined) return undefined;
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}${suffix}`;
};

const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  const cards: KpiCard[] = [
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
        const deltaClass =
          stat.tone === 'negative'
            ? 'text-rose-400'
            : stat.tone === 'neutral'
            ? 'text-amber-400'
            : 'text-emerald-400';
        return (
          <div
            key={stat.label}
            className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all cursor-default"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{stat.label}</span>
              <i className={`fas ${stat.icon} text-slate-600`}></i>
            </div>
            <div>
              <div className="text-3xl font-light text-white mb-1">{stat.valueText}</div>
              {stat.deltaText ? (
                <div className={`text-[10px] ${deltaClass}`}>
                  {stat.deltaText} <span className="text-slate-600 ml-1">지난달 대비</span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-600">최근 데이터 없음</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiCards;
