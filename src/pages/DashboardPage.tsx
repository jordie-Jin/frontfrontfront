// KPI와 리스크 위젯을 구성하는 대시보드 페이지 컴포넌트입니다.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import KpiCards from '../components/dashboard/KpiCards';
import RiskStatusTrendCard from '../features/dashboard/risk-status-trend/RiskStatusTrendCard';
import RiskDistributionCard from '../components/dashboard/RiskDistributionCard';
import { companyRiskQuarterlyMock } from '../mocks/companyRiskQuarterly.mock';
import { getMockRiskDistribution } from '../mocks/riskDistribution.mock';
import { getStoredUser, logout } from '../services/auth';
import { fetchDashboardSummary } from '../services/dashboardApi';
import { DashboardRange, DashboardSummary, RiskDistribution } from '../types/dashboard';

const USE_API = false;

const DashboardPage: React.FC = () => {
  // TODO(API 연결):
  // - 더미 데이터 제거
  // - getDashboardSummary API 연결
  const navigate = useNavigate();
  const [range, setRange] = useState<DashboardRange>('30d');
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [userName] = useState(() => getStoredUser()?.name ?? 'id');

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = USE_API
        ? await (await import('../api/companies')).getDashboardSummary(range)
        : await fetchDashboardSummary(range);
      setData(response);
      setRiskDistribution(getMockRiskDistribution(range));
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const emptyState = useMemo(() => {
    if (!riskDistribution || !data) return false;
    return (
      riskDistribution.segments.length === 0 && data.riskStatusDistributionTrend.length === 0
    );
  }, [data, riskDistribution]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      // ignore logout errors for now
    } finally {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="animate-in fade-in duration-700">
      <DashboardHeader
        range={range}
        onChangeRange={setRange}
        onLogout={handleLogout}
        userName={userName}
      />

      {isLoading && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`kpi-skeleton-${index}`}
                className="glass-panel p-6 rounded-2xl animate-pulse"
              >
                <div className="h-3 w-16 bg-white/10 rounded mb-4"></div>
                <div className="h-8 w-20 bg-white/10 rounded mb-2"></div>
                <div className="h-2 w-24 bg-white/5 rounded"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel p-8 rounded-2xl animate-pulse h-72"></div>
            <div className="glass-panel p-8 rounded-2xl animate-pulse h-72"></div>
          </div>
        </div>
      )}

      {!isLoading && isError && (
        <div className="glass-panel p-10 rounded-2xl text-center text-slate-300">
          <div className="text-lg font-medium text-white mb-2">데이터를 불러오지 못했습니다.</div>
          <p className="text-sm text-slate-500 mb-6">잠시 후 다시 시도해주세요.</p>
          <button
            type="button"
            onClick={loadSummary}
            className="px-5 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white hover:bg-white/20 transition"
          >
            다시 시도
          </button>
        </div>
      )}

      {!isLoading && !isError && data && riskDistribution && (
        <div>
          <KpiCards kpis={data.kpis} riskRecords={companyRiskQuarterlyMock} />

          {emptyState && (
            <div className="glass-panel p-10 rounded-2xl text-center text-slate-400 mb-10">
              <div className="text-lg text-white mb-2">표시할 데이터가 없습니다.</div>
              <p className="text-sm text-slate-500">기간을 변경하거나 데이터가 준비될 때까지 기다려주세요.</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RiskStatusTrendCard />
            <RiskDistributionCard distribution={riskDistribution} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
