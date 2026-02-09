import React, { useRef, useState } from 'react';
import AddCompanyForm from '../../components/companies/AddCompanyForm';
import SearchResultList from '../../components/companies/SearchResultList';
import SelectedCompanyPanel from '../../components/companies/SelectedCompanyPanel';
import JsonPreview from '../../components/common/JsonPreview';
import { useCompanySearch } from '../../hooks/useCompanySearch';
import { useCompanySelection } from '../../hooks/useCompanySelection';
import { ApiRequestError } from '../../api/client';
import { createWatchlistCompany, getCompanyOverview } from '../../api/companies';
import { CompanyConfirmResult, CompanyOverview, CompanySearchItem } from '../../types/company';

const AddCompanyPage: React.FC = () => {
  // TODO(API 연결):
  // - 더미 데이터 제거
  // - searchCompanies API 연결
  // - watchlist 등록 API 연결
  // - PROCESSING 상태 처리 로직 활성화
  const [keyword, setKeyword] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [confirmResult, setConfirmResult] = useState<CompanyConfirmResult | null>(null);
  const [companyOverview, setCompanyOverview] = useState<CompanyOverview | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const overviewCacheRef = useRef<Record<string, CompanyOverview>>({});

  const { items, total, isLoading, error, hasSearched, search, clear } = useCompanySearch();
  const { selectedCompany, selectCompany, clearSelection } = useCompanySelection();

  const resetConfirmation = () => {
    setConfirmError(null);
    setCompletionMessage(null);
    setConfirmResult(null);
    setCompanyOverview(null);
  };

  const handleSearch = async () => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      setValidationMessage('검색할 키워드를 입력해 주세요.');
      return;
    }

    if (trimmedKeyword.length < 2) {
      setValidationMessage('검색 키워드는 2자 이상 입력해 주세요.');
      return;
    }

    setValidationMessage(null);
    clearSelection();
    resetConfirmation();
    await search({ keyword: trimmedKeyword });
  };

  const handleReset = () => {
    setKeyword('');
    setValidationMessage(null);
    clear();
    clearSelection();
    resetConfirmation();
  };

  const handleSelect = (company: CompanySearchItem) => {
    selectCompany(company);
    resetConfirmation();
  };

  const handleConfirm = async () => {
    if (!selectedCompany || isConfirming) {
      return;
    }

    setIsConfirming(true);
    setConfirmError(null);
    setCompletionMessage(null);

    try {
      const resultMessage = await createWatchlistCompany({
        companyId: selectedCompany.companyId,
      });
      setConfirmResult({
        companyId: String(selectedCompany.companyId),
        name: selectedCompany.corpName,
        modelStatus: 'COMPLETED',
      });
      setCompletionMessage(resultMessage || '워치리스트에 등록되었습니다.');

      const cachedOverview = overviewCacheRef.current[String(selectedCompany.companyId)];
      if (cachedOverview) {
        setCompanyOverview(cachedOverview);
      } else {
        const overview = await getCompanyOverview(String(selectedCompany.companyId));
        overviewCacheRef.current[String(selectedCompany.companyId)] = overview;
        setCompanyOverview(overview);
      }
    } catch (err) {
      if (err instanceof ApiRequestError && err.apiError?.status === 409) {
        setConfirmError('이미 워치리스트에 등록된 기업입니다.');
      } else if (err instanceof ApiRequestError && err.apiError?.status === 400) {
        setConfirmError('요청 값 오류로 등록에 실패했습니다.');
      } else if (err instanceof ApiRequestError && err.apiError?.status === 401) {
        setConfirmError('인증이 필요합니다. 다시 로그인해 주세요.');
      } else {
        setConfirmError('확인 단계 처리에 실패했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col gap-3">
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Companies</p>
        <h2 className="text-4xl font-semibold tracking-tight text-white">기업 추가 (Add Company)</h2>
        <p className="max-w-2xl text-sm text-slate-400">
          기업 검색부터 선택, 모델 요청까지 백엔드 연동 전에도 검증할 수 있도록 구성된 Mock 플로우입니다.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <AddCompanyForm
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSearch={handleSearch}
          onReset={handleReset}
          validationMessage={validationMessage}
          isSearching={isLoading}
        />
        <SelectedCompanyPanel
          selectedCompany={selectedCompany}
          onConfirm={handleConfirm}
          isConfirming={isConfirming}
          completionMessage={completionMessage}
          errorMessage={confirmError}
        />
      </div>

      <SearchResultList
        items={items}
        total={total}
        isLoading={isLoading}
        error={error}
        selectedId={selectedCompany?.companyId ?? null}
        hasSearched={hasSearched}
        onSelect={handleSelect}
      />

      {(confirmResult || companyOverview) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {confirmResult && <JsonPreview title="Company Confirm Result" data={confirmResult} />}
          {companyOverview && <JsonPreview title="Company Overview" data={companyOverview} />}
        </div>
      )}
    </div>
  );
};

export default AddCompanyPage;
