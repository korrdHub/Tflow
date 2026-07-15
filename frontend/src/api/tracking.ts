import { apiClient } from "./client";
import type { PlanLog, PlanLogInput } from "../types";

export const trackPlan = (planId: string, data: PlanLogInput) =>
  apiClient.post<PlanLog>(`/plans/${planId}/track`, data).then((r) => r.data);

export const listLogs = (planId: string) =>
  apiClient.get<PlanLog[]>(`/plans/${planId}/logs`).then((r) => r.data);
