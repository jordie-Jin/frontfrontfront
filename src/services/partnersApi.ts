import { INITIAL_PARTNERS, getMockPartnerDetail } from '../mocks/partners.mock';
import { Partner, PartnerDetail } from '../types/partner';

const simulateDelay = async (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchPartners = async (): Promise<Partner[]> => {
  // TODO: 실제 API 연동 시 이 부분을 fetch/axios 호출로 교체하세요.
  await simulateDelay();
  return INITIAL_PARTNERS;
};

export const fetchPartnerDetail = async (id: string): Promise<PartnerDetail> => {
  // TODO: 실제 API 연동 시 이 부분을 fetch/axios 호출로 교체하세요.
  await simulateDelay();
  return getMockPartnerDetail(id);
};
