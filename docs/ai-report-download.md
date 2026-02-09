# AI 분석 리포트 다운로드 동작

## 1. 다운로드 흐름 (현재 구현)

1. 사용자가 "AI 분석 리포트 생성" 버튼을 클릭합니다.
2. 화면에서 선택한 연도/분기(`reportYear`, `reportQuarter`)가 있으면 그 값을 사용하고, 없으면 `resolveReportPeriod`로 기본 연도/분기를 계산합니다.
3. `/api/companies/{companyId}/ai-report/request`로 생성 요청을 보냅니다.
4. 응답에 `requestId`가 있으면 `/api/companies/{companyId}/ai-report/status/{requestId}`로 10초 간격 폴링을 시작합니다.
5. 완료 상태가 확인되면 `downloadUrl`이 있을 경우 해당 URL을 `fetch`하여 `blob` 다운로드를 수행합니다.
6. 파일명은 `{회사명}_AI리포트.pdf`로 저장됩니다.

## 2. 리포트 생성 버튼 흐름 (요약)

1. 생성 요청 후 완료 시 자동 다운로드됩니다.
2. 완료 메시지는 `AI 분석 리포트 생성 완료됨`으로 표시됩니다.

## 3. 관련 코드 위치

- `src/pages/companies/CompanyDetail.tsx`
  - `handleGenerateReport`, `pollReportStatus`: 생성/폴링 및 자동 다운로드 동작
- `src/api/companies.ts`
  - `downloadCompanyAiReport`
  - `requestCompanyAiReport`
  - `getCompanyAiReportStatus`

## 4. 비고

생성 완료 후 내려오는 `downloadUrl`을 `fetch`하여 `blob` 다운로드를 트리거합니다.
