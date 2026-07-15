import { useEffect } from "react";
import { Link } from "react-router-dom";
import { usePlanStore } from "../stores/planStore";

interface StatCardProps {
  value: number;
  label: string;
  accent?: "gold" | "seal" | "paper" | "muted";
  delay?: number;
}

const ACCENT_MAP = {
  gold: "text-[var(--gold)] border-[var(--gold)]/20",
  seal: "text-[var(--seal-light)] border-[var(--seal)]/20",
  paper: "text-[var(--paper)] border-[var(--border-strong)]",
  muted: "text-[var(--text-muted)] border-[var(--border)]",
};

function StatCard({ value, label, accent = "paper", delay = 0 }: StatCardProps) {
  return (
    <div
      className={`card flex flex-col items-center justify-center border p-5 text-center animate-fade-in-up ${ACCENT_MAP[accent]}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="font-mono text-3xl font-semibold">{value}</span>
      <span className="mt-1 text-sm text-[var(--text-secondary)]">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { plans, loading, fetchPlans } = usePlanStore();

  useEffect(() => {
    fetchPlans().catch(() => {});
  }, [fetchPlans]);

  const total = plans.length;
  const active = plans.filter((p) => p.status === "active").length;
  const completed = plans.filter((p) => p.status === "completed").length;
  const abandoned = plans.filter((p) => p.status === "abandoned").length;
  const activePlans = plans.filter((p) => p.status === "active");

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1>仪表盘</h1>
        <p>今日军令状执行情况总览</p>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="spinner h-8 w-8" />
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard value={total} label="总计划" accent="paper" delay={0} />
            <StatCard value={active} label="进行中" accent="gold" delay={0.05} />
            <StatCard value={completed} label="已完成" accent="seal" delay={0.1} />
            <StatCard value={abandoned} label="已放弃" accent="muted" delay={0.15} />
          </div>

          <section className="animate-fade-in-up stagger-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl text-[var(--paper)]">活跃计划</h2>
              <Link
                to="/plans"
                className="btn btn-secondary px-4 py-2 text-sm"
              >
                <span>管理计划</span>
              </Link>
            </div>

            {activePlans.length === 0 ? (
              <div className="empty-state card">
                <div className="empty-state-icon">🎯</div>
                <p>暂无活跃计划</p>
                <Link
                  to="/plans"
                  className="btn btn-primary mt-4 px-6 py-2 text-sm"
                >
                  <span>立下军令状</span>
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {activePlans.map((plan, idx) => (
                  <li
                    key={plan.id}
                    className="card flex items-center justify-between p-4 animate-fade-in-up"
                    style={{ animationDelay: `${0.2 + idx * 0.05}s` }}
                  >
                    <div>
                      <h3 className="font-display text-lg text-[var(--paper)]">
                        {plan.title}
                      </h3>
                      <p className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">
                        {new Date(plan.deadline).toLocaleString("zh-CN")}
                      </p>
                    </div>
                    <span className="status-active">进行中</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
