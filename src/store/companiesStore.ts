// 협력사 데이터를 관리하는 상태 스토어입니다.
import { useSyncExternalStore } from 'react';
import { INITIAL_COMPANIES } from '../mocks/companies.mock';
import { CompanySummary } from '../types/company';

const STORAGE_KEY = 'sentinel.companies';

const loadStoredCompanies = (): CompanySummary[] => {
  if (typeof window === 'undefined') return INITIAL_COMPANIES;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return INITIAL_COMPANIES;
  try {
    const parsed = JSON.parse(raw) as CompanySummary[];
    return parsed.length ? parsed : INITIAL_COMPANIES;
  } catch (err) {
    return INITIAL_COMPANIES;
  }
};

let companiesState: CompanySummary[] = loadStoredCompanies();

const saveCompanies = (companies: CompanySummary[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
};

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setCompanies = (next: CompanySummary[]) => {
  companiesState = next;
  saveCompanies(companiesState);
  listeners.forEach((listener) => listener());
};

const getSnapshot = () => companiesState;

export const useCompaniesStore = () => {
  const companies = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { companies, setCompanies };
};
