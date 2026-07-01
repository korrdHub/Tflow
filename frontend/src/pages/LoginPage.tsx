import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { LoginInput, RegisterInput } from "../types";

type Tab = "anonymous" | "login" | "register";

export default function LoginPage() {
  const navigate = useNavigate();
  const { anonymousLogin, emailLogin, emailRegister, loading, error, clearError } = useAuthStore();
  const [tab, setTab] = useState<Tab>("anonymous");
  const [loginData, setLoginData] = useState<LoginInput>({ username: "", password: "" });
  const [registerData, setRegisterData] = useState<RegisterInput>({
    email: "",
    password: "",
    name: "",
  });

  const handleAnonymous = async () => {
    clearError();
    try {
      await anonymousLogin();
      navigate("/dashboard");
    } catch {
      // error already in store
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await emailLogin(loginData);
      navigate("/dashboard");
    } catch {
      // error already in store
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await emailRegister(registerData);
      navigate("/dashboard");
    } catch {
      // error already in store
    }
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    clearError();
  };

  return (
    <div className="login-page page flex items-center justify-center px-4 py-12">
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="mb-8 text-center">
          <span className="seal seal-filled mx-auto mb-4 h-16 w-16 text-xl">严师</span>
          <h1 className="font-display text-4xl text-[var(--paper)]">严师APP</h1>
          <p className="mt-2 text-[var(--text-secondary)]">写计划 = 立军令状</p>
        </div>

        <div className="card overflow-hidden">
          <div className="tabs mb-6 w-full">
            <button
              onClick={() => switchTab("anonymous")}
              className={`tab flex-1 ${tab === "anonymous" ? "tab-active" : ""}`}
            >
              免注册
            </button>
            <button
              onClick={() => switchTab("login")}
              className={`tab flex-1 ${tab === "login" ? "tab-active" : ""}`}
            >
              登录
            </button>
            <button
              onClick={() => switchTab("register")}
              className={`tab flex-1 ${tab === "register" ? "tab-active" : ""}`}
            >
              注册
            </button>
          </div>

          <div className="px-6 pb-6">
            {error && (
              <div className="mb-4 border border-[var(--seal)]/30 bg-[var(--seal)]/10 px-4 py-3 text-sm text-[var(--seal-light)] animate-fade-in">
                {error}
              </div>
            )}

            {tab === "anonymous" && (
              <div className="animate-fade-in-up">
                <p className="mb-5 text-center text-sm text-[var(--text-secondary)]">
                  无需注册，立即体验核心闭环。数据可在注册后保留迁移。
                </p>
                <button
                  onClick={handleAnonymous}
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? <span className="spinner" /> : <span>匿名体验</span>}
                </button>
              </div>
            )}

            {tab === "login" && (
              <form onSubmit={handleLogin} className="animate-fade-in-up space-y-4">
                <div>
                  <label className="form-label">邮箱</label>
                  <input
                    type="email"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">密码</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full">
                  {loading ? <span className="spinner" /> : <span>登录</span>}
                </button>
              </form>
            )}

            {tab === "register" && (
              <form onSubmit={handleRegister} className="animate-fade-in-up space-y-4">
                <div>
                  <label className="form-label">昵称（可选）</label>
                  <input
                    value={registerData.name || ""}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">邮箱</label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">密码</label>
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full">
                  {loading ? <span className="spinner" /> : <span>注册</span>}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          进入即表示你准备好对自己许下承诺
        </p>
      </div>
    </div>
  );
}
