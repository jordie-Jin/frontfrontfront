import React from 'react';
import { Link } from 'react-router-dom';
import { CompanyInsightItem, CompanyOverview, CompanySummary } from '../../types/company';
import {
  getCompanyHealthScore,
  getCompanyStatusFromHealth,
  getHealthTone,
} from '../../utils/companySelectors';

interface CompanyQuickViewDrawerProps {
  isOpen: boolean;
  detail?: CompanyOverview | null;
  newsItems?: CompanyInsightItem[];
  isLoading: boolean;
  error?: string | null;
  onClose: () => void;
}

const toneColor: Record<string, string> = {
  positive: 'bg-emerald-400',
  neutral: 'bg-slate-400',
  risk: 'bg-rose-400',
};

const CompanyQuickViewDrawer: React.FC<CompanyQuickViewDrawerProps> = ({
  isOpen,
  detail,
  newsItems = [],
  isLoading,
  error,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  const summary = detail?.company;
  const newsTimeline = newsItems
    .filter((item) => item.type === 'NEWS')
    .slice(0, 6)
    .map((item) => ({
      title: item.title,
      date: item.publishedAt ?? '—',
      tone: 'neutral' as const,
    }));
  const summaryAsPreview: CompanySummary | null = summary
    ? {
        id: summary.id,
        name: summary.name,
        sector: summary.sector,
        overallScore: summary.overallScore,
        riskLevel: summary.riskLevel,
      }
    : null;
  const healthScore = summaryAsPreview ? getCompanyHealthScore(summaryAsPreview) : 0;
  const healthTone = getHealthTone(healthScore);
  const externalHealthScore = summaryAsPreview?.kpi?.reputationScore ?? 0;
  const externalHealthTone = getHealthTone(externalHealthScore);
  const statusLabel = summary ? getCompanyStatusFromHealth(healthScore) : '—';

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        role="presentation"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 z-50 h-full w-[420px] overflow-y-auto border-l border-white/10 bg-[#07070a]/80 p-8 shadow-2xl backdrop-blur">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">협력사 요약</p>
            <h3 className="mt-2 text-2xl font-light text-white">
              {summary?.name ?? '협력사 정보'}
            </h3>
            <p className="text-xs text-slate-500">{summary?.sector.label}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-400 animate-pulse">
            요약 정보를 불러오는 중입니다.
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
            {error}
          </div>
        )}

        {!isLoading && !error && summary && (
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">내부 건강도</span>
                <div
                  className={`mt-3 text-2xl font-light ${
                    healthTone === 'good'
                      ? 'text-emerald-300'
                      : healthTone === 'warn'
                      ? 'text-amber-300'
                      : 'text-rose-300'
                  }`}
                >
                  {healthScore}%
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">외부 건강도</span>
                <div
                  className={`mt-3 text-2xl font-light ${
                    externalHealthTone === 'good'
                      ? 'text-emerald-300'
                      : externalHealthTone === 'warn'
                      ? 'text-amber-300'
                      : 'text-rose-300'
                  }`}
                >
                  {externalHealthScore}%
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] uppercase tracking-[0.3em] text-slate-500">주요 뉴스</h4>
              <div className="mt-6 space-y-6">
                {newsTimeline.length === 0 && (
                  <div className="text-sm text-slate-500">표시할 뉴스가 없습니다.</div>
                )}
                {newsTimeline.map((item, index) => (
                  <div key={`${item.date}-${index}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className={`mt-1 h-2 w-2 rounded-full ${toneColor[item.tone]}`} />
                      {index < newsTimeline.length - 1 && <span className="mt-2 h-full w-px bg-white/10" />}
                    </div>
                    <div>
                      <p className="text-sm text-slate-200">{item.title}</p>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to={`/companies/${summary.id}`}
                className="flex w-full items-center justify-center rounded-full bg-white px-6 py-4 text-xs font-bold uppercase tracking-[0.3em] text-slate-900 transition hover:opacity-90"
              >
                전체 분석 보기 →
              </Link>
              <button
                type="button"
                className="w-full rounded-full border border-white/20 px-6 py-4 text-xs font-bold uppercase tracking-[0.3em] text-white transition hover:bg-white/5"
              >
                자료 업데이트 요청
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
              현재 상태: {statusLabel}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default CompanyQuickViewDrawer;
