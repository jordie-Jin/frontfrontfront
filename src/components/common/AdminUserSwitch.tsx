import React from 'react';
import { AdminViewUser } from '../../types/adminView';

interface AdminUserSwitchProps {
  users: AdminViewUser[];
  selectedUserId?: string | number;
  onChange: (userId: string) => void;
}

const AdminUserSwitch: React.FC<AdminUserSwitchProps> = ({
  users,
  selectedUserId,
  onChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">사용자 보기</div>
      <select
        value={selectedUserId !== undefined ? String(selectedUserId) : ''}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none"
      >
        <option value="" disabled>
          사용자 선택
        </option>
        {users.map((user) => (
          <option key={String(user.id)} value={String(user.id)} className="bg-slate-900 text-slate-100">
            {user.name} · {user.email}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AdminUserSwitch;
