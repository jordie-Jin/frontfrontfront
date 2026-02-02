// KPI 포맷팅 및 계산 유틸리티입니다.
import { CompanyQuarterRisk, RiskLevel } from '../types/risk';

const sortByQuarter = (a: CompanyQuarterRisk, b: CompanyQuarterRisk): number =>
  a.quarter.localeCompare(b.quarter);

const uniqueSortedQuarters = (records: CompanyQuarterRisk[]): string[] => {
  const quarters = new Set(records.map((record) => record.quarter));
  return Array.from(quarters).sort();
};

const computeRiskRunLengths = (records: CompanyQuarterRisk[]): number[] => {
  const runLengths: number[] = [];
  let currentRun = 0;

  records.forEach((record) => {
    if (record.riskLevel === 'WARN' || record.riskLevel === 'RISK') {
      currentRun += 1;
    } else if (currentRun > 0) {
      runLengths.push(currentRun);
      currentRun = 0;
    }
  });

  if (currentRun > 0) {
    runLengths.push(currentRun);
  }

  return runLengths;
};

export const computeDwellRunsByCompany = (records: CompanyQuarterRisk[]): number[] => {
  const recordsByCompany = records.reduce<Record<string, CompanyQuarterRisk[]>>((acc, record) => {
    if (!acc[record.companyId]) {
      acc[record.companyId] = [];
    }
    acc[record.companyId].push(record);
    return acc;
  }, {});

  const runLengths: number[] = [];
  Object.values(recordsByCompany).forEach((companyRecords) => {
    const sortedRecords = [...companyRecords].sort(sortByQuarter);
    runLengths.push(...computeRiskRunLengths(sortedRecords));
  });

  return runLengths;
};

export const getRecentQuarterWindows = (
  records: CompanyQuarterRisk[],
  windowSize = 4,
): { currentWindow: string[]; previousWindow: string[] } => {
  const quarters = uniqueSortedQuarters(records);
  const currentWindow = quarters.slice(-windowSize);
  const previousWindow = quarters.slice(-(windowSize * 2), -windowSize);

  return { currentWindow, previousWindow };
};

const average = (values: number[]): number | null => {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
};

const filterRecordsByQuarters = (records: CompanyQuarterRisk[], window: string[]) =>
  records.filter((record) => window.includes(record.quarter));

export const computeDwellTimeDelta = (
  records: CompanyQuarterRisk[],
  currentWindow: string[],
  previousWindow: string[],
): { value: number | null; delta: number | null } => {
  if (records.length === 0) return { value: null, delta: null };

  const currentRecords = filterRecordsByQuarters(records, currentWindow);
  const previousRecords = filterRecordsByQuarters(records, previousWindow);

  const currentRuns = computeDwellRunsByCompany(currentRecords);
  const previousRuns = computeDwellRunsByCompany(previousRecords);

  const currentAverage = average(currentRuns);
  const previousAverage = average(previousRuns);

  if (currentAverage === null || previousAverage === null) {
    return { value: currentAverage, delta: null };
  }

  return {
    value: currentAverage,
    delta: currentAverage - previousAverage,
  };
};

export const getRiskLevelSummary = (records: CompanyQuarterRisk[]): Record<RiskLevel, number> => {
  return records.reduce<Record<RiskLevel, number>>(
    (acc, record) => {
      acc[record.riskLevel] += 1;
      return acc;
    },
    { MIN: 0, WARN: 0, RISK: 0 },
  );
};
