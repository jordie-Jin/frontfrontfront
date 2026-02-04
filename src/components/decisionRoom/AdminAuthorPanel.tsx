import React from 'react';

export type AuthorSort = 'name-asc' | 'name-desc' | 'recent';

interface AuthorItem {
  name: string;
  lastCreatedAt?: string | null;
}

interface AdminAuthorPanelProps {
  authors: AuthorItem[];
  selectedAuthor: string;
  onSelectAuthor: (author: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortValue: AuthorSort;
  onSortChange: (value: AuthorSort) => void;
}

const AdminAuthorPanel: React.FC<AdminAuthorPanelProps> = ({
  authors,
  selectedAuthor,
  onSelectAuthor,
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 h-full flex flex-col">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white">질문자</h4>
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1">
          질문자 선택
        </p>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">검색</label>
          <div className="mt-2 relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"></i>
            <input
              type="text"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="질문자 이름 검색"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-9 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">정렬</label>
          <select
            value={sortValue}
            onChange={(event) => onSortChange(event.target.value as AuthorSort)}
            className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <option value="recent">최근 질문 순</option>
            <option value="name-asc">이름 오름차순</option>
            <option value="name-desc">이름 내림차순</option>
          </select>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        <button
          type="button"
          onClick={() => onSelectAuthor('all')}
          className={`w-full text-left px-3 py-2 rounded-xl text-xs uppercase tracking-[0.2em] border transition ${
            selectedAuthor === 'all'
              ? 'bg-white text-black border-white'
              : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
          }`}
        >
          전체
        </button>
        {authors.map((author) => (
          <button
            key={author.name}
            type="button"
            onClick={() => onSelectAuthor(author.name)}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs border transition ${
              selectedAuthor === author.name
                ? 'bg-white text-black border-white'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{author.name}</span>
              {author.lastCreatedAt && (
                <span className="text-[10px] text-slate-500">{author.lastCreatedAt}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminAuthorPanel;
