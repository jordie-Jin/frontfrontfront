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

interface ForecastChartPanelProps {
  data: Array<{ month: string; score: number }>;
}

const ForecastChartPanel: React.FC<ForecastChartPanelProps> = ({ data }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_40px_rgba(59,130,246,0.12)]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg text-white">예측 지표 그래프</h3>
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">최근 6개월</span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="partnerScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="month" stroke="#64748b" axisLine={false} tickLine={false} fontSize={11} />
            <YAxis stroke="#64748b" axisLine={false} tickLine={false} domain={[0, 100]} fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
              cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }}
            />
            <Area type="monotone" dataKey="score" stroke="#93c5fd" fill="url(#partnerScore)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastChartPanel;
