import React, { useEffect, useRef, useState } from 'react';

interface AiCommentaryCardProps {
  commentary: string;
  variant?: 'standalone' | 'embedded';
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const normalizeCommentary = (text: string) =>
  text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const parseNumberedSections = (text: string) => {
  const sections: { title: string; body: string[] }[] = [];
  const lines = text.split('\n').map((line) => line.trim());
  let current: { title: string; body: string[] } | null = null;

  lines.forEach((line) => {
    if (!line) return;
    const match = line.match(/^(\d+)\.\s*(.+)$/);
    if (match) {
      if (current) sections.push(current);
      current = { title: match[2], body: [] };
      return;
    }
    if (!current) {
      current = { title: '', body: [] };
    }
    current.body.push(line);
  });

  if (current) sections.push(current);
  return sections;
};

const AiCommentaryCard: React.FC<AiCommentaryCardProps> = ({
  commentary,
  variant = 'standalone',
  className,
  isOpen = true,
  onToggle,
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState('0px');
  const normalizedCommentary = normalizeCommentary(commentary);
  const lines = normalizedCommentary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const summary = lines.slice(0, 2).join(' ');
  const bulletItems = lines.slice(2, 4);
  const fallbackSummary = summary || 'AI 분석 코멘트를 수집 중입니다.';
  const fallbackBullets =
    bulletItems.length > 0
      ? bulletItems
      : ['최근 4분기의 핵심 지표 변화를 기반으로 분석을 준비합니다.'];
  const displayCommentary =
    normalizedCommentary.length > 0 ? normalizedCommentary : fallbackSummary;
  const sections = parseNumberedSections(displayCommentary);
  const hasSections = sections.some((section) => section.title.length > 0);

  if (variant === 'embedded') {
    useEffect(() => {
      const height = contentRef.current?.scrollHeight ?? 0;
      setMaxHeight(isOpen ? `${height}px` : '0px');
    }, [commentary, isOpen]);

    return (
      <div
        className={`flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur ${className ?? ''}`}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <i className="fas fa-brain text-slate-500"></i>
            <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
              AI 분석 코멘트
            </span>
          </div>
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              aria-label={isOpen ? 'AI 분석 코멘트 접기' : 'AI 분석 코멘트 펼치기'}
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
            {hasSections ? (
              <div className="space-y-4 text-slate-200">
                {sections.map((section, index) => (
                  <div key={`${section.title}-${index}`} className="space-y-2">
                    {section.title && (
                      <p className="text-sm font-semibold text-white">
                        {index + 1}. {section.title}
                      </p>
                    )}
                    {section.body.length > 0 && (
                      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
                        {section.body.join('\n')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base leading-relaxed text-slate-200 whitespace-pre-line">
                {displayCommentary}
              </p>
            )}
            {normalizedCommentary.length === 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-4 text-[11px] text-slate-400">
                {fallbackBullets.slice(0, 2).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 via-white/10 to-white/5 p-8 ${
        className ?? ''
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <i className="fas fa-brain text-slate-500"></i>
        <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500">AI 분석 코멘트</span>
      </div>
      {hasSections ? (
        <div className="space-y-4 text-slate-200">
          {sections.map((section, index) => (
            <div key={`${section.title}-${index}`} className="space-y-2">
              {section.title && (
                <p className="text-base font-semibold text-white">
                  {index + 1}. {section.title}
                </p>
              )}
              {section.body.length > 0 && (
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-200 italic">
                  {section.body.join('\n')}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="whitespace-pre-line text-lg font-light text-slate-200 leading-relaxed italic">
          {displayCommentary}
        </p>
      )}
    </div>
  );
};

export default AiCommentaryCard;
