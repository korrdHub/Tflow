import { useEffect } from "react";
import PlanForm from "../components/PlanForm";
import PlanList from "../components/PlanList";
import { usePlanStore } from "../stores/planStore";
import type { PlanInput } from "../types";

export default function PlansPage() {
  const { plans, loading, error, fetchPlans, addPlan, transition, clearError } = usePlanStore();

  useEffect(() => {
    fetchPlans().catch(() => {});
  }, [fetchPlans]);

  const handleCreate = async (input: PlanInput) => {
    clearError();
    await addPlan(input);
  };

  const handleTransition = async (id: string, status: Parameters<typeof transition>[1]) => {
    await transition(id, status);
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1>计划管理</h1>
        <p>立下军令状，选择你的督促模式</p>
      </header>

      {error && (
        <div className="mb-6 border border-[var(--seal)]/30 bg-[var(--seal)]/10 px-4 py-3 text-sm text-[var(--seal-light)] animate-fade-in">
          {error}
        </div>
      )}

      <div className="plans-grid">
        <PlanForm onSubmit={handleCreate} />

        <div>
          {loading && plans.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <span className="spinner h-8 w-8" />
            </div>
          ) : (
            <PlanList plans={plans} onTransition={handleTransition} />
          )}
        </div>
      </div>
    </div>
  );
}
