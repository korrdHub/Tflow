import { create } from "zustand";
import { anonymousLogin, login, register } from "../api/auth";
import type { LoginInput, RegisterInput } from "../types";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  anonymousLogin: () => Promise<void>;
  emailLogin: (data: LoginInput) => Promise<void>;
  emailRegister: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const TOKEN_KEY = "yanshi_token";

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  loading: false,
  error: null,

  anonymousLogin: async () => {
    set({ loading: true, error: null });
    try {
      const data = await anonymousLogin();
      localStorage.setItem(TOKEN_KEY, data.access_token);
      set({ token: data.access_token, isAuthenticated: true });
    } catch (e) {
      set({ error: "匿名登录失败，请检查网络连接" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  emailLogin: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await login(payload);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      set({ token: data.access_token, isAuthenticated: true });
    } catch (e) {
      set({ error: "邮箱或密码错误" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  emailRegister: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await register(payload);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      set({ token: data.access_token, isAuthenticated: true });
    } catch (e) {
      set({ error: "注册失败，邮箱可能已被使用" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
