import { create } from "zustand";
import { listPlans, createPlan, deletePlan, transitionPlan } from "../api/plans";
import type { Plan, PlanInput, PlanStatus } from "../types";

interface PlanState {
  plans: Plan[];
  loading: boolean;
  error: string | null;
  fetchPlans: () => Promise<void>;
  addPlan: (input: PlanInput) => Promise<void>;
  removePlan: (id: string) => Promise<void>;
  transition: (id: string, status: PlanStatus) => Promise<void>;
  clearError: () => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  loading: false,
  error: null,

  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const plans = await listPlans();
      set({ plans, loading: false });
    } catch (e) {
      set({ error: "获取计划失败", loading: false });
      throw e;
    }
  },

  addPlan: async (input) => {
    try {
      const plan = await createPlan(input);
      set({ plans: [plan, ...get().plans], error: null });
    } catch (e) {
      set({ error: "创建计划失败，请检查完成标准是否具体可量化" });
      throw e;
    }
  },

  removePlan: async (id) => {
    try {
      await deletePlan(id);
      set({ plans: get().plans.filter((p) => p.id !== id), error: null });
    } catch (e) {
      set({ error: "删除计划失败" });
      throw e;
    }
  },

  transition: async (id, status) => {
    try {
      await transitionPlan(id, status);
      const plans = get().plans.map((p) =>
        p.id === id ? { ...p, status } : p
      );
      set({ plans, error: null });
    } catch (e) {
      set({ error: "状态更新失败" });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));
