import { apiClient } from "./client";
import type { Plan, PlanInput } from "../types";

export const listPlans = () => apiClient.get<Plan[]>("/plans").then((r) => r.data);

export const createPlan = (data: PlanInput) =>
  apiClient.post<Plan>("/plans", data).then((r) => r.data);

export const updatePlan = (id: string, data: Partial<PlanInput>) =>
  apiClient.put<Plan>(`/plans/${id}`, data).then((r) => r.data);

export const deletePlan = (id: string) => apiClient.delete(`/plans/${id}`);

export const transitionPlan = (id: string, newStatus: Plan["status"]) =>
  apiClient.post(`/plans/${id}/transition`, null, { params: { new_status: newStatus } }).then((r) => r.data);
