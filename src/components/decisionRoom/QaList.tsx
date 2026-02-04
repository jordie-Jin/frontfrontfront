import React from 'react';
import { QaPost } from '../../types/decisionRoom';

export type QaStatusFilter = 'all' | 'pending' | 'answered';

interface QaListProps {
  posts: QaPost[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: QaStatusFilter;
  onStatusFilterChange: (value: QaStatusFilter) => void;
  showAuthorFilter?: boolean;
  authorOptions?: string[];
  selectedAuthor?: string;
  onAuthorChange?: (value: string) => void;
}

const statusStyles: Record<QaStatusFilter, string> = {
  all: 'text-slate-400 border-white/10 bg-white/5',
  pending: 'text-amber-300 border-amber-900 bg-amber-950/40',
  answered: 'text-emerald-300 border-emerald-900 bg-emerald-950/40',
};

const QaList: React.FC<QaListProps> = ({
  posts,
  selectedId,
  onSelect,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  showAuthorFilter = false,
  authorOptions = [],
  selectedAuthor = 'all',
  onAuthorChange,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 h-full flex flex-col">
      <div className="mb-6 space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Search</label>
          <div className="mt-2 relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"></i>
            <input
              type="text"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="제목, 작성자, 내용 검색"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-9 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        {showAuthorFilter && (
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
              질문자
            </label>
            <div className="mt-2">
              <select
                value={selectedAuthor}
                onChange={(event) => onAuthorChange?.(event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <option value="all">전체</option>
                {authorOptions.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Status</label>
          <div className="mt-2 flex gap-2 flex-wrap">
            {(['all', 'pending', 'answered'] as QaStatusFilter[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusFilterChange(status)}
                className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] border transition ${
                  statusFilter === status
                    ? 'bg-white text-black border-white'
                    : statusStyles[status]
                }`}
              >
                {status === 'all' ? 'ALL' : status === 'pending' ? '답변대기' : '답변완료'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-slate-400">
          <div>
            <div className="text-base text-white mb-2">표시할 질문이 없습니다.</div>
            <p className="text-sm text-slate-500">필터를 변경하거나 새 질문을 등록하세요.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-1">
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => onSelect(post.id)}
              className={`w-full text-left p-4 rounded-2xl border transition ${
                selectedId === post.id
                  ? 'border-white/40 bg-white/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="text-sm font-semibold text-white line-clamp-2">{post.title}</h4>
                <span
                  className={`text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded-full border ${
                    post.status === 'answered'
                      ? 'text-emerald-300 border-emerald-900 bg-emerald-950/40'
                      : 'text-amber-300 border-amber-900 bg-amber-950/40'
                  }`}
                >
                  {post.status === 'answered' ? '답변완료' : '답변대기'}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">{post.body}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest">
                <span>{post.author}</span>
                <span className="flex items-center gap-2">
                  {post.createdAt}
                  <span className="text-slate-600">•</span>
                  <span>{post.replies.length} replies</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QaList;
