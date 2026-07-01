import { useState } from "react";
import ModeSelector from "./ModeSelector";
import type { PlanInput, UserMode } from "../types";

interface Props {
  onSubmit: (data: PlanInput) => Promise<void>;
}

export default function PlanForm({ onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [completionStandard, setCompletionStandard] = useState("");
  const [deadline, setDeadline] = useState("");
  const [mode, setMode] = useState<UserMode>("moderate");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        completion_standard: completionStandard,
        deadline: new Date(deadline).toISOString(),
        mode,
      });
      setTitle("");
      setCompletionStandard("");
      setDeadline("");
      setMode("moderate");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 animate-fade-in-up stagger-1">
      <div className="mb-5">
        <h3 className="font-display text-lg text-[var(--paper)]">立一份军令状</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          目标必须具体、可量化，拒绝模糊承诺
        </p>
      </div>

      <div className="mb-4">
        <label className="form-label">计划目标</label>
        <input
          placeholder="计划目标，例如：晨跑 5 公里"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label className="form-label">完成标准</label>
        <input
          placeholder="完成标准（必须可量化，如：GPS 轨迹 >= 5km）"
          value={completionStandard}
          onChange={(e) => setCompletionStandard(e.target.value)}
          required
        />
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          避免使用“我要”“尽量”等模糊词汇，系统会拒绝无法衡量的标准。
        </p>
      </div>

      <div className="mb-5">
        <label htmlFor="deadline" className="form-label">
          截止时间
        </label>
        <input
          id="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
      </div>

      <div className="mb-5">
        <label className="form-label mb-3 block">选择督促模式</label>
        <ModeSelector value={mode} onChange={setMode} />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary w-full"
      >
        {submitting ? <span className="spinner" /> : <span>创建计划</span>}
      </button>
    </form>
  );
}
