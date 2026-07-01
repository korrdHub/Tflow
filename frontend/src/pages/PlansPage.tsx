import { useEffect } from "react";
import PlanForm from "../components/PlanForm";
import PlanList from "../components/PlanList";
import { usePlanStore } from "../stores/planStore";
import type { PlanInput } from "../types";

export default function PlansPage() {
  const { plans, loading, fetchPlans, addPlan } = usePlanStore();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreate = async (input: PlanInput) => {
    await addPlan(input);
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">计划管理</h2>
      <PlanForm onSubmit={handleCreate} />
      {loading ? <p>加载中...</p> : <PlanList plans={plans} />}
    </div>
  );
}
