import React from 'react';

interface AiCommentaryCardProps {
  commentary: string;
  variant?: 'standalone' | 'embedded';
  className?: string;
}

const AiCommentaryCard: React.FC<AiCommentaryCardProps> = ({
  commentary,
  variant = 'standalone',
  className,
}) => {
  const lines = commentary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const summary = lines.slice(0, 2).join(' ');
  const bulletItems = lines.slice(2, 4);
  const fallbackSummary = summary || 'AI 분석 코멘트를 수집 중입니다.';
  const fallbackBullets =
    bulletItems.length > 0
      ? bulletItems
      : ['최근 30일 핵심 지표 변화를 기반으로 분석을 준비합니다.'];
  const displayCommentary = commentary.trim().length > 0 ? commentary : fallbackSummary;

  if (variant === 'embedded') {
    return (
      <div
        className={`flex h-[500px] flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur ${className ?? ''}`}
      >
        <div className="mb-3 flex items-center gap-2">
          <i className="fas fa-brain text-slate-500"></i>
          <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
            AI 분석 코멘트
          </span>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-line">
            {displayCommentary}
          </p>
          {commentary.trim().length === 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-4 text-[11px] text-slate-400">
              {fallbackBullets.slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
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
      <p className="whitespace-pre-line text-lg font-light text-slate-200 leading-relaxed italic">
        {commentary}
      </p>
    </div>
  );
};

export default AiCommentaryCard;
