interface Props {
  open: boolean;
  title: string;
  mode: "strict" | "moderate" | "coach";
  onComplete: () => void;
  onExtend: () => void;
  onAbandon: () => void;
}

export default function ReminderModal({ open, title, mode, onComplete, onExtend, onAbandon }: Props) {
  if (!open) return null;

  const tone = {
    strict: "军令状必须完成！",
    moderate: "别忘了你的计划哦。",
    coach: "遇到困难了吗？需要建议吗？",
  }[mode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-2 text-lg font-bold">严师提醒</h3>
        <p className="mb-4 text-gray-700">
          {tone} 「{title}」
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={onComplete} className="rounded bg-green-600 py-2 text-white">完成</button>
          <button onClick={onExtend} className="rounded bg-yellow-500 py-2 text-white">再给 1 小时</button>
          <button onClick={onAbandon} className="rounded bg-red-600 py-2 text-white">放弃</button>
        </div>
      </div>
    </div>
  );
}
