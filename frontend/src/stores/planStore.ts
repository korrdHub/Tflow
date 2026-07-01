import { create } from "zustand";
import { listPlans, createPlan, deletePlan } from "../api/plans";
import type { Plan, PlanInput } from "../types";

interface PlanState {
  plans: Plan[];
  loading: boolean;
  fetchPlans: () => Promise<void>;
  addPlan: (input: PlanInput) => Promise<void>;
  removePlan: (id: string) => Promise<void>;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  loading: false,
  fetchPlans: async () => {
    set({ loading: true });
    const plans = await listPlans();
    set({ plans, loading: false });
  },
  addPlan: async (input) => {
    const plan = await createPlan(input);
    set({ plans: [plan, ...get().plans] });
  },
  removePlan: async (id) => {
    await deletePlan(id);
    set({ plans: get().plans.filter((p) => p.id !== id) });
  },
}));
