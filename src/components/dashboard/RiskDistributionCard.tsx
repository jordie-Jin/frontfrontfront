import React, { useMemo } from 'react';
import { RiskDistribution } from '../../types/dashboard';
import RiskDistributionDonut from './RiskDistributionDonut';

interface RiskDistributionCardProps {
  distribution: RiskDistribution;
}

const avgRiskLabelMap: Record<string, string> = {
  LOW: '낮음',
  MID: '보통',
  HIGH: '높음',
};

const RiskDistributionCard: React.FC<RiskDistributionCardProps> = ({ distribution }) => {
  const avgRiskLabel = useMemo(() => {
    const level = distribution.summary?.avgRiskLevel;
    if (typeof level === 'number') {
      return `${level.toFixed(1)}점`;
    }
    return level ? avgRiskLabelMap[level] ?? level : '—';
  }, [distribution.summary?.avgRiskLevel]);

  return (
    <div className="glass-panel p-8 rounded-2xl flex flex-col items-center">
      <h3 className="text-lg font-medium text-white self-start mb-8">위험 분포</h3>
      <RiskDistributionDonut segments={distribution.segments} />
      <div className="mt-4 grid grid-cols-2 gap-4 w-full">
        <div className="p-3 bg-white/5 rounded-xl text-center">
          <div className="text-xs text-slate-500 mb-1">평균 위험도</div>
          <div className="text-xl font-light text-white">{avgRiskLabel}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl text-center">
          <div className="text-xs text-slate-500 mb-1">주요 섹터</div>
          <div className="text-xl font-light text-white">
            {distribution.summary?.topSector?.label ?? '—'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDistributionCard;
