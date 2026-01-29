export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}
