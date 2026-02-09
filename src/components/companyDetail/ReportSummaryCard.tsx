import React, { useEffect, useRef, useState } from 'react';

interface ReportSummaryCardProps {
  summary: string;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({
  summary,
  className,
  isOpen = true,
  onToggle,
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState('0px');
  const normalizedSummary = summary
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const lines = normalizedSummary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const fallbackSummary =
    normalizedSummary.length > 0 ? normalizedSummary : '사업보고서 요약을 불러오는 중입니다.';
  const bulletItems = lines.slice(1, 3);

  useEffect(() => {
    const height = contentRef.current?.scrollHeight ?? 0;
    setMaxHeight(isOpen ? `${height}px` : '0px');
  }, [isOpen, summary]);

  return (
    <div
      className={`flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur ${
        className ?? ''
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <i className="fas fa-file-alt text-slate-500"></i>
          <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
            사업보고서 설명
          </span>
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={isOpen ? '사업보고서 설명 접기' : '사업보고서 설명 펼치기'}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-white/30 hover:text-slate-200"
          >
            <i className={`fas ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
          </button>
        )}
      </div>
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
        style={{ maxHeight, opacity: isOpen ? 1 : 0 }}
      >
        <div ref={contentRef} className="max-h-[380px] overflow-y-auto pr-2">
          <p className="text-base leading-relaxed text-slate-200 whitespace-pre-line">
            {fallbackSummary}
          </p>
          {normalizedSummary.length === 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-4 text-[11px] text-slate-400">
              {bulletItems.length > 0 ? (
                bulletItems.map((item) => <li key={item}>{item}</li>)
              ) : (
                <>
                  <li>최근 분기 사업보고서 핵심 내용을 준비 중입니다.</li>
                  <li>재무 및 리스크 요약을 정리하고 있습니다.</li>
                </>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportSummaryCard;
