import { DashboardRange, DashboardSummary } from '../types/dashboard';
import { getMockDashboardSummary } from '../mocks/dashboardSummary.mock';

export async function fetchDashboardSummary(range: DashboardRange): Promise<DashboardSummary> {
  // TODO: Replace with real API call when backend is available.
  // Example:
  // const response = await fetch(`/api/dashboard?range=${range}`);
  // if (!response.ok) throw new Error('Failed to fetch dashboard summary');
  // return response.json() as Promise<DashboardSummary>;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockDashboardSummary(range));
    }, 500);
  });
}
