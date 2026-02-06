import React, { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ForecastResponse, MetricSeries } from '../../types/company';
import AiCommentaryCard from './AiCommentaryCard';

interface MetricForecastChartPanelProps {
  metricForecast: ForecastResponse;
  commentary: string;
}

const parseQuarter = (quarter: string) => {
  const [yearPart, quarterPart] = quarter.split('Q');
  return {
    year: Number(yearPart),
    quarter: Number(quarterPart),
  };
};

const shiftQuarter = (quarter: string, delta: number) => {
  const parsed = parseQuarter(quarter);
  const total = parsed.year * 4 + (parsed.quarter - 1) + delta;
  const year = Math.floor(total / 4);
  const quarterIndex = total % 4;
  return `${year}Q${quarterIndex + 1}`;
};

const MetricForecastChartPanel: React.FC<MetricForecastChartPanelProps> = ({
  metricForecast,
  commentary,
}) => {
  const { latestActualQuarter, nextQuarter, metricSeries } = metricForecast;
  const [selectedMetricKey, setSelectedMetricKey] = useState<string>(
    metricSeries[0]?.key ?? '',
  );

  useEffect(() => {
    if (!metricSeries.length) {
      setSelectedMetricKey('');
      return;
    }
    if (!metricSeries.some((series) => series.key === selectedMetricKey)) {
      setSelectedMetricKey(metricSeries[0].key);
    }
  }, [metricSeries, selectedMetricKey]);

  const selectedMetric = useMemo<MetricSeries | undefined>(
    () => metricSeries.find((series) => series.key === selectedMetricKey) ?? metricSeries[0],
    [metricSeries, selectedMetricKey],
  );

  const quarterLabels = useMemo(() => {
    if (!latestActualQuarter) return [];
    return [
      shiftQuarter(latestActualQuarter, -3),
      shiftQuarter(latestActualQuarter, -2),
      shiftQuarter(latestActualQuarter, -1),
      latestActualQuarter,
      nextQuarter,
    ];
  }, [latestActualQuarter, nextQuarter]);

  const quarterlyMetricTrend = useMemo(() => {
    if (!selectedMetric) return [];
    const pointMap = new Map(selectedMetric.points.map((point) => [point.quarter, point]));
    return quarterLabels.map((quarter) => {
      const point = pointMap.get(quarter);
      const value = point?.value ?? 0;
      const isForecast = quarter === nextQuarter;
      return {
        quarter,
        value,
        actualValue: isForecast ? null : value,
        forecastValue: quarter === latestActualQuarter || isForecast ? value : null,
        isForecast,
      };
    });
  }, [quarterLabels, latestActualQuarter, nextQuarter, selectedMetric]);

  const indicatorPrediction = selectedMetric?.label ?? '지표';
  const forecastLabel = nextQuarter ? `${nextQuarter}(예측)` : '예측';

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_40px_rgba(59,130,246,0.12)] flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg text-white">지표 예측 그래프</h3>
          <p className="text-xs text-slate-500">
            리스크 상태 분포와 재무/리스크 지표의 변화를 예측·감시합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{forecastLabel}</span>
          <select
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200"
            value={selectedMetricKey}
            onChange={(event) => setSelectedMetricKey(event.target.value)}
          >
            {metricSeries.map((series) => (
              <option key={series.key} value={series.key} className="bg-slate-900">
                {series.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="h-[220px] min-h-[220px] sm:h-[240px] sm:min-h-[240px] lg:h-[260px] lg:min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={quarterlyMetricTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis
              dataKey="quarter"
              stroke="#64748b"
              axisLine={false}
              tickLine={false}
              fontSize={11}
              tickFormatter={(value: string) =>
                value === nextQuarter ? `${value}(예측)` : value
              }
            />
            <YAxis stroke="#64748b" axisLine={false} tickLine={false} fontSize={11} />
            <Tooltip
              formatter={(value) =>
                selectedMetric?.unit ? `${Number(value).toFixed(1)}${selectedMetric.unit}` : value
              }
              labelFormatter={(label) =>
                label === nextQuarter ? `${label}(예측)` : label
              }
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
              cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }}
            />
            {nextQuarter && (
              <ReferenceArea
                x1={nextQuarter}
                x2={nextQuarter}
                ifOverflow="extendDomain"
                fill="#94a3b8"
                fillOpacity={0.08}
              />
            )}
            <Line
              type="monotone"
              dataKey="actualValue"
              stroke="#93c5fd"
              strokeWidth={2}
              dot={{ r: 3, fill: '#93c5fd' }}
              name={indicatorPrediction}
            />
            <Line
              type="monotone"
              dataKey="forecastValue"
              stroke="#93c5fd"
              strokeDasharray="4 4"
              strokeWidth={2}
              connectNulls
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload?.isForecast) {
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      stroke="#93c5fd"
                      strokeWidth={2}
                      fill="#0f172a"
                    />
                  );
                }
                return null;
              }}
              name={`${indicatorPrediction} (예측)`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <AiCommentaryCard
        commentary={commentary}
        variant="embedded"
      />
    </div>
  );
};

export default MetricForecastChartPanel;
