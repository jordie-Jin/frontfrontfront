import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PartnerQuarterRisk } from '../../types/risk';

interface RiskStatusTrendChartProps {
  records: PartnerQuarterRisk[];
}

const labelMap: Record<string, string> = {
  minRate: '최소',
  warnRate: '주의',
  riskRate: '위험',
};

const parseQuarter = (quarter: string) => {
  const [yearPart, quarterPart] = quarter.split('Q');
  return {
    year: Number(yearPart),
    quarter: Number(quarterPart),
  };
};

const RiskStatusTrendChart: React.FC<RiskStatusTrendChartProps> = ({ records }) => {
  const chartData = useMemo(() => {
    if (records.length === 0) return [];

    const grouped = records.reduce<Record<string, { min: number; warn: number; risk: number; total: number }>>(
      (acc, record) => {
        if (!acc[record.quarter]) {
          acc[record.quarter] = { min: 0, warn: 0, risk: 0, total: 0 };
        }

        const bucket = acc[record.quarter];
        bucket.total += 1;

        if (record.riskLevel === 'MIN') bucket.min += 1;
        if (record.riskLevel === 'WARN') bucket.warn += 1;
        if (record.riskLevel === 'RISK') bucket.risk += 1;

        return acc;
      },
      {},
    );

    return Object.keys(grouped)
      .sort((a, b) => {
        const first = parseQuarter(a);
        const second = parseQuarter(b);
        if (first.year !== second.year) return first.year - second.year;
        return first.quarter - second.quarter;
      })
      .map((quarter) => {
        const { min, warn, risk, total } = grouped[quarter];
        return {
          quarter,
          minRate: total ? (min / total) * 100 : 0,
          warnRate: total ? (warn / total) * 100 : 0,
          riskRate: total ? (risk / total) * 100 : 0,
        };
      });
  }, [records]);

  const hasData = chartData.length > 0;

  return (
    <div className="lg:col-span-2 glass-panel p-8 rounded-2xl">
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-white">리스크 상태 분포 변화</h3>
            <p className="text-xs text-slate-400 mt-1">Risk Status Distribution</p>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-emerald-400/80 rounded-full"></span>
              <span>최소</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-amber-400/80 rounded-full"></span>
              <span>주의</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-rose-500/80 rounded-full"></span>
              <span>위험</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          분기별 파트너 위험 상태 비중 변화를 보여줍니다. ‘주의/위험’ 영역이 확대될수록 포트폴리오
          전반의 리스크가 증가하고 있음을 의미합니다.
        </p>
      </div>
      <div className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="minFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="warnFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb7185" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="quarter" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                stroke="#64748b"
                fontSize={10}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value, name) => [`${Number(value).toFixed(1)}%`, labelMap[String(name)] ?? name]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="minRate"
                stackId="risk"
                stroke="#34d399"
                fillOpacity={1}
                fill="url(#minFill)"
              />
              <Area
                type="monotone"
                dataKey="warnRate"
                stackId="risk"
                stroke="#fbbf24"
                fillOpacity={1}
                fill="url(#warnFill)"
              />
              <Area
                type="monotone"
                dataKey="riskRate"
                stackId="risk"
                stroke="#fb7185"
                fillOpacity={1}
                fill="url(#riskFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
            <div className="text-sm">리스크 상태 데이터가 없습니다.</div>
            <div className="text-xs mt-2">분기 데이터를 확인하거나 나중에 다시 확인하세요.</div>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-6">
        주의·위험 비중이 급증한 분기는 외부 환경 변화나 특정 산업/파트너 그룹의 이상 여부를 함께
        점검하세요.
      </p>
    </div>
  );
};

export default RiskStatusTrendChart;
