// 리스크 데이터 구조 타입 정의입니다.
export type RiskLevel = 'MIN' | 'WARN' | 'RISK';

export interface CompanyQuarterRisk {
  companyId: string;
  companyName: string;
  quarter: string; // '2025Q1' 형식
  riskLevel: RiskLevel;
}
