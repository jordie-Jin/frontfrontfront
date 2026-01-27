import React, { useMemo, useState } from 'react';
import { KpiTooltipContent } from '../../types/kpi';
import KpiTooltip, { KpiTooltipPlacement } from './KpiTooltip';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  delta?: { value: string; direction: 'up' | 'down' | 'flat' };
  icon?: React.ReactNode;
  tone?: 'default' | 'good' | 'warn' | 'risk';
  tooltip?: KpiTooltipContent;
  tooltipPlacement?: KpiTooltipPlacement;
  className?: string;
}

const toneIconClasses: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'text-slate-600',
  good: 'text-emerald-400/80',
  warn: 'text-amber-400/80',
  risk: 'text-rose-400/80',
};

type DeltaDirection = 'up' | 'down' | 'flat';

const deltaClasses: Record<DeltaDirection, string> = {
  up: 'text-emerald-400',
  down: 'text-rose-400',
  flat: 'text-amber-400',
};

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  delta,
  icon,
  tone = 'default',
  tooltip,
  tooltipPlacement = 'top-right',
  className,
}) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const hasTooltip = Boolean(tooltip);

  const displayValue = useMemo(() => {
    if (typeof value === 'number') {
      return value.toLocaleString('ko-KR');
    }
    return value;
  }, [value]);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setTooltipOpen(false);
    }
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }
    setTooltipOpen(false);
  };

  return (
    <div
      className={`glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all cursor-default relative ${className ?? ''}`}
      onMouseEnter={hasTooltip ? () => setTooltipOpen(true) : undefined}
      onMouseLeave={hasTooltip ? handleMouseLeave : undefined}
      onFocusCapture={hasTooltip ? () => setTooltipOpen(true) : undefined}
      onBlurCapture={hasTooltip ? handleBlur : undefined}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{title}</span>
        <div className="flex items-center gap-2">
          {icon ? <span className={toneIconClasses[tone]}>{icon}</span> : null}
          {tooltip && (
            <KpiTooltip
              tooltip={tooltip}
              placement={tooltipPlacement}
              open={tooltipOpen}
              onOpenChange={setTooltipOpen}
            />
          )}
        </div>
      </div>
      <div>
        <div className="text-3xl font-light text-white mb-1">
          <span>{displayValue}</span>
          {unit && <span className="ml-1 text-base text-slate-400">{unit}</span>}
        </div>
        {delta && (
          <div className={`text-[10px] ${deltaClasses[delta.direction]}`}>
            {delta.value} <span className="text-slate-600 ml-1">지난달 대비</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
