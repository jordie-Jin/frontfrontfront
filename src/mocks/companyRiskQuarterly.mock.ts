// 분기별 협력사 리스크 트렌드 목 데이터입니다.
import { CompanyQuarterRisk, RiskLevel } from '../types/risk';

const companyPatterns: Array<{
  companyId: string;
  companyName: string;
  levels: RiskLevel[];
}> = [
  {
    companyId: 'PT-001',
    companyName: 'Alpha Logistics',
    levels: ['MIN', 'MIN', 'WARN', 'MIN'],
  },
  {
    companyId: 'PT-002',
    companyName: 'Beta Components',
    levels: ['WARN', 'WARN', 'RISK', 'WARN'],
  },
  {
    companyId: 'PT-003',
    companyName: 'Gamma Retail',
    levels: ['MIN', 'MIN', 'MIN', 'MIN'],
  },
  {
    companyId: 'PT-004',
    companyName: 'Delta Mobility',
    levels: ['WARN', 'MIN', 'MIN', 'WARN'],
  },
  {
    companyId: 'PT-005',
    companyName: 'Epsilon Energy',
    levels: ['RISK', 'WARN', 'WARN', 'MIN'],
  },
  {
    companyId: 'PT-006',
    companyName: 'Zeta Robotics',
    levels: ['MIN', 'MIN', 'WARN', 'WARN'],
  },
  {
    companyId: 'PT-007',
    companyName: 'Eta Finance',
    levels: ['WARN', 'RISK', 'RISK', 'WARN'],
  },
  {
    companyId: 'PT-008',
    companyName: 'Theta Healthcare',
    levels: ['MIN', 'WARN', 'WARN', 'MIN'],
  },
  {
    companyId: 'PT-009',
    companyName: 'Iota Manufacturing',
    levels: ['MIN', 'MIN', 'MIN', 'WARN'],
  },
  {
    companyId: 'PT-010',
    companyName: 'Kappa Media',
    levels: ['WARN', 'WARN', 'WARN', 'RISK'],
  },
];

const quarters = ['2024Q4', '2025Q1', '2025Q2', '2025Q3'];

export const companyRiskQuarterlyMock: CompanyQuarterRisk[] = companyPatterns.flatMap((company) =>
  quarters.map((quarter, index) => ({
    companyId: company.companyId,
    companyName: company.companyName,
    quarter,
    riskLevel: company.levels[index],
  })),
);
