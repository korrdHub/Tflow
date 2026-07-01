interface Props {
  value: "strict" | "moderate" | "coach";
  onChange: (mode: "strict" | "moderate" | "coach") => void;
}

const MODES = [
  { key: "strict", label: "时刻提醒型", desc: "高频追问，绝不姑息" },
  { key: "moderate", label: "适当建议型", desc: "适度提醒，给出建议" },
  { key: "coach", label: "方法交流型", desc: "策略卡片，不打扰" },
] as const;

export default function ModeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {MODES.map((m) => (
        <label
          key={m.key}
          className={`cursor-pointer rounded border p-4 ${
            value === m.key ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
          }`}
        >
          <input
            type="radio"
            name="mode"
            value={m.key}
            checked={value === m.key}
            onChange={() => onChange(m.key)}
            className="sr-only"
          />
          <p className="font-semibold">{m.label}</p>
          <p className="text-sm text-gray-600">{m.desc}</p>
        </label>
      ))}
    </div>
  );
}
