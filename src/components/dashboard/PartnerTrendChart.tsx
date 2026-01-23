import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendPoint } from '../../types/dashboard';

interface PartnerTrendChartProps {
  trend: TrendPoint[];
  metricLabel: string;
}

const PartnerTrendChart: React.FC<PartnerTrendChartProps> = ({ trend, metricLabel }) => {
  const hasData = trend.length > 0;

  return (
    <div className="lg:col-span-2 glass-panel p-8 rounded-2xl">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-medium text-white">파트너 성과 추이</h3>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
          <span className="text-xs text-slate-400">{metricLabel}</span>
        </div>
      </div>
      <div className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="period" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="score" stroke="#94a3b8" fillOpacity={1} fill="url(#trendFill)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
            <div className="text-sm">최근 성과 데이터가 없습니다.</div>
            <div className="text-xs mt-2">기간을 변경하거나 나중에 다시 확인하세요.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerTrendChart;
