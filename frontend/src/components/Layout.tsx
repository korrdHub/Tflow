import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const NAV = [
  { to: "/dashboard", label: "仪表盘" },
  { to: "/plans", label: "计划管理" },
];

export default function Layout() {
  const { logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="page">
      <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--ink)]/90 backdrop-blur-sm animate-fade-in">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="group flex items-center gap-3">
            <span className="seal seal-filled h-9 w-9 text-sm">严师</span>
            <div>
              <h1 className="font-display text-xl leading-none text-[var(--paper)]">严师APP</h1>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Write plan = military pledge
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 text-sm transition-colors ${
                    active
                      ? "text-[var(--paper)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--paper)]"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="mt-1 block h-[2px] w-full bg-[var(--seal)]" />
                  )}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="ml-4 border-l border-[var(--border)] pl-4 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--seal-light)]"
            >
              退出
            </button>
          </div>
        </div>
      </nav>

      <main className="page-content">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--text-muted)]">
        严师APP · 写计划 = 立军令状
      </footer>
    </div>
  );
}
