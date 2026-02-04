import React from 'react';
import { QaPost } from '../../types/decisionRoom';

interface QaThreadProps {
  post: QaPost | null;
  replyText: string;
  onReplyChange: (value: string) => void;
  onAddReply: () => void;
  errorMessage?: string | null;
  canReply?: boolean;
}

const QaThread: React.FC<QaThreadProps> = ({
  post,
  replyText,
  onReplyChange,
  onAddReply,
  errorMessage,
  canReply = true,
}) => {
  if (!post) {
    return (
      <div className="glass-panel rounded-3xl p-10 h-full flex items-center justify-center text-center text-slate-400">
        <div>
          <div className="text-lg text-white mb-2">좌측에서 글을 선택해주세요.</div>
          <p className="text-sm text-slate-500">질문을 선택하면 상세 스레드가 표시됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6 h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-[10px] uppercase tracking-[0.3em] px-3 py-1 rounded-full border ${
              post.status === 'answered'
                ? 'text-emerald-300 border-emerald-900 bg-emerald-950/40'
                : 'text-amber-300 border-amber-900 bg-amber-950/40'
            }`}
          >
            {post.status === 'answered' ? '답변완료' : '답변대기'}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">{post.createdAt}</span>
        </div>
        <h3 className="text-2xl font-light serif text-white mb-2">{post.title}</h3>
        <p className="text-sm text-slate-300 leading-relaxed">{post.body}</p>
        <div className="mt-4 text-xs text-slate-500 uppercase tracking-widest">질문자: {post.author}</div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {post.replies.length === 0 ? (
          <div className="text-sm text-slate-500">아직 답변이 없습니다.</div>
        ) : (
          post.replies.map((reply) => (
            <div key={reply.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                <span>{reply.author}</span>
                <span>{reply.createdAt}</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{reply.body}</p>
            </div>
          ))
        )}
      </div>

      {canReply && (
        <div className="mt-6 border-t border-white/10 pt-4">
          <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">답변 등록</label>
          <textarea
            value={replyText}
            onChange={(event) => onReplyChange(event.target.value)}
            placeholder="답변 내용을 입력해 주세요."
            className="mt-2 w-full min-h-[120px] bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={onAddReply}
              className="px-5 py-2 rounded-full bg-white text-black text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-slate-200 transition"
            >
              답변 등록
            </button>
          </div>
          {errorMessage && <p className="mt-3 text-xs text-rose-400">{errorMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default QaThread;
