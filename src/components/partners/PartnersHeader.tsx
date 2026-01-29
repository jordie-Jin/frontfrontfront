import React from 'react';

interface PartnersHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddCompanyClick: () => void;
  onLogout?: () => void;
}

const PartnersHeader: React.FC<PartnersHeaderProps> = ({
  searchValue,
  onSearchChange,
  onAddCompanyClick,
  onLogout,
}) => {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-4xl font-light text-white serif">협력사 디렉토리</h2>
        <p className="text-slate-400 mt-2">
          네트워크 기반 협력사 건강도와 최신 리스크 시그널을 한눈에 확인하세요.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <i className="fas fa-search text-slate-500 text-sm"></i>
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="기업명 또는 산업군 검색"
            className="w-64 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>
        <button
          type="button"
          onClick={onAddCompanyClick}
          className="rounded-full bg-gradient-to-r from-slate-100 to-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-[0_0_30px_rgba(255,255,255,0.25)] transition hover:scale-[1.02]"
        >
          기업 추가
        </button>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-white/10 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:bg-white/10"
          >
            로그아웃
          </button>
        )}
      </div>
    </div>
  );
};

export default PartnersHeader;
