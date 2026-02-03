// 인증 요청/응답 타입 정의입니다.
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface AuthLoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  passwordExpired: boolean;
  user: {
    userId: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface SignupResponse {
  id: number;
  uuid: string;
  email: string;
  status: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  turnstileToken: string;
}
