import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

type RiskKey = '위험' | '주의' | '정상';
type RiskSlice = { name: RiskKey; value: number };

interface RiskDistributionDonutProps {
  data?: RiskSlice[];
}

const MOCK_DATA: RiskSlice[] = [
  { name: '정상', value: 62 },
  { name: '주의', value: 25 },
  { name: '위험', value: 13 },
];

const COLORS: Record<RiskKey, string> = {
  위험: '#ef4444',
  주의: '#facc15',
  정상: '#22c55e',
};

const RADIAN = Math.PI / 180;

const renderLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
  name: RiskKey;
}) => {
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const percentage = Number.isFinite(percent) ? Math.round(percent * 100) : 0;

  return (
    <text
      x={x}
      y={y}
      fill="#e2e8f0"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs"
    >
      {`${name} ${percentage}%`}
    </text>
  );
};

const RiskDistributionDonut: React.FC<RiskDistributionDonutProps> = ({ data }) => {
  const chartData = data?.length ? data : MOCK_DATA;

  return (
    <div className="h-[260px] w-full risk-donut-animate">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
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
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskDistributionDonut;
