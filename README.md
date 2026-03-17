<div align="center">
  <img width="1200" height="475" src="public/img/owl.png" alt="SENTINEL 배너" />

# SENTINEL Front

**Hear the hoot before the fall.**  
공급망 협력사 리스크를 선제적으로 탐지하고 대응할 수 있도록 돕는 프론트엔드 애플리케이션입니다.
</div>

## 개요
SENTINEL Front는 React + Vite 기반으로 구성된 대시보드 웹 앱입니다.  
협력사 모니터링, 대시보드 지표 확인, Q&A, 공지사항, AI 리포트 다운로드 흐름을 제공합니다.

## 기술 스택
- React 19
- TypeScript
- Vite
- React Router
- Recharts

## 시작하기
### 1) 의존성 설치
```bash
npm install
```

### 2) 환경 변수 설정
프로젝트 루트에 `.env` 파일을 준비하고 아래 값을 설정합니다.

```env
VITE_API_BASE_URL=http://localhost:8181
VITE_USE_MOCK_AUTH=false
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
VITE_DEMO_EMAIL=demo@example.com
VITE_DEMO_PASSWORD=demo_password
```

> `VITE_DEMO_EMAIL`, `VITE_DEMO_PASSWORD`는 랜딩 페이지 데모 자동 로그인 기능에서 사용됩니다.

### 3) 개발 서버 실행
```bash
npm run dev
```

기본 실행 주소: `http://localhost:5173`

## 스크립트
- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드 생성
- `npm run preview`: 빌드 결과 로컬 미리보기

## 디렉터리 가이드
- `src/pages`: 페이지 단위 UI
- `src/components`: 재사용 컴포넌트
- `src/api`, `src/services`: API 호출 및 비즈니스 로직
- `src/types`: 공통 타입 정의

## 배포 전 체크
- API 베이스 URL이 배포 환경과 일치하는지 확인
- Turnstile Site Key가 운영용 값인지 확인
- 데모 자동 로그인 환경 변수 사용 여부 점검
