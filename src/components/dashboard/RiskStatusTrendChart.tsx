import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CompanyQuarterRisk } from '../../types/risk';

interface RiskStatusTrendChartProps {
  records: CompanyQuarterRisk[];
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

const formatQuarterLabel = (quarter: string, isForecast: boolean) =>
  `${quarter}${isForecast ? '(예측)' : ''}`;

const shiftQuarter = (quarter: string, delta: number) => {
  const parsed = parseQuarter(quarter);
  const total = parsed.year * 4 + (parsed.quarter - 1) + delta;
  const year = Math.floor(total / 4);
  const quarterIndex = total % 4;
  return `${year}Q${quarterIndex + 1}`;
};

const RiskStatusTrendChart: React.FC<RiskStatusTrendChartProps> = ({ records }) => {
  const riskStatusDistributionTrend = useMemo(() => {
    if (records.length === 0) return [];

    const sortedQuarters = Array.from(new Set(records.map((record) => record.quarter))).sort(
      (a, b) => {
        const first = parseQuarter(a);
        const second = parseQuarter(b);
        if (first.year !== second.year) return first.year - second.year;
        return first.quarter - second.quarter;
      },
    );
    const latestActualQuarter = sortedQuarters[sortedQuarters.length - 1];
    const nextQuarter = shiftQuarter(latestActualQuarter, 1);
    const quarterLabels = [
      shiftQuarter(latestActualQuarter, -3),
      shiftQuarter(latestActualQuarter, -2),
      shiftQuarter(latestActualQuarter, -1),
      latestActualQuarter,
      nextQuarter,
    ];

    const visibleQuarters = new Set(quarterLabels);

    const grouped = records.reduce<Record<string, { min: number; warn: number; risk: number; total: number }>>(
      (acc, record) => {
        if (!visibleQuarters.has(record.quarter)) {
          return acc;
        }
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

    const latestActualBucket = grouped[latestActualQuarter] ?? { min: 0, warn: 0, risk: 0, total: 0 };
    const latestActualRates = {
      minRate: latestActualBucket.total ? (latestActualBucket.min / latestActualBucket.total) * 100 : 0,
      warnRate: latestActualBucket.total ? (latestActualBucket.warn / latestActualBucket.total) * 100 : 0,
      riskRate: latestActualBucket.total ? (latestActualBucket.risk / latestActualBucket.total) * 100 : 0,
    };

    return quarterLabels.map((quarter) => {
      if (quarter === nextQuarter) {
        return {
          quarter,
          ...latestActualRates,
          isForecast: true,
          dataType: 'FORECAST',
          latestActualQuarter,
          nextQuarter,
        };
      }

      const { min, warn, risk, total } = grouped[quarter] ?? { min: 0, warn: 0, risk: 0, total: 0 };
      return {
        quarter,
        minRate: total ? (min / total) * 100 : 0,
        warnRate: total ? (warn / total) * 100 : 0,
        riskRate: total ? (risk / total) * 100 : 0,
        isForecast: false,
        dataType: 'ACTUAL',
        latestActualQuarter,
        nextQuarter,
      };
    });
  }, [records]);

  const riskStatusOverTime = riskStatusDistributionTrend;
  const forecastIndex = riskStatusDistributionTrend.findIndex((item) => item.dataType === 'FORECAST');
  const forecastQuarter = forecastIndex >= 0 ? riskStatusDistributionTrend[forecastIndex]?.quarter ?? '' : '';
  const forecastStartQuarter =
    forecastIndex > 0 ? riskStatusDistributionTrend[forecastIndex - 1]?.quarter ?? '' : '';
  const boundarySeries = riskStatusDistributionTrend.map((item) => ({
    quarter: item.quarter,
    minBoundary: item.minRate,
    warnBoundary: item.minRate + item.warnRate,
    riskBoundary: item.minRate + item.warnRate + item.riskRate,
  }));
  const actualBoundarySeries = forecastIndex > 0 ? boundarySeries.slice(0, forecastIndex) : boundarySeries;
  const forecastBoundarySegment =
    forecastIndex > 0 ? boundarySeries.slice(forecastIndex - 1, forecastIndex + 1) : [];
  const hasData = riskStatusDistributionTrend.length > 0;

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
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full border border-slate-400/60"></span>
              <span>{forecastQuarter ? `${forecastQuarter}(예측)` : '예측'}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          분기별 협력사 위험 상태 비중 변화를 보여줍니다. ‘주의/위험’ 영역이 확대될수록 포트폴리오
          전반의 리스크가 증가하고 있음을 의미합니다. 마지막 분기는 예측 구간입니다.
        </p>
      </div>
      <div className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riskStatusOverTime}>
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
              <XAxis
                dataKey="quarter"
                stroke="#64748b"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: string) => formatQuarterLabel(value, value === forecastQuarter)}
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
                formatter={(value, name, payload) => {
                  const isForecast = payload?.payload?.dataType === 'FORECAST';
                  const quarterLabel = formatQuarterLabel(payload?.payload?.quarter ?? '', isForecast);
                  return [`${Number(value).toFixed(1)}%`, `${labelMap[String(name)] ?? name} · ${quarterLabel}`];
                }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              {forecastQuarter && forecastStartQuarter && (
                <ReferenceArea
                  x1={forecastStartQuarter}
                  x2={forecastQuarter}
                  fill="#94a3b8"
                  fillOpacity={0.08}
                  strokeOpacity={0}
                  label={{ value: '예측', position: 'insideTopRight', fill: '#94a3b8', fontSize: 10 }}
                />
              )}
              {forecastQuarter && (
                <ReferenceLine x={forecastQuarter} stroke="#94a3b8" strokeDasharray="4 4" />
              )}
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
              <Line
                type="monotone"
                data={actualBoundarySeries}
                dataKey="minBoundary"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
                activeDot={false}
              />
              <Line
                type="monotone"
                data={actualBoundarySeries}
                dataKey="warnBoundary"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
                activeDot={false}
              />
              <Line
                type="monotone"
                data={actualBoundarySeries}
                dataKey="riskBoundary"
                stroke="#fb7185"
                strokeWidth={2}
                dot={false}
                activeDot={false}
              />
              {forecastBoundarySegment.length > 0 && (
                <>
                  <Line
                    type="monotone"
                    data={forecastBoundarySegment}
                    dataKey="minBoundary"
                    stroke="#34d399"
                    strokeWidth={2}
                    strokeDasharray="6 6"
                    dot={false}
                    activeDot={false}
                  />
                  <Line
                    type="monotone"
                    data={forecastBoundarySegment}
                    dataKey="warnBoundary"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    strokeDasharray="6 6"
                    dot={false}
                    activeDot={false}
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
                  />
                </>
              )}
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
        주의·위험 비중이 급증한 분기는 외부 환경 변화나 특정 산업/협력사 그룹의 이상 여부를 함께
        점검하세요. 우리는 기업 성과를 예측하는 서비스가 아니라, 리스크 상태 분포와 재무/리스크 지표의
        변화를 예측·감시하는 서비스입니다.
      </p>
    </div>
  );
};

export default RiskStatusTrendChart;
