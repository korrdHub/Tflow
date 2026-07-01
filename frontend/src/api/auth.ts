import { apiClient } from "./client";
import type { Token, LoginInput, RegisterInput } from "../types";

export const anonymousLogin = () =>
  apiClient.post<Token>("/auth/anonymous").then((r) => r.data);

export const login = (data: LoginInput) => {
  const params = new URLSearchParams();
  params.append("username", data.username);
  params.append("password", data.password);
  return apiClient
    .post<Token>("/auth/login", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    .then((r) => r.data);
};

export const register = (data: RegisterInput) =>
  apiClient.post<Token>("/auth/register", data).then((r) => r.data);
