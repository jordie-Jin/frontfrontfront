import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { RiskDistribution } from '../../types/dashboard';

const COLORS = ['#334155', '#475569', '#64748b', '#94a3b8'];

interface RiskDistributionCardProps {
  distribution: RiskDistribution;
}

const RiskDistributionCard: React.FC<RiskDistributionCardProps> = ({ distribution }) => {
  const hasData = distribution.segments.length > 0;

  return (
    <div className="glass-panel p-8 rounded-2xl flex flex-col items-center">
      <h3 className="text-lg font-medium text-white self-start mb-8">위험 분포</h3>
      <div className="h-64 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution.segments}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="valuePct"
                nameKey="label"
              >
                {distribution.segments.map((entry, index) => (
                  <Cell key={`cell-${entry.label}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
            <div className="text-sm">분포 데이터를 불러올 수 없습니다.</div>
            <div className="text-xs mt-2">새로운 데이터를 기다리는 중입니다.</div>
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 w-full">
        <div className="p-3 bg-white/5 rounded-xl text-center">
          <div className="text-xs text-slate-500 mb-1">평균 위험도</div>
          <div className="text-xl font-light text-white">{distribution.avgRiskLabel}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl text-center">
          <div className="text-xs text-slate-500 mb-1">주요 섹터</div>
          <div className="text-xl font-light text-white">{distribution.topSector}</div>
        </div>
      </div>
    </div>
  );
};

export default RiskDistributionCard;
