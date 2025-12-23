export interface AuthResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  role: string;
}

export interface RegisterViaPasswordRequest {
  email?: string;
  password?: string;
}

export interface LoginViaPasswordRequest {
  email?: string;
  password?: string;
}

export interface ChangeEmailRequest {
  email?: string;
}

export interface ConfirmEmailRequest {
  email?: string;
  code?: string;
}

export interface RequestPasswordResetRequest {
  email?: string;
}

export interface ResetPasswordRequest {
  email?: string;
  code?: string;
  password?: string;
}
