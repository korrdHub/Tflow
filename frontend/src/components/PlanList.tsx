import { useState } from "react";
import ReminderModal from "./ReminderModal";
import ReviewModal from "./ReviewModal";
import { trackPlan } from "../api/tracking";
import { createReview } from "../api/review";
import type { Plan, UserMode } from "../types";

interface Props {
  plans: Plan[];
  onTransition?: (id: string, status: Plan["status"]) => void;
}

const MODE_LABELS: Record<UserMode, string> = {
  strict: "时刻提醒型",
  moderate: "适当建议型",
  coach: "方法交流型",
};

const STATUS_CONFIG: Record<
  Plan["status"],
  { label: string; cls: string }
> = {
  draft: { label: "草稿", cls: "status-badge bg-[var(--ink-lighter)] text-[var(--text-muted)]" },
  active: { label: "进行中", cls: "status-active" },
  completed: { label: "已完成", cls: "status-completed" },
  abandoned: { label: "已放弃", cls: "status-abandoned" },
  overdue: { label: "已逾期", cls: "status-abandoned" },
  archived: { label: "已归档", cls: "status-badge bg-[var(--ink-lighter)] text-[var(--text-muted)]" },
};

export default function PlanList({ plans, onTransition }: Props) {
  const [reminderPlan, setReminderPlan] = useState<Plan | null>(null);
  const [reviewPlan, setReviewPlan] = useState<Plan | null>(null);

  const handleComplete = async () => {
    if (!reminderPlan) return;
    await trackPlan(reminderPlan.id, {
      type: "followup",
      response: "completed",
    });
    await onTransition?.(reminderPlan.id, "completed");
    setReminderPlan(null);
  };

  const handleExtend = async () => {
    if (!reminderPlan) return;
    await trackPlan(reminderPlan.id, {
      type: "followup",
      response: "extend",
      extend_hours: 1,
    });
    setReminderPlan(null);
  };

  const handleAbandon = async () => {
    if (!reminderPlan) return;
    await trackPlan(reminderPlan.id, {
      type: "followup",
      response: "abandon",
    });
    await onTransition?.(reminderPlan.id, "abandoned");
    setReminderPlan(null);
  };

  const handleReviewSubmit = async (data: { completed: boolean; reason?: string }) => {
    if (!reviewPlan) return;
    await createReview(reviewPlan.id, data);
    if (data.completed) {
      await onTransition?.(reviewPlan.id, "completed");
    }
    setReviewPlan(null);
  };

  if (plans.length === 0) {
    return (
      <div className="empty-state card animate-fade-in-up stagger-2">
        <div className="empty-state-icon">📜</div>
        <p>暂无计划，立下第一份军令状吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in-up stagger-2">
      {plans.map((plan, idx) => (
        <div
          key={plan.id}
          className="card p-5"
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={STATUS_CONFIG[plan.status].cls}>
                  {STATUS_CONFIG[plan.status].label}
                </span>
                <span className="rounded bg-[var(--ink-lighter)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                  {MODE_LABELS[plan.mode || "moderate"]}
                </span>
              </div>
              <h3 className="font-display text-xl text-[var(--paper)]">{plan.title}</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                完成标准：{plan.completion_standard}
              </p>
              <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">
                截止：{new Date(plan.deadline).toLocaleString("zh-CN")}
              </p>
            </div>

            {plan.status === "active" && (
              <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                <button
                  onClick={() => setReminderPlan(plan)}
                  className="btn btn-secondary text-sm"
                >
                  <span>严师提醒</span>
                </button>
                <button
                  onClick={() => setReviewPlan(plan)}
                  className="btn btn-primary text-sm"
                >
                  <span>强制复盘</span>
                </button>
                <button
                  onClick={() => onTransition?.(plan.id, "abandoned")}
                  className="btn btn-ghost text-sm"
                >
                  <span>放弃</span>
                </button>
              </div>
            )}

            {plan.status === "completed" && (
              <div className="flex items-center gap-2">
                <span className="seal seal-filled animate-stamp">完成</span>
              </div>
            )}

            {plan.status === "abandoned" && (
              <div className="flex items-center gap-2">
                <span className="seal">放弃</span>
              </div>
            )}
          </div>
        </div>
      ))}

      <ReminderModal
        open={!!reminderPlan}
        title={reminderPlan?.title || ""}
        mode={(reminderPlan?.mode as UserMode) || "moderate"}
        onComplete={handleComplete}
        onExtend={handleExtend}
        onAbandon={handleAbandon}
      />

      <ReviewModal
        open={!!reviewPlan}
        planId={reviewPlan?.id || ""}
        onSubmitted={() => setReviewPlan(null)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
