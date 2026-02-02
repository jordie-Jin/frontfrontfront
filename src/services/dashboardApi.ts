// 대시보드 API 호출을 위한 서비스 레이어입니다.
import { DashboardRange, DashboardSummary } from '../types/dashboard';
import { getMockDashboardSummary } from '../mocks/dashboardSummary.mock';

export async function fetchDashboardSummary(range: DashboardRange): Promise<DashboardSummary> {
  // TODO(API 연결): 더미 데이터 제거 후 getDashboardSummary API 연결
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockDashboardSummary(range));
    }, 500);
  });
}
