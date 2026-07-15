import type { UserMode } from "../types";

interface Props {
  value: UserMode;
  onChange: (mode: UserMode) => void;
}

const MODES: { key: UserMode; label: string; subtitle: string; desc: string }[] = [
  {
    key: "strict",
    label: "时刻提醒型",
    subtitle: "STRICT",
    desc: "高频追问，绝不姑息，适合亟需推动力的任务",
  },
  {
    key: "moderate",
    label: "适当建议型",
    subtitle: "MODERATE",
    desc: "适度提醒并给出建议，平衡执行与空间",
  },
  {
    key: "coach",
    label: "方法交流型",
    subtitle: "COACH",
    desc: "策略卡片式交流，不打扰，注重方法论",
  },
];

export default function ModeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {MODES.map((m) => {
        const selected = value === m.key;
        return (
          <label
            key={m.key}
            className={`group relative cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border p-5 transition-all duration-300 ${
              selected
                ? "border-[var(--seal)] bg-[var(--seal)]/10 shadow-[var(--shadow-glow)]"
                : "border-[var(--border)] bg-[var(--ink-light)] hover:border-[var(--border-strong)]"
            }`}
          >
            <input
              type="radio"
              name="mode"
              value={m.key}
              checked={selected}
              onChange={() => onChange(m.key)}
              className="sr-only"
            />
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className={`font-display text-lg ${selected ? "text-[var(--paper)]" : "text-[var(--text-secondary)]"}`}>
                  {m.label}
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-[0.15em] text-[var(--text-muted)]">
                  {m.subtitle}
                </p>
              </div>
              {selected && <span className="seal seal-filled h-8 w-8 text-xs">已选</span>}
            </div>
            <p className={`text-sm leading-relaxed ${selected ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}`}>
              {m.desc}
            </p>
            {selected && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full animate-[inkSpread_0.4s_ease_forwards] bg-[var(--seal)]" />
            )}
          </label>
        );
      })}
    </div>
  );
}
