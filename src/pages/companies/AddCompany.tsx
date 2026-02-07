import React, { useRef, useState } from 'react';
import AddCompanyForm from '../../components/companies/AddCompanyForm';
import SearchResultList from '../../components/companies/SearchResultList';
import SelectedCompanyPanel from '../../components/companies/SelectedCompanyPanel';
import JsonPreview from '../../components/common/JsonPreview';
import { useCompanySearch } from '../../hooks/useCompanySearch';
import { useCompanySelection } from '../../hooks/useCompanySelection';
import { confirmCompany, getCompanyOverview } from '../../api/companies';
import { CompanyConfirmResult, CompanyOverview, CompanySearchItem } from '../../types/company';

const AddCompanyPage: React.FC = () => {
  // TODO(API 연결):
  // - 더미 데이터 제거
  // - searchCompanies API 연결
  // - confirmCompany API 연결
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
      const confirmPayload = {
        companyId: selectedCompany.companyId,
        code: selectedCompany.stockCode ?? undefined,
        name: selectedCompany.corpName,
      };

      const result = await confirmCompany(confirmPayload);
      setConfirmResult(result);

      if (result.modelStatus === 'PROCESSING') {
        setCompletionMessage('분석이 진행 중입니다. 완료되면 다시 확인해 주세요.');
        // TODO(API 연결): PROCESSING 상태일 때 폴링/재요청 로직 추가
      } else {
        const cachedOverview = overviewCacheRef.current[result.companyId];
        if (cachedOverview) {
          setCompanyOverview(cachedOverview);
          setCompletionMessage('이미 불러온 기업입니다.');
        } else {
          const overview = await getCompanyOverview(result.companyId);
          overviewCacheRef.current[result.companyId] = overview;
          setCompanyOverview(overview);
          setCompletionMessage('완료: 기존 분석 결과를 불러왔습니다.');
        }
      }
    } catch (err) {
      setConfirmError('확인 단계 처리에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col gap-3">
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Companies</p>
        <h2 className="text-4xl font-light text-white serif">기업 추가 (Add Company)</h2>
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
