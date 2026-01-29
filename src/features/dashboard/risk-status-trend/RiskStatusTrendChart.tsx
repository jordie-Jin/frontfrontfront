import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RiskStatusTrendPayload } from './types';

interface RiskStatusTrendChartProps {
  payload: RiskStatusTrendPayload;
}

const labelMap: Record<string, string> = {
  NORMAL: '정상',
  CAUTION: '주의',
  RISK: '위험',
};
const tooltipKeys = new Set(['NORMAL', 'CAUTION', 'RISK']);

const toPercentSeries = (payload: RiskStatusTrendPayload) =>
  payload.trend.map((bucket) => {
    const total = bucket.NORMAL + bucket.CAUTION + bucket.RISK;
    if (payload.unit === 'COUNT' && total > 0) {
      const factor = 100 / total;
      return {
        quarter: bucket.quarter,
        dataType: bucket.dataType,
        NORMAL: bucket.NORMAL * factor,
        CAUTION: bucket.CAUTION * factor,
        RISK: bucket.RISK * factor,
      };
    }

    return {
      quarter: bucket.quarter,
      dataType: bucket.dataType,
      NORMAL: bucket.NORMAL,
      CAUTION: bucket.CAUTION,
      RISK: bucket.RISK,
    };
  });

const RiskStatusTrendChart: React.FC<RiskStatusTrendChartProps> = ({ payload }) => {
  const riskStatusOverTime = useMemo(() => toPercentSeries(payload), [payload]);
  const forecastQuarter = payload.forecastQuarter;
  const lastActualQuarter = payload.windowQuarters[payload.windowQuarters.length - 2];

  const boundarySeries = useMemo(
    () =>
      riskStatusOverTime.map((item) => ({
        quarter: item.quarter,
        normalBoundary: item.NORMAL,
        cautionBoundary: item.NORMAL + item.CAUTION,
        riskBoundary: item.NORMAL + item.CAUTION + item.RISK,
      })),
    [riskStatusOverTime],
  );
  const actualBoundarySeries = boundarySeries.slice(0, -1);
  const forecastBoundarySegment = boundarySeries.length > 1 ? boundarySeries.slice(-2) : [];

  if (riskStatusOverTime.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
        <div className="text-sm">리스크 상태 데이터가 없습니다.</div>
        <div className="text-xs mt-2">분기 데이터를 확인하거나 나중에 다시 확인하세요.</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={riskStatusOverTime}>
        <defs>
          <linearGradient id="risk-status-normal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0.08} />
          </linearGradient>
          <linearGradient id="risk-status-caution" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.08} />
          </linearGradient>
          <linearGradient id="risk-status-risk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fb7185" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#fb7185" stopOpacity={0.08} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" vertical={false} />
        <XAxis
          dataKey="quarter"
          type="category"
          allowDuplicatedCategory={false}
          ticks={payload.windowQuarters}
          interval={0}
          stroke="#64748b"
          fontSize={10}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: string) => (value === forecastQuarter ? `${value}(예측)` : value)}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          stroke="#64748b"
          fontSize={10}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) {
              return null;
            }

            const filtered = payload.filter(
              (entry, index, items) =>
                tooltipKeys.has(String(entry.dataKey)) &&
                items.findIndex((item) => item.dataKey === entry.dataKey) === index,
            );
            if (filtered.length === 0) {
              return null;
            }

            const quarter = String(filtered[0]?.payload?.quarter ?? '');

            return (
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  padding: '8px 10px',
                }}
              >
                {filtered.map((entry) => {
                  const label = labelMap[String(entry.dataKey)] ?? String(entry.dataKey);
                  return (
                    <div key={String(entry.dataKey)} className="flex items-center justify-between gap-3">
                      <span className="text-slate-200">{`${label} · ${quarter}`}</span>
                      <span className="text-slate-100 font-medium">{`${Number(entry.value).toFixed(1)}%`}</span>
                    </div>
                  );
                })}
              </div>
            );
          }}
        />
        {lastActualQuarter && forecastQuarter && (
          <ReferenceArea
            x1={lastActualQuarter}
            x2={forecastQuarter}
            fill="#94a3b8"
            fillOpacity={0.12}
            strokeOpacity={0}
          />
        )}
        <Area type="monotone" dataKey="NORMAL" stackId="risk" stroke="#34d399" fill="url(#risk-status-normal)" />
        <Area type="monotone" dataKey="CAUTION" stackId="risk" stroke="#fbbf24" fill="url(#risk-status-caution)" />
        <Area type="monotone" dataKey="RISK" stackId="risk" stroke="#fb7185" fill="url(#risk-status-risk)" />
        {actualBoundarySeries.length > 0 && (
          <>
            <Line
              type="monotone"
              data={actualBoundarySeries}
              dataKey="normalBoundary"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              legendType="none"
            />
            <Line
              type="monotone"
              data={actualBoundarySeries}
              dataKey="cautionBoundary"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              legendType="none"
            />
            <Line
              type="monotone"
              data={actualBoundarySeries}
              dataKey="riskBoundary"
              stroke="#fb7185"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              legendType="none"
            />
          </>
        )}
        {forecastBoundarySegment.length > 0 && (
          <>
            <Line
              type="monotone"
              data={forecastBoundarySegment}
              dataKey="normalBoundary"
              stroke="#34d399"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={false}
              activeDot={false}
              legendType="none"
            />
            <Line
              type="monotone"
              data={forecastBoundarySegment}
              dataKey="cautionBoundary"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={false}
              activeDot={false}
              legendType="none"
            />
            <Line
              type="monotone"
              data={forecastBoundarySegment}
              dataKey="riskBoundary"
              stroke="#fb7185"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={false}
              activeDot={false}
              legendType="none"
            />
          </>
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default RiskStatusTrendChart;
