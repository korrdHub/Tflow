import { useEffect } from "react";
import { usePlanStore } from "../stores/planStore";

export default function DashboardPage() {
  const { plans, fetchPlans } = usePlanStore();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const total = plans.length;
  const active = plans.filter((p) => p.status === "active").length;
  const completed = plans.filter((p) => p.status === "completed").length;
  const abandoned = plans.filter((p) => p.status === "abandoned").length;

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">仪表盘</h2>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded bg-white p-4 shadow">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-sm text-gray-600">总计划</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <p className="text-2xl font-bold">{active}</p>
          <p className="text-sm text-gray-600">进行中</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <p className="text-2xl font-bold">{completed}</p>
          <p className="text-sm text-gray-600">已完成</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <p className="text-2xl font-bold">{abandoned}</p>
          <p className="text-sm text-gray-600">已放弃</p>
        </div>
      </div>
      <h3 className="mb-2 font-semibold">活跃计划</h3>
      {plans.filter((p) => p.status === "active").length === 0 && (
        <p className="text-gray-500">暂无活跃计划</p>
      )}
      <ul className="space-y-2">
        {plans.filter((p) => p.status === "active").map((plan) => (
          <li key={plan.id} className="rounded bg-white p-3 shadow">
            {plan.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
