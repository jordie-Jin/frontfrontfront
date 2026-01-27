import React from 'react';
import { KpiTooltipContent } from '../../types/kpi';
import { PartnerMetric, TrafficLight } from '../../types/partner';
import IndicatorSignalList from '../kpi/IndicatorSignalList';
import KpiCard from '../kpi/KpiCard';

interface MetricsPanelProps {
  metrics: PartnerMetric[];
  signals: Array<{ label: string; status: TrafficLight; tooltip: KpiTooltipContent }>;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, signals }) => {
  const signalItems = signals.map((signal) => ({
    label: signal.label,
    status: signal.status === 'green' ? 'good' : signal.status === 'yellow' ? 'warn' : 'risk',
    tooltip: signal.tooltip,
  }));

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h4 className="text-[11px] uppercase tracking-[0.3em] text-slate-500">핵심 지표</h4>
        <div className="mt-6 space-y-4">
          {metrics.map((metric) => (
            <KpiCard
              key={metric.label}
              title={metric.label}
              value={metric.value}
              tooltip={metric.tooltip}
              tooltipPlacement="bottom-right"
              className="p-4"
            />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h4 className="text-[11px] uppercase tracking-[0.3em] text-slate-500">보조 지표 신호등</h4>
        <IndicatorSignalList items={signalItems} />
      </div>
    </div>
  );
};

export default MetricsPanel;
