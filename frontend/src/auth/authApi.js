import { apiPost, apiGet } from "../api";

export const signup = (name, email, password) =>
  apiPost("/api/auth/signup", { name, email, password });

export const login = (email, password) => apiPost("/api/auth/login", { email, password });

export const logout = () => apiPost("/api/auth/logout");

export const resendVerification = (email) => apiPost("/api/auth/resend", { email });

export const getMe = () => apiGet("/api/auth/me");
