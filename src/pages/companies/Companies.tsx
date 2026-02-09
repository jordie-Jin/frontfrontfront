// 협력사 목록 페이지 컴포넌트입니다.
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AsyncState from '../../components/common/AsyncState';
import CompanyQuickViewDrawer from '../../components/companies/CompanyQuickViewDrawer';
import CompaniesHeader from '../../components/companies/CompaniesHeader';
import CompaniesTable from '../../components/companies/CompaniesTable';
import { logout, getStoredUser } from '../../services/auth';
import { ApiRequestError } from '../../api/client';
import {
  deleteWatchlistCompany,
  getCompanyInsights,
  getCompanyOverview,
  listCompanies,
} from '../../api/companies';
import {
  getMockCompanyInsights,
  getMockCompanyOverview,
  INITIAL_COMPANIES,
} from '../../mocks/companies.mock';
import {
  fetchAdminViewUsers,
  getAdminViewUsers,
  getStoredAdminViewUser,
  isAdminUser,
  resolveAdminViewUserId,
  setStoredAdminViewUser,
} from '../../services/adminView';
import { useCompaniesStore } from '../../store/companiesStore';
import { CompanyInsightItem, CompanyOverview, CompanySummary } from '../../types/company';
import { AdminViewUser } from '../../types/adminView';

const CompaniesPage: React.FC = () => {
  // TODO(API 연결):
  // - 더미 데이터 제거
  // - listCompanies API 연결
  // - PROCESSING 상태 처리 로직 활성화
  const navigate = useNavigate();
  const { companies, setCompanies } = useCompaniesStore();
  const currentUser = getStoredUser();
  const isAdmin = isAdminUser(currentUser);
  const [adminUsers, setAdminUsers] = useState<AdminViewUser[]>([]);
  const [adminUsersFallback, setAdminUsersFallback] = useState(false);
  const [adminViewUser, setAdminViewUser] = useState<AdminViewUser | null>(() =>
    getStoredAdminViewUser(),
  );
  const adminViewUserId = resolveAdminViewUserId(isAdmin, adminViewUser);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
  const [insightsState, setInsightsState] = useState<{
    isLoading: boolean;
    error: string | null;
    data: CompanyInsightItem[];
  }>({
    isLoading: false,
    error: null,
    data: [],
  });

  const loadCompanies = async () => {
    setIsLoading(true);
    setError(null);
    setFallbackMessage(null);
    try {
      const response = await listCompanies({ userId: adminViewUserId });
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
  }, [adminViewUserId]);

  const loadAdminUsers = async () => {
    if (!isAdmin) {
      setAdminUsers([]);
      setAdminUsersFallback(false);
      return;
    }

    try {
      const response = await fetchAdminViewUsers();
      setAdminUsers(response);
      setAdminUsersFallback(false);
    } catch (error) {
      setAdminUsers(getAdminViewUsers());
      setAdminUsersFallback(true);
    }
  };

  useEffect(() => {
    void loadAdminUsers();
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedCompany) {
      setDetailState({ isLoading: false, error: null, data: null });
      setInsightsState({ isLoading: false, error: null, data: [] });
      return;
    }

    const fetchDetail = async () => {
      setDetailState({ isLoading: true, error: null, data: null });
      setInsightsState({ isLoading: true, error: null, data: [] });
      try {
        const detail = await getCompanyOverview(selectedCompany.id, {
          userId: adminViewUserId,
        });
        setDetailState({ isLoading: false, error: null, data: detail });
      } catch (err) {
        const fallbackDetail = getMockCompanyOverview(selectedCompany.id);
        setFallbackMessage('협력사 API 응답 오류로 목 데이터를 표시하고 있어요.');
        setDetailState({ isLoading: false, error: null, data: fallbackDetail });
      }

      try {
        const response = await getCompanyInsights(selectedCompany.id, {
          userId: adminViewUserId,
        });
        setInsightsState({ isLoading: false, error: null, data: response ?? [] });
      } catch (err) {
        const fallbackInsights = getMockCompanyInsights(selectedCompany.id);
        setInsightsState({ isLoading: false, error: null, data: fallbackInsights });
      }
    };

    void fetchDetail();
  }, [selectedCompany, adminViewUserId]);

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

  const handleDeleteCompany = async (company: CompanySummary) => {
    if (deletingId) {
      return;
    }

    const confirmed = window.confirm(`${company.name}을(를) 워치리스트에서 삭제할까요?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(company.id);
    setDeleteError(null);
    try {
      await deleteWatchlistCompany(company.id);
      setCompanies(companies.filter((item) => item.id !== company.id));
      if (selectedCompany?.id === company.id) {
        setSelectedCompany(null);
      }
    } catch (err) {
      if (err instanceof ApiRequestError && err.apiError?.status === 401) {
        setDeleteError('인증이 필요합니다. 다시 로그인해 주세요.');
      } else if (err instanceof ApiRequestError && err.apiError?.status === 404) {
        setDeleteError('등록되지 않은 기업입니다.');
      } else {
        setDeleteError('워치리스트 삭제에 실패했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <CompaniesHeader
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onAddCompanyClick={() => navigate('/companies/add')}
        showAdminSwitch={isAdmin && adminUsers.length > 0}
        adminUsers={adminUsers}
        selectedAdminUserId={adminViewUser?.id}
        onAdminUserChange={(userId) => {
          const nextUser = adminUsers.find((user) => user.id === userId) ?? null;
          setAdminViewUser(nextUser);
          setStoredAdminViewUser(nextUser);
        }}
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

      {adminUsersFallback && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-6 py-4 text-sm text-amber-100">
          사용자 목록 API 오류로 목 데이터를 표시하고 있어요.
        </div>
      )}

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
        {deleteError && (
          <div className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-6 py-4 text-sm text-rose-100">
            {deleteError}
          </div>
        )}
        <CompaniesTable
          companies={filteredCompanies}
          onSelect={setSelectedCompany}
          onDelete={handleDeleteCompany}
          deletingId={deletingId}
        />
      </AsyncState>

      <CompanyQuickViewDrawer
        isOpen={Boolean(selectedCompany)}
        detail={detailState.data}
        newsItems={insightsState.data}
        isLoading={detailState.isLoading}
        error={detailState.error}
        onClose={() => setSelectedCompany(null)}
      />
    </div>
  );
};

export default CompaniesPage;
