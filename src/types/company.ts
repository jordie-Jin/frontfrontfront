export type CompanySearchItem = {
  companyId: string;
  name: string;
  code: string;
  industry: string;
  region: string;
};

export type CompanySearchResponse = {
  items: CompanySearchItem[];
  total: number;
};

export type CompanyDetail = {
  companyId: string;
  name: string;
  code: string;
  industry: string;
  region: string;
  foundedYear: number;
  employeeCount: number;
  revenueBillionKrw: number;
  riskLevel: 'low' | 'medium' | 'high';
  overview: string;
  highlights: string[];
};
