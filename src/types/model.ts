// 모델 API 엔티티 타입 정의입니다.
export type ModelRunRequest = {
  companyId: string;
  companyName: string;
  requestId: string;
  scenario: 'baseline' | 'optimistic' | 'stress';
  horizonMonths: number;
  requestedBy: string;
};

export type ModelRunResponse = {
  jobId: string;
  status: 'queued' | 'running' | 'done';
};
