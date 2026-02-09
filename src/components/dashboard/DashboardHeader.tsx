import React from 'react';
import AdminUserSwitch from '../common/AdminUserSwitch';
import { AdminViewUser } from '../../types/adminView';

interface DashboardHeaderProps {
  onLogout?: () => void;
  userName?: string;
  showAdminSwitch?: boolean;
  adminUsers?: AdminViewUser[];
  selectedAdminUserId?: string;
  onAdminUserChange?: (userId: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onLogout,
  userName = 'id',
  showAdminSwitch = false,
  adminUsers = [],
  selectedAdminUserId,
  onAdminUserChange,
}) => {
  return (
    <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-4xl font-semibold tracking-tight text-white mb-2">관리 현황 대시보드</h2>
        <p className="text-slate-400">{userName} 님, 환영합니다.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {showAdminSwitch && onAdminUserChange && adminUsers.length > 0 && (
          <AdminUserSwitch
            users={adminUsers}
            selectedUserId={selectedAdminUserId}
            onChange={onAdminUserChange}
          />
        )}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 rounded-lg text-xs border border-white/10 text-slate-300 hover:bg-white/10 transition-all"
          >
            로그아웃
          </button>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
