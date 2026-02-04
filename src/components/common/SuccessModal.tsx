import React from 'react';

interface SuccessModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  title,
  message,
  confirmLabel = '확인',
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl"></div>
      <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/10 bg-black/80 p-10 text-center shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/20">
          <i className="fas fa-check text-xs text-white"></i>
        </div>
        <h3 className="mb-3 text-2xl font-light serif">{title}</h3>
        <p className="mb-8 text-sm text-slate-400 leading-relaxed">{message}</p>
        <button
          type="button"
          className="w-full rounded-2xl bg-white py-4 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-slate-200 transition-all"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
