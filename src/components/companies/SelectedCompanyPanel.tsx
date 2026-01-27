import React from 'react';
import { CompanySearchItem } from '../../types/company';

type SelectedCompanyPanelProps = {
  selectedCompany: CompanySearchItem | null;
  onConfirm: () => void;
  isConfirming: boolean;
  completionMessage?: string | null;
  errorMessage?: string | null;
};

const SelectedCompanyPanel: React.FC<SelectedCompanyPanelProps> = ({
  selectedCompany,
  onConfirm,
  isConfirming,
  completionMessage,
  errorMessage
}) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h3 className="text-lg text-white">선택된 기업</h3>
      <p className="mt-2 text-sm text-slate-400">선택한 기업 정보를 확인하고 다음 단계로 진행하세요.</p>

      {!selectedCompany && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          아직 선택된 기업이 없습니다.
        </div>
      )}

      {selectedCompany && (
        <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">기업명</p>
            <p className="text-base text-white">{selectedCompany.name}</p>
          </div>
          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">코드</p>
              <p>{selectedCompany.code}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">업종</p>
              <p>{selectedCompany.industry}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">지역</p>
              <p>{selectedCompany.region}</p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {errorMessage}
        </p>
      )}

      {completionMessage && (
        <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {completionMessage}
        </p>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!selectedCompany || isConfirming}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-900 disabled:cursor-not-allowed disabled:bg-white/40"
          aria-disabled={!selectedCompany || isConfirming}
        >
          {isConfirming ? (
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-900">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" aria-hidden="true" />
              진행 중
            </span>
          ) : (
            'Confirm'
          )}
        </button>
      </div>
    </div>
  );
};

export default SelectedCompanyPanel;
