import type { UserMode } from "../types";

interface Props {
  open: boolean;
  title: string;
  mode: UserMode;
  onComplete: () => void;
  onExtend: () => void;
  onAbandon: () => void;
}

const MODE_COPY: Record<
  UserMode,
  { tone: string; sub: string; completeLabel: string }
> = {
  strict: {
    tone: "军令如山，不得有违",
    sub: "你的军令状「{title}」已到期，立即执行，不要找理由。",
    completeLabel: "已完成",
  },
  moderate: {
    tone: "时至当为",
    sub: "「{title}」的截止时间到了，合理收尾或申请延期。",
    completeLabel: "完成",
  },
  coach: {
    tone: "策略时刻",
    sub: "关于「{title}」，需要建议或调整计划吗？",
    completeLabel: "完成",
  },
};

export default function ReminderModal({
  open,
  title,
  mode,
  onComplete,
  onExtend,
  onAbandon,
}: Props) {
  if (!open) return null;

  const copy = MODE_COPY[mode];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full max-w-md border border-[var(--seal)] bg-[var(--ink-light)] p-8 shadow-[var(--shadow-glow)] animate-scale-in">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <span className="seal seal-filled h-14 w-14 text-base">严师</span>
        </div>

        <div className="mt-6 text-center">
          <h3 className="font-display text-2xl text-[var(--seal-light)]">
            {copy.tone}
          </h3>
          <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">
            {copy.sub.replace("{title}", title)}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={onComplete}
            className="btn btn-primary w-full"
          >
            <span>{copy.completeLabel}</span>
          </button>
          <button
            onClick={onExtend}
            className="btn btn-secondary w-full"
          >
            <span>再给 1 小时</span>
          </button>
          <button
            onClick={onAbandon}
            className="btn btn-ghost w-full text-[var(--text-muted)] hover:text-[var(--seal-light)]"
          >
            <span>放弃</span>
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
          此弹窗不可一键关闭，必须做出选择
        </p>
      </div>
    </div>
  );
}
