import { create } from "zustand";
import { anonymousLogin } from "../api/auth";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  anonymousLogin: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("yanshi_token"),
  isAuthenticated: !!localStorage.getItem("yanshi_token"),
  anonymousLogin: async () => {
    const data = await anonymousLogin();
    localStorage.setItem("yanshi_token", data.access_token);
    set({ token: data.access_token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("yanshi_token");
    set({ token: null, isAuthenticated: false });
  },
}));
