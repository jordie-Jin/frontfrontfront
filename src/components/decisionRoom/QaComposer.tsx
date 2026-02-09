import React from 'react';

interface QaComposerProps {
  open: boolean;
  title: string;
  body: string;
  onChangeTitle: (value: string) => void;
  onChangeBody: (value: string) => void;
  onCreate: () => void;
  onClose: () => void;
  errorMessage?: string | null;
  isSubmitDisabled?: boolean;
}

const QaComposer: React.FC<QaComposerProps> = ({
  open,
  title,
  body,
  onChangeTitle,
  onChangeBody,
  onCreate,
  onClose,
  errorMessage,
  isSubmitDisabled,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-16">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative glass-panel w-full max-w-2xl rounded-3xl p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400"
        >
          <i className="fas fa-times"></i>
        </button>

        <h3 className="text-2xl font-semibold tracking-tight text-white mb-6">질문 작성</h3>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">제목</label>
            <input
              type="text"
              value={title}
              onChange={(event) => onChangeTitle(event.target.value)}
              placeholder="질문 제목을 입력하세요"
              className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">내용</label>
            <textarea
              value={body}
              onChange={(event) => onChangeBody(event.target.value)}
              placeholder="질문 내용을 입력하세요"
              className="mt-2 w-full min-h-[180px] bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-white/20 text-[10px] uppercase tracking-[0.3em] text-slate-300 hover:text-white hover:border-white/40 transition"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={isSubmitDisabled}
            className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] font-semibold transition ${
              isSubmitDisabled
                ? 'bg-white/20 text-slate-500 cursor-not-allowed'
                : 'bg-white text-black hover:bg-slate-200'
            }`}
          >
            저장
          </button>
        </div>
        {errorMessage && <p className="mt-4 text-xs text-rose-400">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default QaComposer;
