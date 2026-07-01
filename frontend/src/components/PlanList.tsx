import type { Plan } from "../types";

interface Props {
  plans: Plan[];
}

export default function PlanList({ plans }: Props) {
  if (plans.length === 0) {
    return <p className="text-gray-500">暂无计划，创建一个吧</p>;
  }
  return (
    <ul className="space-y-3">
      {plans.map((plan) => (
        <li key={plan.id} className="rounded bg-white p-4 shadow">
          <h3 className="text-lg font-semibold">{plan.title}</h3>
          <p className="text-sm text-gray-600">完成标准：{plan.completion_standard}</p>
          <p className="text-sm text-gray-600">截止：{new Date(plan.deadline).toLocaleString()}</p>
          <span className="inline-block rounded bg-gray-200 px-2 py-1 text-xs">{plan.status}</span>
        </li>
      ))}
    </ul>
  );
}
