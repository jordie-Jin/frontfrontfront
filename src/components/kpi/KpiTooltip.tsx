import React, { useEffect, useId, useRef, useState } from 'react';
import { KpiTooltipContent } from '../../types/kpi';

export type KpiTooltipPlacement = 'top-right' | 'bottom-right' | 'bottom-left';

interface KpiTooltipProps {
  tooltip: KpiTooltipContent;
  placement?: KpiTooltipPlacement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const placementClasses: Record<KpiTooltipPlacement, string> = {
  'top-right': 'right-0 top-6',
  'bottom-right': 'right-0 top-full mt-2',
  'bottom-left': 'left-0 top-full mt-2',
};

const KpiTooltip: React.FC<KpiTooltipProps> = ({
  tooltip,
  placement = 'top-right',
  open,
  onOpenChange,
  className,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const isControlled = open !== undefined;
  const tooltipId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const setOpen = (nextOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-flex ${className ?? ''}`}>
      <button
        type="button"
        aria-describedby={tooltipId}
        aria-expanded={isOpen}
        onClick={() => setOpen(!isOpen)}
        onMouseEnter={() => {
          if (!isControlled) setOpen(true);
        }}
        onMouseLeave={() => {
          if (!isControlled) setOpen(false);
        }}
        onFocus={() => {
          if (!isControlled) setOpen(true);
        }}
        onBlur={() => {
          if (!isControlled) setOpen(false);
        }}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] text-slate-400 transition hover:border-white/30 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
      >
        <i className="fas fa-circle-info" aria-hidden="true" />
        <span className="sr-only">KPI 안내 열기</span>
      </button>
      <div
        id={tooltipId}
        role="tooltip"
        aria-hidden={!isOpen}
        className={`absolute z-50 w-56 max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1220]/95 p-3 text-[11px] text-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-all duration-200 ${
          placementClasses[placement]
        } ${isOpen ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'}`}
      >
        <p className="font-semibold text-slate-100">정의</p>
        <p className="text-slate-300">{tooltip.description}</p>
        {tooltip.interpretation && (
          <>
            <p className="mt-2 font-semibold text-slate-100">해석</p>
            <p className="text-slate-300">{tooltip.interpretation}</p>
          </>
        )}
        {tooltip.actionHint && (
          <>
            <p className="mt-2 font-semibold text-slate-100">액션</p>
            <p className="text-slate-300">{tooltip.actionHint}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default KpiTooltip;
