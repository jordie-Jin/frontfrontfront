# Company ID / StockCode 점검 메모 (2026-02-09)

## 1. 목적
- 프론트 코드에서 `companyId`와 `stockCode`가 실제로 어디에 쓰이는지 확인
- 엔드포인트/파라미터/라우팅 간 식별자 불일치 가능성을 점검

## 2. 점검 범위
- API 헬퍼: `src/api/companies.ts`
- 페이지/훅: `src/pages/companies/Companies.tsx`, `src/pages/companies/CompanyDetail.tsx`, `src/pages/companies/AddCompany.tsx`, `src/hooks/useCompanySearch.ts`
- 타입: `src/types/company.ts`
- 스펙/문서: `SENTINEL_PoC_API.yaml`, `docs/api-spec-notes.md`, `docs/ai-report-download.md`

## 3. `companyId` 사용 현황

### 3.1 경로(Path) 기반
- `GET /api/companies/{companyId}`: `src/api/companies.ts:94`
- `GET /api/companies/{companyId}/overview`: `src/api/companies.ts:102`
- `GET /api/companies/{companyId}/insights`: `src/api/companies.ts:111`
- `POST /api/companies/{companyId}/update-requests`: `src/api/companies.ts:143`
- `DELETE /api/watchlists/{companyId}`: `src/api/companies.ts:73`

### 3.2 바디/쿼리 기반
- 워치리스트 등록 바디 `companyId`: `src/api/companies.ts:63`, `src/api/companies.ts:66`
- 기업 목록 조회 쿼리 `userId`: `src/api/companies.ts:83`, 호출부 `src/pages/companies/Companies.tsx:79`

### 3.3 화면 라우팅/상태
- 상세 라우트 `/companies/:id`에서 `id`를 `companyId`처럼 사용: `src/App.tsx:122`, `src/pages/companies/CompanyDetail.tsx:39`
- 목록/퀵뷰에서 `company.id`를 상세 경로로 전달: `src/components/companies/CompaniesTable.tsx:114`, `src/components/companies/CompanyQuickViewDrawer.tsx:156`
- 기업 추가 흐름은 검색 결과의 `companyId`(number) 사용: `src/pages/companies/AddCompany.tsx:80`, `src/pages/companies/AddCompany.tsx:93`

## 4. AI 분석/리포트 식별자 사용 현황
- AI 분석/리포트 계열도 `companyId` 명명으로 통일
  - `GET /api/companies/{companyId}/ai-analysis`: `src/api/companies.ts`
  - `GET /api/companies/{companyId}/ai-report/download`: `src/api/companies.ts`
  - `POST /api/companies/{companyId}/ai-report/request`: `src/api/companies.ts`
  - `GET /api/companies/{companyId}/ai-report/status/{requestId}`: `src/api/companies.ts`
- 호출 값은 `detail.company.id`를 그대로 사용: `src/pages/companies/CompanyDetail.tsx`

## 5. `stockCode` 사용 현황
- 표시(UI) 전용으로만 사용 중
  - 검색 결과 테이블 표시: `src/components/companies/SearchResultList.tsx:94`
  - 선택 패널 표시: `src/components/companies/SelectedCompanyPanel.tsx:43`
  - 타입 정의: `src/types/company.ts:46`, `src/types/company.ts:152`
- 검색 파라미터로 직접 전달하는 로직은 현재 없음
  - 검색 훅은 `keyword`만 전달: `src/hooks/useCompanySearch.ts:23`
  - API 헬퍼는 `name`/`code`를 받을 수 있으나, 기본 매핑은 `keyword -> name`: `src/api/companies.ts:38`, `src/api/companies.ts:44`

## 6. 스펙 대비 확인 포인트
- PoC 스펙은 핵심 회사 엔드포인트를 `{companyId}`로 정의: `SENTINEL_PoC_API.yaml:179`, `SENTINEL_PoC_API.yaml:208`, `SENTINEL_PoC_API.yaml:255`
- 클라이언트 문서 표기도 `companyId` 기준으로 통일됨.

## 7. 리스크 요약
1. 식별자 명칭 혼용
- 현재 프론트는 `companyId`로 통일했으며, 서버 문서/스펙도 동일 기준 유지가 필요.

2. 검색에서 `stockCode` 활용 미흡
- 화면 문구는 기업명/영문명 중심이며, 실제 API 호출도 `name` 위주라 종목코드 검색 기대와 다를 수 있음.

3. 목록 ID와 검색 ID 타입 차이
- 목록/상세는 `id: string`, 검색 결과는 `companyId: number` 기반이라, 소스가 달라질 때 매핑 누락 가능성 존재.

## 8. 권장 정리안
1. 식별자 표준화
- API 함수 인자명을 전부 `companyId`로 통일하고, AI 리포트 계열도 내부적으로 `companyId` 별칭으로 맞추는 것을 권장.

2. 검색 파라미터 분기 명확화
- 입력이 숫자/알파뉴메릭 패턴이면 `code`로, 한글/일반 텍스트면 `name`으로 보내도록 분기하면 `stockCode` 검색 일관성이 좋아짐.

3. 타입 정렬
- `CompanySearchItem.companyId`와 `CompanySummary.id` 사이 매핑 규칙(동일 키인지, 변환 규칙이 있는지)을 타입 주석 또는 어댑터 함수로 고정 권장.
