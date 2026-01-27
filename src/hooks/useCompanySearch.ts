import { useCallback, useState } from 'react';
import { searchCompanies } from '../services/companies';
import { CompanySearchItem } from '../types/company';

type SearchParams = {
  name: string;
  code: string;
};

export const useCompanySearch = () => {
  const [items, setItems] = useState<CompanySearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async ({ name, code }: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await searchCompanies({
        name: name.trim() ? name.trim() : undefined,
        code: code.trim() ? code.trim() : undefined
      });
      setItems(response.items);
      setTotal(response.total);
    } catch (err) {
      setError('검색 실패');
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setTotal(0);
    setError(null);
    setHasSearched(false);
  }, []);

  return {
    items,
    total,
    isLoading,
    error,
    hasSearched,
    search,
    clear
  };
};
