// 인증 API 헬퍼와 로컬 사용자 저장소 로직입니다.
import {
  AuthLoginResponse,
  AuthSession,
  AuthUser,
  LoginRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  SignupResponse,
} from '../types/auth';
import { apiPost } from '../api/client';

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

const buildMockUser = (email: string, name?: string, role: string = 'USER'): AuthUser => ({
  id: `user-${email}`,
  email,
  name: name ?? email.split('@')[0],
  role,
});

export const getAuthToken = (): string | null => getStoredSession()?.token ?? null;

export const getStoredUser = (): AuthUser | null => getStoredSession()?.user ?? null;

export const updateStoredToken = (token: string): void => {
  const session = getStoredSession();
  if (!session) return;
  storeSession({ ...session, token });
};

export const clearStoredSession = (): void => {
  storeSession(null);
};

export const login = async (payload: LoginRequest): Promise<AuthSession> => {
  if (USE_MOCK_AUTH) {
    const session: AuthSession = {
      token: `mock-${Date.now()}`,
      user: buildMockUser(payload.email, undefined, 'USER'),
    };
    storeSession(session);
    return session;
  }

  const response = await apiPost<AuthLoginResponse, LoginRequest>('/api/auth/login', payload, {
    skipAuth: true,
  });

  const session: AuthSession = {
    token: response.accessToken,
    user: {
      id: response.user.userId,
      email: response.user.email,
      name: response.user.name,
      role: response.user.role,
    },
  };

  storeSession(session);
  return session;
};

export const register = async (payload: RegisterRequest): Promise<SignupResponse> => {
  if (USE_MOCK_AUTH) {
    const session: AuthSession = {
      token: `mock-${Date.now()}`,
      user: buildMockUser(payload.email, payload.name, 'USER'),
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

  return apiPost<SignupResponse, RegisterRequest>('/api/auth/signup', payload, {
    skipAuth: true,
  });
};

export const logout = async (): Promise<void> => {
  if (USE_MOCK_AUTH) {
    clearStoredSession();
    return;
  }

  const logoutPromise = apiPost<void, Record<string, never>>(
    '/api/auth/logout',
    {},
    { withCredentials: true }
  );
  clearStoredSession();
  await logoutPromise;
};

export const refreshAccessToken = async (
  payload: RefreshTokenRequest = {}
): Promise<RefreshTokenResponse> => {
  if (USE_MOCK_AUTH) {
    return {
      tokenType: 'Bearer',
      accessToken: `mock-refresh-${Date.now()}`,
      expiresIn: 1800,
      passwordExpired: false,
    };
  }

  return apiPost<RefreshTokenResponse, RefreshTokenRequest>('/api/auth/refresh', payload, {
    skipAuth: true,
    withCredentials: true,
  });
};
