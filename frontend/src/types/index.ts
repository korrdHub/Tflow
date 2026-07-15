export interface Token {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  mode: UserMode;
}

export type UserMode = "strict" | "moderate" | "coach";

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export type PlanStatus = "draft" | "active" | "completed" | "abandoned" | "overdue" | "archived";

export interface Plan {
  id: string;
  user_id: string;
  title: string;
  completion_standard: string;
  deadline: string;
  reminder_frequency: number;
  status: PlanStatus;
  mode?: UserMode;
  created_at: string;
  completed_at?: string;
}

export interface PlanInput {
  title: string;
  completion_standard: string;
  deadline: string;
  reminder_frequency?: number;
  mode?: UserMode;
}

export interface PlanLog {
  id: string;
  plan_id: string;
  type: "reminder" | "followup" | "escalation";
  detail: string;
  response?: "completed" | "extend" | "abandon";
  extend_hours: number;
  created_at: string;
}

export interface PlanLogInput {
  type: PlanLog["type"];
  detail?: string;
  response?: PlanLog["response"];
  extend_hours?: number;
}

export interface ReviewInput {
  completed: boolean;
  reason?: string;
  user_reflection?: string;
}

export interface Review {
  id: string;
  plan_id: string;
  date: string;
  completed: boolean;
  reason?: string;
  ai_analysis: Record<string, unknown>;
  user_reflection: string;
}

export interface ReviewAnalysis {
  total_reviews: number;
  completed_reviews: number;
  completion_rate: number;
  consecutive_completed: number;
  extend_count: number;
  suggestion: string;
}
