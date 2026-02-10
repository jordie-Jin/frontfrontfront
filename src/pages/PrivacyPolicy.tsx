import React from 'react';
import content from '../../docs/privacy-policy.md?raw';
import { normalizeLegalMarkdown } from '../utils/legalContent';

const normalizedContent = normalizeLegalMarkdown(content);

const PrivacyPolicy: React.FC = () => (
  <div className="min-h-screen bg-[#050505] text-white">
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">개인정보 처리방침</h1>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
        {normalizedContent}
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
