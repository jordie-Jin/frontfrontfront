// 협력사 상세 페이지 컴포넌트입니다.
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AsyncState from '../../components/common/AsyncState';
import MetricForecastChartPanel from '../../components/companyDetail/MetricForecastChartPanel';
import MetricsPanel from '../../components/companyDetail/MetricsPanel';
import { getCompanyOverview } from '../../api/companies';
import { getMockCompanyOverview } from '../../mocks/companies.mock';
import { CompanyOverview } from '../../types/company';
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
      const response = await getCompanyOverview(id);
      setDetail(response);
    } catch (err) {
      const fallbackDetail = getMockCompanyOverview(id);
      setDetail(fallbackDetail);
      setFallbackMessage('협력사 API 응답 오류로 목 데이터를 표시하고 있어요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDetail();
  }, [id]);

  const healthScore = detail ? getCompanyHealthScore(detail.company) : 0;
  const statusLabel = detail ? getCompanyStatusFromHealth(healthScore) : '—';
  const metricForecast = toMetricForecast(detail?.forecast);
  const normalizedKeyMetrics = detail?.keyMetrics?.map((metric) => {
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
  });
  const metrics = toMetricCards(normalizedKeyMetrics);
  const signals = toSignalCards(detail?.signals);

  const buildReportContent = (companyDetail: CompanyOverview) => {
    const summaryLines = [
      `협력사 분석 보고서`,
      `기업명: ${companyDetail.company.name}`,
      `기업 ID: ${companyDetail.company.id}`,
      `산업군: ${companyDetail.company.sector.label}`,
      `리스크 등급: ${getCompanyStatusFromHealth(
        getCompanyHealthScore(companyDetail.company),
      )}`,
      `작성일: ${new Date().toLocaleDateString('ko-KR')}`,
    ];
    const metricLines =
      companyDetail.keyMetrics?.map(
        (metric) => `- ${metric.label}: ${metric.value ?? '—'}${metric.unit ?? ''}`,
      ) ?? [];
    const aiComment = companyDetail.aiComment ? `AI 코멘트:\n${companyDetail.aiComment}` : '';

    return [summaryLines.join('\n'), '핵심 지표', ...metricLines, '', aiComment]
      .filter((line) => line.length > 0)
      .join('\n');
  };

  const handleDownloadReport = () => {
    if (!detail) {
      return;
    }

    const reportContent = buildReportContent(detail);
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${detail.company.name.replace(/\s+/g, '')}_분석보고서.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                    산업군 {detail.company.sector.label} · 기업 ID {detail.company.id}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  <i className="fas fa-download text-xs"></i>
                  분석 보고서 다운로드
                </button>
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
