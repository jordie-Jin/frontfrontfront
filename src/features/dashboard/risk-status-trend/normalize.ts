import { RiskStatusBucket, RiskStatusTrendPayload } from './types';

const buildEmptyBucket = (quarter: string, dataType: RiskStatusBucket['dataType']): RiskStatusBucket => ({
  quarter,
  dataType,
  NORMAL: 0,
  CAUTION: 0,
  RISK: 0,
});

export const normalizeRiskStatusTrend = (
  payload: RiskStatusTrendPayload,
): RiskStatusTrendPayload => {
  const windowQuarters = payload.windowQuarters;
  const trendMap = new Map<string, RiskStatusBucket>();
  const duplicateBuckets = new Map<string, RiskStatusBucket[]>();

  payload.trend.forEach((bucket) => {
    const existing = trendMap.get(bucket.quarter);
    if (existing) {
      const buckets = duplicateBuckets.get(bucket.quarter) ?? [existing];
      buckets.push(bucket);
      duplicateBuckets.set(bucket.quarter, buckets);
      return;
    }
    trendMap.set(bucket.quarter, bucket);
  });

  duplicateBuckets.forEach((buckets, quarter) => {
    console.warn('duplicate quarter', quarter, buckets);
  });

  const normalizedTrend = windowQuarters.map((quarter) => {
    const entry = trendMap.get(quarter);
    if (entry) return entry;

    const dataType = quarter === payload.forecastQuarter ? 'FORECAST' : 'ACTUAL';
    return buildEmptyBucket(quarter, dataType);
  });

  let finalTrend = normalizedTrend;
  if (finalTrend.length !== windowQuarters.length) {
    console.error('[RiskStatusTrend] Trend length mismatch.', {
      windowQuartersLen: windowQuarters.length,
      trendLen: finalTrend.length,
    });
    finalTrend = windowQuarters.map((quarter) => {
      const entry = trendMap.get(quarter);
      if (entry) return entry;
      const dataType = quarter === payload.forecastQuarter ? 'FORECAST' : 'ACTUAL';
      return buildEmptyBucket(quarter, dataType);
    });
  }

  return {
    ...payload,
    windowQuarters,
    trend: finalTrend,
  };
};
