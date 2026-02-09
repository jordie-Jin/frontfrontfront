import React from 'react';
import content from '../../docs/terms-of-service.md?raw';

const TermsOfService: React.FC = () => (
  <div className="min-h-screen bg-[#050505] text-white">
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">이용약관</h1>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
        {content}
      </div>
    </div>
  </div>
);

export default TermsOfService;
