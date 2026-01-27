import React, { useState } from 'react';
import { KpiTooltipContent } from '../../types/kpi';
import KpiTooltip from './KpiTooltip';

interface IndicatorSignalItem {
  label: string;
  status: 'good' | 'warn' | 'risk';
  tooltip: KpiTooltipContent;
}

interface IndicatorSignalListProps {
  items: IndicatorSignalItem[];
}

const statusDot: Record<IndicatorSignalItem['status'], string> = {
  good: 'bg-emerald-400',
  warn: 'bg-amber-400',
  risk: 'bg-rose-400',
};

const IndicatorSignalRow: React.FC<IndicatorSignalItem> = ({ label, status, tooltip }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setTooltipOpen(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
      onMouseEnter={() => setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
      onFocusCapture={() => setTooltipOpen(true)}
      onBlurCapture={handleBlur}
    >
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-3">
        <KpiTooltip tooltip={tooltip} placement="bottom-right" open={tooltipOpen} onOpenChange={setTooltipOpen} />
        <span
          className={`h-3 w-3 rounded-full ${statusDot[status]} shadow-[0_0_12px_rgba(255,255,255,0.15)]`}
        />
      </div>
    </div>
  );
};

const IndicatorSignalList: React.FC<IndicatorSignalListProps> = ({ items }) => {
  return (
    <div className="mt-6 space-y-3">
      {items.map((item) => (
        <IndicatorSignalRow key={item.label} {...item} />
      ))}
    </div>
  );
};

export default IndicatorSignalList;
