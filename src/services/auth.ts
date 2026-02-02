// 인증 API 헬퍼와 로컬 사용자 저장소 로직입니다.
import { AuthSession, AuthUser, LoginRequest, RegisterRequest } from '../types/auth';

const USE_MOCK_AUTH = true;
const SESSION_STORAGE_KEY = 'sentinel.auth.session';

const getStoredSession = (): AuthSession | null => {
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
};

const storeSession = (session: AuthSession | null) => {
  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

const buildMockUser = (email: string, name?: string): AuthUser => ({
  id: `user-${email}`,
  email,
  name: name ?? email.split('@')[0],
});

export const getAuthToken = (): string | null => getStoredSession()?.token ?? null;

export const getStoredUser = (): AuthUser | null => getStoredSession()?.user ?? null;

export const login = async (payload: LoginRequest): Promise<AuthSession> => {
  if (USE_MOCK_AUTH) {
    const session: AuthSession = {
      token: `mock-${Date.now()}`,
      user: buildMockUser(payload.email),
    };
    storeSession(session);
    return session;
  }

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('로그인에 실패했습니다.');
  }

  const session = (await response.json()) as AuthSession;
  storeSession(session);
  return session;
};

export const register = async (payload: RegisterRequest): Promise<AuthSession> => {
  if (USE_MOCK_AUTH) {
    const session: AuthSession = {
      token: `mock-${Date.now()}`,
      user: buildMockUser(payload.email, payload.name),
    };
    storeSession(session);
    return session;
  }

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('회원가입에 실패했습니다.');
  }

  const session = (await response.json()) as AuthSession;
  storeSession(session);
  return session;
};

export const logout = async (): Promise<void> => {
  if (USE_MOCK_AUTH) {
    storeSession(null);
    return;
  }

  const response = await fetch('/api/auth/logout', { method: 'POST' });
  if (!response.ok) {
    throw new Error('로그아웃에 실패했습니다.');
  }
  storeSession(null);
};
