// 선택된 협력사 상태를 관리하는 훅입니다.
import { useCallback, useState } from 'react';
import { CompanySearchItem } from '../types/company';

export const useCompanySelection = () => {
  const [selectedCompany, setSelectedCompany] = useState<CompanySearchItem | null>(null);

  const selectCompany = useCallback((company: CompanySearchItem) => {
    setSelectedCompany(company);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCompany(null);
  }, []);

  return {
    selectedCompany,
    selectCompany,
    clearSelection
  };
};
