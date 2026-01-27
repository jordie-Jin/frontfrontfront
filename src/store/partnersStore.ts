import { useSyncExternalStore } from 'react';
import { INITIAL_PARTNERS } from '../mocks/partners.mock';
import { Partner } from '../types/partner';

const STORAGE_KEY = 'sentinel.partners';

const listeners = new Set<() => void>();

const loadStoredPartners = (): Partner[] => {
  if (typeof window === 'undefined') {
    return INITIAL_PARTNERS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_PARTNERS;
    }
    const parsed = JSON.parse(raw) as Partner[];
    return Array.isArray(parsed) && parsed.length ? parsed : INITIAL_PARTNERS;
  } catch {
    return INITIAL_PARTNERS;
  }
};

let partnersState: Partner[] = loadStoredPartners();

const savePartners = (partners: Partner[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(partners));
};

const notify = () => {
  listeners.forEach((listener) => listener());
};

export const setPartners = (next: Partner[]) => {
  partnersState = next;
  savePartners(partnersState);
  notify();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => partnersState;

export const usePartnersStore = () => {
  const partners = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { partners, setPartners };
};
