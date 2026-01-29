import React, { useMemo } from 'react';
import RiskStatusTrendChart from './RiskStatusTrendChart';
import { makeMockRiskStatusTrend } from './mock';
import { normalizeRiskStatusTrend } from './normalize';
import { RiskStatusTrendPayload } from './types';

const USE_API = false;

const fetchDashboardSummaryAndMap = (): RiskStatusTrendPayload => {
  // TODO: SENTINEL_PoC_API.yaml의 /dashboard/summary 응답을 RiskStatusTrendPayload로 매핑
  throw new Error('TODO: map /dashboard/summary response to RiskStatusTrendPayload');
};

const RiskStatusTrendCard: React.FC = () => {
  const payload = useMemo(
    () => (USE_API ? fetchDashboardSummaryAndMap() : makeMockRiskStatusTrend('2025Q3')),
    [],
  );
  const normalizedPayload = useMemo(() => normalizeRiskStatusTrend(payload), [payload]);
  const latestActualQuarter =
    normalizedPayload.windowQuarters[normalizedPayload.windowQuarters.length - 2];

  useMemo(() => {
    console.table({
      latestActualQuarter,
      forecastQuarter: normalizedPayload.forecastQuarter,
      windowQuartersLen: normalizedPayload.windowQuarters.length,
      trendLen: normalizedPayload.trend.length,
      quartersInTrend: normalizedPayload.trend.map((bucket) => bucket.quarter).join(','),
    });
  }, [latestActualQuarter, normalizedPayload]);

  return (
    <div className="lg:col-span-2 glass-panel p-8 rounded-2xl">
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-white">리스크 상태 분포 변화</h3>
            <p className="text-xs text-slate-400 mt-1">Risk Status Distribution</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-emerald-400/80 rounded-full"></span>
              <span>정상</span>
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
              <span>예측</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          분기별 협력사 위험 상태 비중 변화를 보여줍니다. 마지막 분기는 예측 구간이며, 점선과 음영으로
          구분됩니다.
        </p>
      </div>
      <div className="h-64">
        <RiskStatusTrendChart payload={normalizedPayload} />
      </div>
      <p className="text-xs text-slate-500 mt-6">
        주의·위험 비중이 급증한 분기는 외부 환경 변화나 특정 산업/협력사 그룹의 이상 여부를 함께
        점검하세요.
      </p>
    </div>
  );
};

export default RiskStatusTrendCard;
