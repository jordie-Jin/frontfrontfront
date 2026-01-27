import React from 'react';

type JsonPreviewProps = {
  title: string;
  data: unknown;
};

const JsonPreview: React.FC<JsonPreviewProps> = ({ title, data }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h4 className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{title}</h4>
      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-200">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default JsonPreview;
