export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}
