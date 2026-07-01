import { apiClient } from "./client";
import type { ReviewInput, ReviewAnalysis } from "../types";

export const createReview = (planId: string, data: ReviewInput) =>
  apiClient.post(`/plans/${planId}/reviews`, data).then((r) => r.data);

export const getReviewAnalysis = (planId: string) =>
  apiClient.get<ReviewAnalysis>(`/plans/${planId}/reviews/analysis`).then((r) => r.data);
