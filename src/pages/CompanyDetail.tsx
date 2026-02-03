// 협력사 상세 페이지 컴포넌트입니다.
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AsyncState from '../components/common/AsyncState';
import MetricForecastChartPanel from '../components/companyDetail/MetricForecastChartPanel';
import MetricsPanel from '../components/companyDetail/MetricsPanel';
import { getCompanyOverview } from '../api/companies';
import { CompanyOverview } from '../types/company';
import {
  getCompanyStatusLabel,
  toMetricForecast,
  toMetricCards,
  toSignalCards,
} from '../utils/companySelectors';

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
  const [detail, setDetail] = useState<CompanyOverview | null>(null);

  const loadDetail = async () => {
    if (!id) {
      setError('협력사 식별 정보를 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await getCompanyOverview(id);
      setDetail(response);
    } catch (err) {
      setError('협력사 상세 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDetail();
  }, [id]);

  const statusLabel = detail ? getCompanyStatusLabel(detail.company.riskLevel) : '—';
  const metricForecast = toMetricForecast(detail?.forecast);
  const metrics = toMetricCards(detail?.keyMetrics);
  const signals = toSignalCards(detail?.signals);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <AsyncState
        isLoading={isLoading}
        error={error}
        empty={!isLoading && !error && !detail}
        onRetry={loadDetail}
        emptyMessage="협력사 상세 정보가 없습니다."
      >
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
              <Link
                to="/companies"
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-500 transition hover:text-white"
              >
                <i className="fas fa-chevron-left"></i>
                협력사 목록으로
              </Link>
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
