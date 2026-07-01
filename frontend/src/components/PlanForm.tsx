import { useState } from "react";
import type { PlanInput } from "../types";

interface Props {
  onSubmit: (data: PlanInput) => void;
}

export default function PlanForm({ onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [completionStandard, setCompletionStandard] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, completion_standard: completionStandard, deadline: new Date(deadline).toISOString() });
    setTitle("");
    setCompletionStandard("");
    setDeadline("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded bg-white p-4 shadow">
      <div className="mb-4">
        <input
          placeholder="计划目标"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
      </div>
      <div className="mb-4">
        <input
          placeholder="完成标准（必须可量化，如：GPS >= 5km）"
          value={completionStandard}
          onChange={(e) => setCompletionStandard(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="deadline" className="block text-sm text-gray-600">截止时间</label>
        <input
          id="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
      </div>
      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">创建计划</button>
    </form>
  );
}
