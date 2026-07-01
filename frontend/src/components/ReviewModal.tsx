import { useState } from "react";

interface Props {
  open: boolean;
  planId: string;
  onSubmitted: () => void;
  onSubmit?: (data: { completed: boolean; reason?: string }) => Promise<void>;
}

export default function ReviewModal({ open, planId, onSubmitted, onSubmit }: Props) {
  const [completed, setCompleted] = useState(true);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completed && !reason.trim()) {
      setError("未完成时必须填写原因");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ completed, reason });
      }
      onSubmitted();
      setCompleted(true);
      setReason("");
    } catch {
      setError("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/80 backdrop-blur-sm animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md border border-[var(--border-strong)] bg-[var(--ink-light)] p-8 animate-scale-in"
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <span className="seal h-14 w-14 text-base">复盘</span>
        </div>

        <div className="mt-6 text-center">
          <h3 className="font-display text-2xl text-[var(--paper)]">强制复盘</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            诚实面对结果，才能持续精进
          </p>
        </div>

        <div className="mt-6 flex justify-center gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-[var(--paper)]">
            <input
              type="radio"
              name={`review-${planId}`}
              checked={completed}
              onChange={() => setCompleted(true)}
              className="h-4 w-4 accent-[var(--seal)]"
            />
            <span>完成</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[var(--paper)]">
            <input
              type="radio"
              name={`review-${planId}`}
              checked={!completed}
              onChange={() => setCompleted(false)}
              className="h-4 w-4 accent-[var(--seal)]"
            />
            <span>未完成</span>
          </label>
        </div>

        {!completed && (
          <div className="mt-5 animate-fade-in-up">
            <label className="form-label">未完成原因</label>
            <textarea
              placeholder="请如实填写原因，这是复盘分析的重要依据"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {error && <p className="form-error mt-4 text-center">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary mt-6 w-full"
        >
          {submitting ? <span className="spinner" /> : <span>提交复盘</span>}
        </button>
      </form>
    </div>
  );
}
