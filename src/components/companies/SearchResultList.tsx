import React from 'react';
import { CompanySearchItem } from '../../types/company';
import Spinner from '../common/Spinner';

type SearchResultListProps = {
  items: CompanySearchItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  selectedId?: string | null;
  hasSearched: boolean;
  onSelect: (company: CompanySearchItem) => void;
};

const SearchResultList: React.FC<SearchResultListProps> = ({
  items,
  total,
  isLoading,
  error,
  selectedId,
  hasSearched,
  onSelect
}) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg text-white">검색 결과</h3>
          <p className="text-sm text-slate-400">최대 10개까지 표시됩니다.</p>
        </div>
        {hasSearched && !isLoading && !error && (
          <span className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-200">
            총 {total}건
          </span>
        )}
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="space-y-3">
            <Spinner label="검색 중" />
            <div className="grid gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && error && (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        {!isLoading && !error && hasSearched && items.length === 0 && (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            결과 없음
          </p>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 bg-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-slate-400">
              <span>기업명</span>
              <span>코드</span>
              <span>업종</span>
              <span>지역</span>
            </div>
            <div className="divide-y divide-white/5">
              {items.map((company) => {
                const isSelected = selectedId === company.companyId;
                return (
                  <button
                    key={company.companyId}
                    type="button"
                    onClick={() => onSelect(company)}
                    className={`grid w-full grid-cols-[2fr_1fr_1fr_1fr] items-center gap-2 px-4 py-4 text-left text-sm transition ${
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      {company.name}
                      {isSelected && (
                        <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-100">
                          Selected
                        </span>
                      )}
                    </span>
                    <span>{company.code}</span>
                    <span>{company.industry}</span>
                    <span>{company.region}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultList;
