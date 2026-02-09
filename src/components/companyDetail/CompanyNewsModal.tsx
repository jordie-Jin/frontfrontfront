import React from 'react';
import { CompanyInsightItem } from '../../types/company';

interface CompanyNewsModalProps {
  open: boolean;
  news: CompanyInsightItem | null;
  onClose: () => void;
}

const CompanyNewsModal: React.FC<CompanyNewsModalProps> = ({ open, news, onClose }) => {
  if (!open || !news) return null;

  const body = news.body ?? news.content ?? '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-16">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative glass-panel w-full max-w-3xl max-h-full overflow-y-auto rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-slate-700 bg-white/5 text-slate-300 mb-4 inline-block">
            NEWS
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">{news.title}</h2>
          <div className="flex flex-wrap items-center text-[10px] text-slate-500 uppercase tracking-widest gap-4">
            {news.publishedAt && (
              <span>
                <i className="fas fa-calendar-alt mr-2"></i>
                {news.publishedAt}
              </span>
            )}
            {news.source && (
              <span>
                <i className="fas fa-newspaper mr-2"></i>
                {news.source}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-5 text-slate-300 leading-relaxed text-sm">
          {(body || '뉴스 내용을 불러오는 중입니다.').split('\n').map((line, index) => (
            <p key={`${news.id}-line-${index}`} className="text-slate-300">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyNewsModal;
