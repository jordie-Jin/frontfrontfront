# Dashboard API Summary

This document describes the API endpoints used by the dashboard and the required response fields.

---

## 1) Dashboard Summary

**Endpoint**
- `GET /api/dashboard/summary`

**Response Fields (DashboardSummary)**
```ts
type DashboardSummary = {
  range?: string;
  kpis: KpiCardDto[];
  latestActualQuarter: string;
  forecastQuarter: string;
  windowQuarters: string[];
  riskStatusDistribution: {
    NORMAL: number;
    CAUTION: number;
    RISK: number;
  };
  riskStatusDistributionTrend: RiskStatusBucket[];
}
```

**Field Descriptions**
- `range`: Optional label for the time window (e.g., "최근 4분기")
- `kpis`: KPI cards for the top summary section
- `latestActualQuarter`: Most recent actual quarter (e.g., `2025Q3`)
- `forecastQuarter`: Forecast quarter (e.g., `2025Q4`)
- `windowQuarters`: Ordered 5-quarter window for trend charts
- `riskStatusDistribution`: Current distribution counts by risk status
- `riskStatusDistributionTrend`: Trend buckets used for the distribution change chart

---

## 2) Risk Records (for Dwell Time)

**Endpoint**
- `GET /api/dashboard/risk-records`

**Response Fields (CompanyQuarterRisk[])**
```ts
type CompanyQuarterRisk = {
  companyId: string;
  companyName: string;
  quarter: string; // e.g., "2025Q1"
  riskLevel: 'MIN' | 'WARN' | 'RISK';
}
```

**Field Descriptions**
- `companyId`: Company unique identifier
- `companyName`: Company display name
- `quarter`: Quarter label in `YYYYQn` format
- `riskLevel`: Risk status for the quarter (`MIN`, `WARN`, `RISK`)

---

## 3) KPI Card Structure (DashboardSummary.kpis)

**Response Fields (KpiCardDto)**
```ts
type KpiCardDto = {
  key: string;
  title: string;
  value: string | number | null;
  unit?: string | null;
  tone?: 'DEFAULT' | 'GOOD' | 'WARN' | 'RISK';
  delta?: {
    value: number;
    unit?: string | null;
    direction: 'UP' | 'DOWN' | 'FLAT';
    label?: string | null;
  } | null;
  badge?: {
    label: string;
    subLabel?: string | null;
  } | null;
  tooltip?: {
    description: string;
    interpretation?: string | null;
    actionHint?: string | null;
  } | null;
}
```

**Field Descriptions**
- `key`: KPI identifier (e.g., `ACTIVE_COMPANIES`)
- `title`: Display title
- `value`: Numeric or string value
- `unit`: Optional unit label
- `tone`: Visual tone used for card styling
- `delta`: Change indicator (value + direction)
- `badge`: Optional badge label(s)
- `tooltip`: Help text for the KPI
