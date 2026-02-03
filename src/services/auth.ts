// 인증 API 헬퍼와 로컬 사용자 저장소 로직입니다.
import {
  AuthLoginResponse,
  AuthSession,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  SignupResponse,
} from '../types/auth';
import { apiRequest } from '../api/client';

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
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

  const response = await apiRequest<AuthLoginResponse>({
    method: 'POST',
    url: '/api/auth/login',
    body: payload,
  });

  const session: AuthSession = {
    token: response.accessToken,
    user: {
      id: response.user.userId,
      email: response.user.email,
      name: response.user.name,
    },
  };

  storeSession(session);
  return session;
};

export const register = async (payload: RegisterRequest): Promise<SignupResponse> => {
  if (USE_MOCK_AUTH) {
    const session: AuthSession = {
      token: `mock-${Date.now()}`,
      user: buildMockUser(payload.email, payload.name),
    };
    storeSession(session);
    return {
      id: 0,
      uuid: session.user.id,
      email: session.user.email,
      status: 'ACTIVE',
      role: 'USER',
    };
  }

  return apiRequest<SignupResponse>({
    method: 'POST',
    url: '/api/auth/signup',
    body: payload,
  });
};

export const logout = async (): Promise<void> => {
  if (USE_MOCK_AUTH) {
    storeSession(null);
    return;
  }

  await apiRequest<void>({ method: 'POST', url: '/api/auth/logout' });
  storeSession(null);
};
