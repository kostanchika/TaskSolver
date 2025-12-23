import axios from "../axios";
import {
  AuthResponse,
  RegisterViaPasswordRequest,
  LoginViaPasswordRequest,
  ChangeEmailRequest,
  ConfirmEmailRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
} from "./types";

const api = axios.create({
  baseURL: axios.defaults.baseURL + "/api/auth",
  withCredentials: true,
});

// API methods
export const authApi = {
  register(data: RegisterViaPasswordRequest) {
    return api.post<AuthResponse>("/register", data);
  },

  login(data: LoginViaPasswordRequest) {
    return api.post<AuthResponse>("/login", data);
  },

  changeEmail(data: ChangeEmailRequest) {
    return api.patch("/auth", data);
  },

  requestEmailConfirmation() {
    return api.post("/request-email-confirmation");
  },

  confirmEmail(data: ConfirmEmailRequest) {
    return api.post("/confirm-email", data);
  },

  requestPasswordReset(data: RequestPasswordResetRequest) {
    return api.post("/request-password-reset", data);
  },

  resetPassword(data: ResetPasswordRequest) {
    return api.patch("/reset-password", data);
  },

  signinGithub() {
    window.location.href = api.defaults.baseURL + "/signin-github";
    return api.get("/signin-github");
  },

  signinGoogle() {
    window.location.href = api.defaults.baseURL + "/signin-google";
    return api.get("/signin-google");
  },
};
