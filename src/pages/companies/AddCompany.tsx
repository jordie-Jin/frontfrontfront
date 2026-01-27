import React, { useState } from 'react';
import AddCompanyForm from '../../components/companies/AddCompanyForm';
import SearchResultList from '../../components/companies/SearchResultList';
import SelectedCompanyPanel from '../../components/companies/SelectedCompanyPanel';
import JsonPreview from '../../components/common/JsonPreview';
import { useCompanySearch } from '../../hooks/useCompanySearch';
import { useCompanySelection } from '../../hooks/useCompanySelection';
import { getCompanyDetail } from '../../services/companies';
import { runModel } from '../../services/model';
import { CompanyDetail, CompanySearchItem } from '../../types/company';
import { ModelRunRequest, ModelRunResponse } from '../../types/model';

const AddCompanyPage: React.FC = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [companyDetail, setCompanyDetail] = useState<CompanyDetail | null>(null);
  const [modelRequest, setModelRequest] = useState<ModelRunRequest | null>(null);
  const [modelResponse, setModelResponse] = useState<ModelRunResponse | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const { items, total, isLoading, error, hasSearched, search, clear } = useCompanySearch();
  const { selectedCompany, selectCompany, clearSelection } = useCompanySelection();

  const resetConfirmation = () => {
    setConfirmError(null);
    setCompletionMessage(null);
    setCompanyDetail(null);
    setModelRequest(null);
    setModelResponse(null);
  };

  const handleSearch = async () => {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();

    if (!trimmedName && !trimmedCode) {
      setValidationMessage('검색할 기업명 또는 기업코드를 입력해 주세요.');
      return;
    }

    setValidationMessage(null);
    clearSelection();
    resetConfirmation();
    await search({ name: trimmedName, code: trimmedCode });
  };

  const handleReset = () => {
    setName('');
    setCode('');
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
      const detail = await getCompanyDetail(selectedCompany.companyId);
      const requestPayload: ModelRunRequest = {
        companyId: detail.companyId,
        companyName: detail.name,
        requestId: `req-${Date.now().toString(36)}`,
        scenario: 'baseline',
        horizonMonths: 12,
        requestedBy: 'admin@sentinel.ai'
      };
      const responsePayload = await runModel(requestPayload);

      setCompanyDetail(detail);
      setModelRequest(requestPayload);
      setModelResponse(responsePayload);
      setCompletionMessage('완료: 모델 요청이 큐에 등록되었습니다.');

      console.log('Company detail:', detail);
      console.log('Model run request:', requestPayload);
      console.log('Model run response:', responsePayload);
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
          name={name}
          code={code}
          onNameChange={setName}
          onCodeChange={setCode}
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

      {(companyDetail || modelRequest || modelResponse) && (
        <div className="grid gap-4 lg:grid-cols-3">
          {companyDetail && <JsonPreview title="Company Detail" data={companyDetail} />}
          {modelRequest && <JsonPreview title="Model Run Request" data={modelRequest} />}
          {modelResponse && <JsonPreview title="Model Run Response" data={modelResponse} />}
        </div>
      )}
    </div>
  );
};

export default AddCompanyPage;
