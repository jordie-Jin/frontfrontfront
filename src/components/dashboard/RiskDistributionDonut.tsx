import React from 'react';
import { Cell, Pie, PieChart, type PieLabelRenderProps, ResponsiveContainer } from 'recharts';
import { RiskSegment } from '../../types/dashboard';

type RiskKey = 'SAFE' | 'WARN' | 'RISK';

interface RiskDistributionDonutProps {
  segments?: RiskSegment[];
}

const MOCK_DATA: RiskSegment[] = [
  { key: 'SAFE', label: '정상', count: 62, ratio: 0.62 },
  { key: 'WARN', label: '주의', count: 25, ratio: 0.25 },
  { key: 'RISK', label: '위험', count: 13, ratio: 0.13 },
];

const COLORS: Record<RiskKey, string> = {
  RISK: '#ef4444',
  WARN: '#facc15',
  SAFE: '#22c55e',
};

const RADIAN = Math.PI / 180;

const renderLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  outerRadius = 0,
  percent = 0,
  name,
}: PieLabelRenderProps) => {
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const percentage = Number.isFinite(percent) ? Math.round(percent * 100) : 0;
  const labelText = name ? String(name) : '';

  return (
    <text
      x={x}
      y={y}
      fill="#e2e8f0"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs"
    >
      {`${labelText} ${percentage}%`}
    </text>
  );
};

const RiskDistributionDonut: React.FC<RiskDistributionDonutProps> = ({ segments }) => {
  const chartData = segments?.length ? segments : MOCK_DATA;

  return (
    <div className="h-[260px] w-full risk-donut-animate">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="ratio"
            nameKey="label"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={4}
            stroke="rgba(248, 250, 252, 0.9)"
            strokeWidth={2}
            isAnimationActive
            animationBegin={150}
            animationDuration={900}
            animationEasing="ease-out"
            labelLine={false}
            label={renderLabel}
          >
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key as RiskKey]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskDistributionDonut;
