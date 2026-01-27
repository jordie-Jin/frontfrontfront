import { KpiTooltipContent } from './kpi';

export type PartnerStatus = '정상' | '주의' | '위험';
export type TrafficLight = 'green' | 'yellow' | 'red';

export interface Partner {
  id: string;
  name: string;
  industry: string;
  healthScore: number;
  revenue: number;
  status: PartnerStatus;
}

export interface PartnerTimelineItem {
  date: string;
  title: string;
  tone: 'positive' | 'neutral' | 'risk';
}

export interface PartnerSummary {
  id: string;
  networkHealth: number;
  annualRevenue: number;
  timeline: PartnerTimelineItem[];
}

export interface PartnerMetric {
  label: string;
  value: string;
  description?: string;
  tooltip?: KpiTooltipContent;
}

export interface PartnerDetail {
  partner: Partner;
  forecast: Array<{ month: string; score: number }>;
  metrics: PartnerMetric[];
  trafficSignals: Array<{ label: string; status: TrafficLight; tooltip: KpiTooltipContent }>;
  aiCommentary: string;
  summary: PartnerSummary;
}

export interface UploadResult {
  partner: Partner;
  detail: PartnerDetail;
  message: string;
}
