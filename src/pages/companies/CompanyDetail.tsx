// 협력사 상세 페이지 컴포넌트입니다.
import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AsyncState from '../../components/common/AsyncState';
import MetricForecastChartPanel from '../../components/companyDetail/MetricForecastChartPanel';
import MetricsPanel from '../../components/companyDetail/MetricsPanel';
import {
  downloadCompanyAiReport,
  getCompanyInsights,
  getCompanyOverview,
  requestCompanyAiReport,
} from '../../api/companies';
import { getMockCompanyInsights, getMockCompanyOverview } from '../../mocks/companies.mock';
import { getStoredUser } from '../../services/auth';
import {
  getStoredAdminViewUser,
  isAdminUser,
  resolveAdminViewUserId,
} from '../../services/adminView';
import { CompanyInsightItem, CompanyOverview } from '../../types/company';
import {
  getCompanyStatusFromHealth,
  getCompanyHealthScore,
  toMetricForecast,
  toMetricCards,
  toSignalCards,
} from '../../utils/companySelectors';

const statusStyles: Record<string, string> = {
  정상: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  주의: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  위험: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
};

const CompanyDetailPage: React.FC = () => {
  // TODO(API 연결):
  // - 더미 데이터 제거
  // - getCompanyOverview API 연결
  // - PROCESSING 상태 처리 로직 활성화
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [detail, setDetail] = useState<CompanyOverview | null>(null);
  const [insights, setInsights] = useState<CompanyInsightItem[]>([]);
  const [insightsFallbackMessage, setInsightsFallbackMessage] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isReportGenerating, setIsReportGenerating] = useState(false);
  const [reportStatusMessage, setReportStatusMessage] = useState<string | null>(null);
  const reportTimerRef = useRef<number | null>(null);
  const currentUser = getStoredUser();
  const storedAdminViewUser = getStoredAdminViewUser();
  const adminViewUserId = resolveAdminViewUserId(
    isAdminUser(currentUser),
    storedAdminViewUser,
  );

  const loadDetail = async () => {
    if (!id) {
      setError('협력사 식별 정보를 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setFallbackMessage(null);
    try {
      const response = await getCompanyOverview(id, { userId: adminViewUserId });
      setDetail(response);
    } catch (err) {
      const fallbackDetail = getMockCompanyOverview(id);
      setDetail(fallbackDetail);
      setFallbackMessage('협력사 API 응답 오류로 목 데이터를 표시하고 있어요.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInsights = async () => {
    if (!id) {
      return;
    }

    setInsightsFallbackMessage(null);
    try {
      const response = await getCompanyInsights(id, { userId: adminViewUserId });
      setInsights(Array.isArray(response) ? response : []);
    } catch (err) {
      setInsights(getMockCompanyInsights(id));
      setInsightsFallbackMessage('인사이트 API 오류로 목 데이터를 표시하고 있어요.');
    }
  };

  useEffect(() => {
    void loadDetail();
    void loadInsights();
  }, [id, adminViewUserId]);

  useEffect(() => {
    return () => {
      clearReportTimer();
    };
  }, []);

  const healthScore = detail ? getCompanyHealthScore(detail.company) : 0;
  const statusLabel = detail ? getCompanyStatusFromHealth(healthScore) : '—';
  const metricForecast = toMetricForecast(detail?.forecast);
  const reportInsight = insights.find((item) => item.type === 'REPORT');
  const newsInsights = insights.filter((item) => item.type === 'NEWS').slice(0, 10);
  const normalizedKeyMetrics = detail?.keyMetrics
    ?.map((metric) => {
      if (metric.key === 'EXTERNAL_HEALTH' || metric.label === '외부 건강도') {
        const rawValue = metric.value;
        const normalizedValue =
          typeof rawValue === 'number' && rawValue > 0 && rawValue <= 1
            ? Number((rawValue * 100).toFixed(2))
            : rawValue;
        return {
          ...metric,
          value: normalizedValue,
        };
      }
      if (metric.key === 'ANNUAL_REVENUE' || metric.label === '연 매출') {
        return {
          ...metric,
          key: 'EXTERNAL_HEALTH',
          label: '외부 건강도',
          value: detail.company.kpi?.reputationScore ?? detail.company.overallScore,
          unit: '%',
          tooltip: {
            description: '외부 평판·시장 신호를 종합한 건강도 지표입니다.',
            interpretation: '높을수록 대외 리스크 신호가 안정적입니다.',
            actionHint: '하락 시 외부 이슈 모니터링과 커뮤니케이션을 점검하세요.',
          },
        };
      }
      return metric;
    })
    ?.filter((metric) => {
      const label = metric.label?.replace(/\s+/g, '') ?? '';
      const key = metric.key ?? '';
      if (key.includes('REPUTATION')) return false;
      if (label.includes('외부기업평판') || label.includes('외부평판')) return false;
      if (label.includes('외부기업건강도')) return false;
      return true;
    });
  const metrics = toMetricCards(normalizedKeyMetrics);
  const signals = toSignalCards(detail?.signals);

  const resolveReportPeriod = (companyDetail: CompanyOverview): { year: number; quarter: number } => {
    const nextQuarter = companyDetail.forecast?.nextQuarter ?? '';
    const nextQuarterMatch = nextQuarter.match(/^(\d{4})(\d{2})$/);
    if (nextQuarterMatch) {
      const year = Number(nextQuarterMatch[1]);
      const quarter = Number(nextQuarterMatch[2]);
      if (quarter >= 1 && quarter <= 4) {
        return { year, quarter };
      }
    }

    const latestActualQuarter = companyDetail.forecast?.latestActualQuarter ?? '';
    const latestMatch = latestActualQuarter.match(/^(\d{4})Q([1-4])$/);
    if (latestMatch) {
      return { year: Number(latestMatch[1]), quarter: Number(latestMatch[2]) };
    }

    const now = new Date();
    const year = now.getFullYear();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return { year, quarter };
  };

  const clearReportTimer = () => {
    if (reportTimerRef.current) {
      window.clearTimeout(reportTimerRef.current);
      reportTimerRef.current = null;
    }
  };

  const isReportCompleted = (status?: string, message?: string) => {
    const normalizedStatus = status?.toLowerCase() ?? '';
    const normalizedMessage = message ?? '';
    if (['completed', 'done', 'success', 'ready'].some((token) => normalizedStatus.includes(token))) {
      return true;
    }
    if (/완료|생성 완료|ready/i.test(normalizedMessage)) {
      return true;
    }
    return false;
  };

  const pollReportStatus = async (companyDetail: CompanyOverview) => {
    const { year, quarter } = resolveReportPeriod(companyDetail);
    const companyCode = companyDetail.company.stockCode ?? companyDetail.company.id;
    try {
      const response = await requestCompanyAiReport(companyCode, { year, quarter });
      if (isReportCompleted(response.status, response.message)) {
        setIsReportGenerating(false);
        setReportStatusMessage(
          'AI 분석 리포트 생성이 완료되었습니다. 다운로드 버튼을 눌러 주세요.',
        );
        clearReportTimer();
        return;
      }

      setReportStatusMessage(response.message ?? 'AI 리포트 생성 중입니다. (약 1~2분 소요)');
    } catch (error) {
      setIsReportGenerating(false);
      setReportStatusMessage('AI 리포트 생성 상태 확인에 실패했습니다.');
      clearReportTimer();
      return;
    }

    reportTimerRef.current = window.setTimeout(() => {
      void pollReportStatus(companyDetail);
    }, 10000);
  };

  const handleGenerateReport = async () => {
    if (!detail || isReportGenerating) {
      return;
    }

    clearReportTimer();
    setIsReportGenerating(true);
    setReportStatusMessage('AI 분석 리포트 생성 중입니다. (약 1~2분 소요)');

    const { year, quarter } = resolveReportPeriod(detail);
    const companyCode = detail.company.stockCode ?? detail.company.id;
    try {
      const response = await requestCompanyAiReport(companyCode, { year, quarter });
      if (isReportCompleted(response.status, response.message)) {
        setIsReportGenerating(false);
        setReportStatusMessage(
          'AI 분석 리포트 생성이 완료되었습니다. 다운로드 버튼을 눌러 주세요.',
        );
        return;
      }

      setReportStatusMessage(
        response.message ?? 'AI 분석 리포트 생성 중입니다. (약 1~2분 소요)',
      );
      reportTimerRef.current = window.setTimeout(() => {
        void pollReportStatus(detail);
      }, 10000);
    } catch (error) {
      setIsReportGenerating(false);
      setReportStatusMessage('AI 분석 리포트 생성 요청에 실패했습니다.');
    }
  };

  const handleDownloadReport = async () => {
    if (!detail) {
      return;
    }

    setDownloadError(null);
    try {
      const { year, quarter } = resolveReportPeriod(detail);
      const companyCode = detail.company.stockCode ?? detail.company.id;
      const blob = await downloadCompanyAiReport(companyCode, { year, quarter });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${detail.company.name.replace(/\s+/g, '')}_AI리포트.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadErr) {
      setDownloadError('AI 리포트 다운로드에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <AsyncState
        isLoading={isLoading}
        error={error}
        empty={!isLoading && !error && !detail}
        onRetry={loadDetail}
        emptyMessage="협력사 상세 정보가 없습니다."
      >
        {fallbackMessage && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-6 py-4 text-sm text-amber-100">
            {fallbackMessage}
          </div>
        )}
        {insightsFallbackMessage && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-6 py-4 text-sm text-amber-100">
            {insightsFallbackMessage}
          </div>
        )}
        {detail && (
          <>
            <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl text-white">
                  {detail.company.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-light text-white serif">{detail.company.name}</h2>
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${
                        statusStyles[statusLabel]
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                    <span>산업군 {detail.company.sector.label} · 기업 코드 {detail.company.id}</span>
                    {storedAdminViewUser && isAdminUser(currentUser) && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">
                        보기: {storedAdminViewUser.name} · {storedAdminViewUser.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={isReportGenerating}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <i className={`fas ${isReportGenerating ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} text-xs`}></i>
                  {isReportGenerating ? 'AI 분석 리포트 생성 중' : 'AI 분석 리포트 생성'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  <i className="fas fa-download text-xs"></i>
                  분석 보고서 다운로드
                </button>
                {downloadError && (
                  <span className="text-xs text-rose-300">{downloadError}</span>
                )}
                {reportStatusMessage && (
                  <span className="text-xs text-slate-400">{reportStatusMessage}</span>
                )}
                <Link
                  to="/companies"
                  className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-500 transition hover:text-white"
                >
                  <i className="fas fa-chevron-left"></i>
                  협력사 목록으로
                </Link>
              </div>
            </header>

            <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
              <MetricForecastChartPanel
                metricForecast={metricForecast}
                commentary={detail.aiComment ?? ''}
                reportSummary={reportInsight?.body ?? reportInsight?.content ?? ''}
                newsItems={newsInsights}
              />
              <MetricsPanel metrics={metrics} signals={signals} />
            </div>
          </>
        )}
      </AsyncState>
    </div>
  );
};

export default CompanyDetailPage;
