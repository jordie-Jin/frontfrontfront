import React from 'react';
import { DashboardRange } from '../../types/dashboard';

const ranges: { label: string; value: DashboardRange }[] = [
  { label: '최근 7일', value: '7d' },
  { label: '최근 30일', value: '30d' },
  { label: '최근 90일', value: '90d' },
];

interface DashboardHeaderProps {
  range: DashboardRange;
  onChangeRange: (range: DashboardRange) => void;
  onLogout?: () => void;
  userName?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  range,
  onChangeRange,
  onLogout,
  userName = 'id',
}) => {
  return (
    <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-4xl font-light serif text-white mb-2">관리 현황 대시보드</h2>
        <p className="text-slate-400">{userName} 님, 환영합니다.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {ranges.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChangeRange(option.value)}
              className={`px-4 py-2 rounded-lg text-xs border transition-all ${
                range === option.value
                  ? 'bg-white/15 border-white/20 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <i className="fas fa-calendar mr-2"></i>
              {option.label}
            </button>
          ))}
        </div>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 rounded-lg text-xs border border-white/10 text-slate-300 hover:bg-white/10 transition-all"
          >
            로그아웃
          </button>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
