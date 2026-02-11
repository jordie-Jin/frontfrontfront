import { ADMIN_VIEW_USERS } from '../mocks/adminUsers.mock';
import { getAdminUsers } from '../api/adminUsers';
import { AuthUser } from '../types/auth';
import { AdminViewUser } from '../types/adminView';

const ADMIN_VIEW_STORAGE_KEY = 'sentinel.admin.viewUser';

export const isAdminUser = (user?: AuthUser | null): boolean => {
  const role = user?.role ?? '';
  return role === 'ADMIN' || role === 'ROLE_ADMIN';
};

export const getAdminViewUsers = (): AdminViewUser[] => ADMIN_VIEW_USERS;

export const fetchAdminViewUsers = async (): Promise<AdminViewUser[]> => {
  return getAdminUsers();
};

export const getStoredAdminViewUser = (): AdminViewUser | null => {
  const raw = window.sessionStorage.getItem(ADMIN_VIEW_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminViewUser;
  } catch {
    return null;
  }
};

export const setStoredAdminViewUser = (user: AdminViewUser | null) => {
  if (!user) {
    window.sessionStorage.removeItem(ADMIN_VIEW_STORAGE_KEY);
    return;
  }
  window.sessionStorage.setItem(ADMIN_VIEW_STORAGE_KEY, JSON.stringify(user));
};

export const resolveAdminViewUserId = (
  isAdmin: boolean,
  adminViewUser: AdminViewUser | null,
): string | undefined => {
  if (!isAdmin || !adminViewUser) return undefined;
  return String(adminViewUser.id);
};
