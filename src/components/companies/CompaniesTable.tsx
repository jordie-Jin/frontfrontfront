import React from 'react';
import { Link } from 'react-router-dom';
import { CompanySummary } from '../../types/company';
import {
  getCompanyExternalHealthScore,
  getCompanyHealthScore,
  getCompanyStatusFromHealth,
  getHealthTone,
} from '../../utils/companySelectors';

interface CompaniesTableProps {
  companies: CompanySummary[];
  onSelect: (company: CompanySummary) => void;
}

const statusStyles: Record<string, string> = {
  정상: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  주의: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  위험: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
};

const CompaniesTable: React.FC<CompaniesTableProps> = ({ companies, onSelect }) => {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-white/5 text-xs uppercase tracking-[0.3em] text-slate-400">
          <tr>
            <th className="px-6 py-4">협력사</th>
            <th className="px-6 py-4">산업군</th>
            <th className="px-6 py-4">내부 건강도</th>
            <th className="px-6 py-4">외부 건강도</th>
            <th className="px-6 py-4">상태</th>
            <th className="px-6 py-4">상세</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {companies.map((company) => {
            const healthScore = getCompanyHealthScore(company);
            const healthTone = getHealthTone(healthScore);
            const statusLabel = getCompanyStatusFromHealth(healthScore);
            const externalHealthScore = getCompanyExternalHealthScore(company);
            const externalHealthTone = getHealthTone(externalHealthScore);
            return (
              <tr
                key={company.id}
                className="cursor-pointer hover:bg-white/5 transition"
                onClick={() => onSelect(company)}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm text-white">
                      {company.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-100">{company.name}</div>
                      <div className="text-[11px] text-slate-500">ID {company.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-slate-400">{company.sector.label}</td>
                <td className="px-6 py-5 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300">{healthScore}%</span>
                    <div className="w-24 bg-white/10 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full ${
                          healthTone === 'good'
                            ? 'bg-emerald-400'
                            : healthTone === 'warn'
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                        style={{ width: `${healthScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300">{externalHealthScore}%</span>
                    <div className="w-24 bg-white/10 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full ${
                          externalHealthTone === 'good'
                            ? 'bg-emerald-400'
                            : externalHealthTone === 'warn'
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                        style={{ width: `${externalHealthScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${
                      statusStyles[statusLabel]
                    }`}
                  >
                    {statusLabel}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-slate-400">
                  <Link
                    to={`/companies/${company.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="text-xs text-slate-300 hover:text-white"
                  >
                    보기
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CompaniesTable;
