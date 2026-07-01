import { useState } from "react";
import { createReview } from "../api/review";

interface Props {
  open: boolean;
  planId: string;
  onSubmitted: () => void;
}

export default function ReviewModal({ open, planId, onSubmitted }: Props) {
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
      await createReview(planId, { completed, reason });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold">强制复盘</h3>
        <div className="mb-4 flex gap-4">
          <label className="flex items-center gap-1">
            <input type="radio" checked={completed} onChange={() => setCompleted(true)} />
            完成
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" checked={!completed} onChange={() => setCompleted(false)} />
            未完成
          </label>
        </div>
        {!completed && (
          <div className="mb-4">
            <textarea
              placeholder="原因"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
        )}
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-blue-600 py-2 text-white disabled:opacity-50"
        >
          提交复盘
        </button>
      </form>
    </div>
  );
}
