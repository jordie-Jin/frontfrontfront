// 협력사 목록 페이지 컴포넌트입니다.
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AsyncState from '../components/common/AsyncState';
import CompanyQuickViewDrawer from '../components/companies/CompanyQuickViewDrawer';
import CompaniesHeader from '../components/companies/CompaniesHeader';
import CompaniesTable from '../components/companies/CompaniesTable';
import { logout } from '../services/auth';
import { getCompanyOverview, listCompanies } from '../api/companies';
import { getMockCompanyOverview, INITIAL_COMPANIES } from '../mocks/companies.mock';
import { useCompaniesStore } from '../store/companiesStore';
import { CompanyOverview, CompanySummary } from '../types/company';

const CompaniesPage: React.FC = () => {
  // TODO(API 연결):
  // - 더미 데이터 제거
  // - listCompanies API 연결
  // - PROCESSING 상태 처리 로직 활성화
  const navigate = useNavigate();
  const { companies, setCompanies } = useCompaniesStore();
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanySummary | null>(null);
  const [detailState, setDetailState] = useState<{
    isLoading: boolean;
    error: string | null;
    data: CompanyOverview | null;
  }>({
    isLoading: false,
    error: null,
    data: null,
  });

  const loadCompanies = async () => {
    setIsLoading(true);
    setError(null);
    setFallbackMessage(null);
    try {
      const response = await listCompanies();
      setCompanies(response);
    } catch (err) {
      setCompanies(INITIAL_COMPANIES);
      setFallbackMessage('협력사 API 응답 오류로 목 데이터를 표시하고 있어요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCompanies();
  }, []);

  useEffect(() => {
    if (!selectedCompany) {
      setDetailState({ isLoading: false, error: null, data: null });
      return;
    }

    const fetchDetail = async () => {
      setDetailState({ isLoading: true, error: null, data: null });
      try {
        const detail = await getCompanyOverview(selectedCompany.id);
        setDetailState({ isLoading: false, error: null, data: detail });
      } catch (err) {
        const fallbackDetail = getMockCompanyOverview(selectedCompany.id);
        setFallbackMessage('협력사 API 응답 오류로 목 데이터를 표시하고 있어요.');
        setDetailState({ isLoading: false, error: null, data: fallbackDetail });
      }
    };

    void fetchDetail();
  }, [selectedCompany]);

  const filteredCompanies = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) {
      return companies;
    }
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(keyword) ||
        company.sector.label.toLowerCase().includes(keyword),
    );
  }, [companies, searchValue]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <CompaniesHeader
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onAddCompanyClick={() => navigate('/companies/add')}
        onLogout={async () => {
          try {
            await logout();
          } catch (error) {
            // ignore logout errors for now
          } finally {
            navigate('/');
          }
        }}
      />

      <AsyncState
        isLoading={isLoading}
        error={error}
        empty={!isLoading && !error && filteredCompanies.length === 0}
        emptyMessage={searchValue ? '검색 조건에 맞는 협력사가 없습니다.' : '등록된 협력사가 없습니다.'}
        onRetry={loadCompanies}
      >
        {fallbackMessage && (
          <div className="mb-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-6 py-4 text-sm text-amber-100">
            {fallbackMessage}
          </div>
        )}
        <CompaniesTable companies={filteredCompanies} onSelect={setSelectedCompany} />
      </AsyncState>

      <CompanyQuickViewDrawer
        isOpen={Boolean(selectedCompany)}
        detail={detailState.data}
        isLoading={detailState.isLoading}
        error={detailState.error}
        onClose={() => setSelectedCompany(null)}
      />
    </div>
  );
};

export default CompaniesPage;
