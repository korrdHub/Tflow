export interface Token {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  mode: "strict" | "moderate" | "coach";
}

export interface Plan {
  id: string;
  user_id: string;
  title: string;
  completion_standard: string;
  deadline: string;
  reminder_frequency: number;
  status: "draft" | "active" | "completed" | "abandoned" | "overdue" | "archived";
  created_at: string;
  completed_at?: string;
}

export interface PlanInput {
  title: string;
  completion_standard: string;
  deadline: string;
  reminder_frequency?: number;
}

export interface ReviewInput {
  completed: boolean;
  reason?: string;
  user_reflection?: string;
}

export interface ReviewAnalysis {
  total_reviews: number;
  completed_reviews: number;
  completion_rate: number;
  consecutive_completed: number;
  extend_count: number;
  suggestion: string;
}
