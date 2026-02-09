# Dashboard API Summary

This document describes the API endpoints used by the dashboard and the required response fields.

대시보드에서 사용하는 API 엔드포인트와 응답 필드 요구사항을 한국어로 보완합니다.

## 대시보드 동작 흐름 (요약)
1. 화면 진입 시 `GET /api/dashboard/summary`를 호출합니다.
2. 응답의 `kpis`로 상단 KPI 카드를 구성합니다.
3. `riskStatusDistribution`으로 현재 분포 도넛/카운트를 렌더링합니다.
4. `riskStatusDistributionTrend`와 `windowQuarters`로 분기별 추이를 시각화합니다.
5. 체류기간/추가 분석이 필요한 경우 `GET /api/dashboard/risk-records`를 호출합니다.

## 데이터 규모와 집계 전략 (프로젝트 기준)
- 현재 협력사 데이터는 시연용 약 5개 수준으로 가정합니다.
- 이 규모에서는 별도 집계 테이블 없이 기존 데이터에서 실시간 평균/분포를 계산해도 성능 문제는 없습니다.
- 향후 데이터 규모가 커질 경우에만 집계 테이블/캐시 도입을 검토합니다.

---

## 1) Dashboard Summary

**Endpoint**
- `GET /api/dashboard/summary`

**설명**
- 대시보드 상단 요약 및 리스크 분포/추이를 위한 집계 데이터를 제공합니다.

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

**필드 설명(한글)**
- `range`: 기간 라벨(예: "최근 4분기")
- `kpis`: 상단 KPI 카드 목록
- `latestActualQuarter`: 최신 실적 분기(예: `2025Q3`)
- `forecastQuarter`: 예측 분기(예: `2025Q4`)
- `windowQuarters`: 추이 차트용 5개 분기 배열
- `riskStatusDistribution`: 현재 리스크 상태 분포 수치
- `riskStatusDistributionTrend`: 분기별 분포 변화 추이 버킷

---

## 2) Risk Records (for Dwell Time)

**Endpoint**
- `GET /api/dashboard/risk-records`

**설명**
- 체류기간(dwell time) 계산 및 분기별 리스크 추이 확인을 위한 원천 데이터입니다.

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

**필드 설명(한글)**
- `companyId`: 기업 고유 ID
- `companyName`: 기업 표시명
- `quarter`: 분기 라벨(`YYYYQn`)
- `riskLevel`: 분기 리스크 상태(`MIN`, `WARN`, `RISK`)

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

**필드 설명(한글)**
- `key`: KPI 식별자(예: `ACTIVE_COMPANIES`)
- `title`: 표시 제목
- `value`: 숫자 또는 문자열 값
- `unit`: 단위 라벨(옵션)
- `tone`: 카드 톤(색상/상태)
- `delta`: 증감 표시(값 + 방향)
- `badge`: 배지 라벨(옵션)
- `tooltip`: KPI 도움말 텍스트
