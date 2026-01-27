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
