import React from 'react';

type AddCompanyFormProps = {
  name: string;
  code: string;
  onNameChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  validationMessage?: string | null;
  isSearching: boolean;
};

const AddCompanyForm: React.FC<AddCompanyFormProps> = ({
  name,
  code,
  onNameChange,
  onCodeChange,
  onSearch,
  onReset,
  validationMessage,
  isSearching
}) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <h3 className="text-lg text-white">기업 검색</h3>
      <p className="mt-2 text-sm text-slate-400">기업명 또는 기업코드를 입력해 검색하세요.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-300">
          기업명
          <input
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-slate-500 focus:border-white/30 focus:outline-none"
            placeholder="예: 네오클라우드"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-300">
          기업코드
          <input
            type="text"
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-slate-500 focus:border-white/30 focus:outline-none"
            placeholder="예: NC-441"
          />
        </label>
      </div>
      {validationMessage && (
        <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {validationMessage}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSearch}
          disabled={isSearching}
          className="rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-900 disabled:cursor-not-allowed disabled:bg-white/40"
        >
          {isSearching ? '검색 중...' : 'Search'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white hover:bg-white/10"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default AddCompanyForm;
