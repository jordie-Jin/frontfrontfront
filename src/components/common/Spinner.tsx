import React from 'react';

const Spinner: React.FC<{ label?: string }> = ({ label = '로딩 중' }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-300" role="status" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
};

export default Spinner;
