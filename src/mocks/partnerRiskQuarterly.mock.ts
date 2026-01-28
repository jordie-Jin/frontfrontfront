import { PartnerQuarterRisk, RiskLevel } from '../types/risk';

const quarters = [
  '2025Q1',
  '2025Q2',
  '2025Q3',
  '2025Q4',
  '2026Q1',
];

const partnerPatterns: Array<{
  partnerId: string;
  partnerName: string;
  levels: RiskLevel[];
}> = [
  {
    partnerId: 'PT-001',
    partnerName: 'Alpha Logistics',
    levels: ['MIN', 'MIN', 'WARN', 'WARN', 'MIN'],
  },
  {
    partnerId: 'PT-002',
    partnerName: 'Beta Components',
    levels: ['MIN', 'MIN', 'WARN', 'WARN', 'MIN'],
  },
  {
    partnerId: 'PT-003',
    partnerName: 'Gamma Retail',
    levels: ['MIN', 'MIN', 'MIN', 'MIN', 'MIN'],
  },
  {
    partnerId: 'PT-004',
    partnerName: 'Delta Mobility',
    levels: ['RISK', 'RISK', 'WARN', 'WARN', 'MIN'],
  },
  {
    partnerId: 'PT-005',
    partnerName: 'Epsilon Energy',
    levels: ['WARN', 'WARN', 'RISK', 'RISK', 'WARN'],
  },
  {
    partnerId: 'PT-006',
    partnerName: 'Zeta Robotics',
    levels: ['RISK', 'MIN', 'WARN', 'MIN', 'MIN'],
  },
  {
    partnerId: 'PT-007',
    partnerName: 'Eta Finance',
    levels: ['MIN', 'MIN', 'WARN', 'RISK', 'MIN'],
  },
  {
    partnerId: 'PT-008',
    partnerName: 'Theta Healthcare',
    levels: ['WARN', 'MIN', 'WARN', 'MIN', 'MIN'],
  },
  {
    partnerId: 'PT-009',
    partnerName: 'Iota Manufacturing',
    levels: ['WARN', 'WARN', 'RISK', 'WARN', 'MIN'],
  },
  {
    partnerId: 'PT-010',
    partnerName: 'Kappa Media',
    levels: ['MIN', 'RISK', 'WARN', 'WARN', 'MIN'],
  },
];

export const partnerRiskQuarterlyMock: PartnerQuarterRisk[] = partnerPatterns.flatMap(
  (partner) =>
    quarters.map((quarter, index) => ({
      partnerId: partner.partnerId,
      partnerName: partner.partnerName,
      quarter,
      riskLevel: partner.levels[index],
    })),
);
