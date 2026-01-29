import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AsyncState from '../components/common/AsyncState';
import PartnerQuickViewDrawer from '../components/partners/PartnerQuickViewDrawer';
import PartnersHeader from '../components/partners/PartnersHeader';
import PartnersTable from '../components/partners/PartnersTable';
import { logout } from '../services/auth';
import { fetchPartnerDetail, fetchPartners } from '../services/partnersApi';
import { usePartnersStore } from '../store/partnersStore';
import { Partner, PartnerDetail } from '../types/partner';

const PartnersPage: React.FC = () => {
  const navigate = useNavigate();
  const { partners, setPartners } = usePartnersStore();
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [detailState, setDetailState] = useState<{
    isLoading: boolean;
    error: string | null;
    data: PartnerDetail | null;
  }>({
    isLoading: false,
    error: null,
    data: null,
  });

  const loadPartners = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchPartners();
      setPartners(response);
    } catch (err) {
      setError('협력사 목록을 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPartners();
  }, []);

  useEffect(() => {
    if (!selectedPartner) {
      setDetailState({ isLoading: false, error: null, data: null });
      return;
    }

    const fetchDetail = async () => {
      setDetailState({ isLoading: true, error: null, data: null });
      try {
        const detail = await fetchPartnerDetail(selectedPartner.id);
        setDetailState({ isLoading: false, error: null, data: detail });
      } catch (err) {
        setDetailState({ isLoading: false, error: '요약 정보를 불러오지 못했습니다.', data: null });
      }
    };

    void fetchDetail();
  }, [selectedPartner]);

  const filteredPartners = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) {
      return partners;
    }
    return partners.filter(
      (partner) =>
        partner.name.toLowerCase().includes(keyword) ||
        partner.industry.toLowerCase().includes(keyword),
    );
  }, [partners, searchValue]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PartnersHeader
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
        empty={!isLoading && !error && filteredPartners.length === 0}
        emptyMessage={searchValue ? '검색 조건에 맞는 협력사가 없습니다.' : '등록된 협력사가 없습니다.'}
        onRetry={loadPartners}
      >
        <PartnersTable partners={filteredPartners} onSelect={setSelectedPartner} />
      </AsyncState>

      <PartnerQuickViewDrawer
        isOpen={Boolean(selectedPartner)}
        detail={detailState.data}
        isLoading={detailState.isLoading}
        error={detailState.error}
        onClose={() => setSelectedPartner(null)}
      />
    </div>
  );
};

export default PartnersPage;
