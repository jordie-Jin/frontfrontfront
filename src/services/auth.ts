// 인증 API 헬퍼와 로컬 사용자 저장소 로직입니다.
import {
  AuthLoginResponse,
  AuthSession,
  AuthUser,
  LoginRequest,
  RefreshTokenResponse,
  RegisterRequest,
  SignupResponse,
} from '../types/auth';
import { apiPost } from '../api/client';

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
const SESSION_STORAGE_KEY = 'sentinel.auth.session';

const getStoredSession = (): AuthSession | null => {
  const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
};

const storeSession = (session: AuthSession | null) => {
  if (!session) {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

const buildMockUser = (email: string, name?: string): AuthUser => ({
  id: `user-${email}`,
  email,
  name: name ?? email.split('@')[0],
});

export const getAuthToken = (): string | null => getStoredSession()?.token ?? null;

export const getStoredUser = (): AuthUser | null => getStoredSession()?.user ?? null;

export const updateStoredToken = (token: string) => {
  const current = getStoredSession();
  if (!current) return;
  storeSession({ ...current, token });
};

export const clearStoredSession = () => {
  storeSession(null);
};

const resolveBaseUrl = () => (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

const buildUrl = (path: string): string => {
  const baseUrl = resolveBaseUrl();
  return path.startsWith('http') ? path : `${baseUrl}${path}`;
};

const isApiResponse = (payload: unknown): payload is { success: boolean; data: unknown } => {
  if (typeof payload !== 'object' || payload === null) return false;
  const record = payload as Record<string, unknown>;
  return typeof record.success === 'boolean' && 'data' in record;
};

export const refreshAccessToken = async (): Promise<RefreshTokenResponse> => {
  if (USE_MOCK_AUTH) {
    const token = `mock-${Date.now()}`;
    updateStoredToken(token);
    return {
      tokenType: 'Bearer',
      accessToken: token,
      expiresIn: 3600,
      passwordExpired: false,
    };
  }

  const response = await fetch(buildUrl('/api/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error('Token refresh failed');
  }

  const payload = (await response.json()) as unknown;
  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  if (isApiResponse(payload)) {
    return payload.data as RefreshTokenResponse;
  }

  return payload as RefreshTokenResponse;
};

export const login = async (payload: LoginRequest): Promise<AuthSession> => {
  if (USE_MOCK_AUTH) {
    const session: AuthSession = {
      token: `mock-${Date.now()}`,
      user: buildMockUser(payload.email),
    };
    storeSession(session);
    return session;
  }

  const response = await apiPost<AuthLoginResponse, LoginRequest>('/api/auth/login', payload);

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

  return apiPost<SignupResponse, RegisterRequest>('/api/auth/signup', payload);
};

export const logout = async (): Promise<void> => {
  if (USE_MOCK_AUTH) {
    clearStoredSession();
    return;
  }

  await apiPost<void, Record<string, never>>('/api/auth/logout', {});
  clearStoredSession();
};
