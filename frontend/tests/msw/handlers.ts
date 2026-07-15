import { http, HttpResponse } from "msw";
import type { Plan, PlanLog, Token } from "../../src/types";

let plans: Plan[] = [];

export const handlers = [
  http.post("/auth/anonymous", () => {
    return HttpResponse.json<Token>({ access_token: "mock-token", token_type: "bearer" });
  }),

  http.post("/auth/login", () => {
    return HttpResponse.json<Token>({ access_token: "mock-token", token_type: "bearer" });
  }),

  http.post("/auth/register", () => {
    return HttpResponse.json<Token>({ access_token: "mock-token", token_type: "bearer" });
  }),

  http.get("/plans", () => HttpResponse.json(plans)),

  http.post("/plans", async ({ request }) => {
    const body = (await request.json()) as Omit<Plan, "id" | "user_id" | "status" | "created_at">;
    const plan: Plan = {
      id: `plan-${plans.length + 1}`,
      user_id: "user-1",
      status: "active",
      created_at: new Date().toISOString(),
      ...body,
      reminder_frequency: body.reminder_frequency ?? 60,
    };
    plans.push(plan);
    return HttpResponse.json(plan, { status: 201 });
  }),

  http.delete("/plans/:id", ({ params }) => {
    plans = plans.filter((p) => p.id !== params.id);
    return HttpResponse.json({ ok: true });
  }),

  http.post("/plans/:id/transition", async ({ params, request }) => {
    const url = new URL(request.url);
    const newStatus = url.searchParams.get("new_status") as Plan["status"];
    const plan = plans.find((p) => p.id === params.id);
    if (plan) {
      plan.status = newStatus;
      if (newStatus === "completed") {
        plan.completed_at = new Date().toISOString();
      }
    }
    return HttpResponse.json(plan);
  }),

  http.post("/plans/:id/track", async ({ request }) => {
    const body = (await request.json()) as PlanLog;
    return HttpResponse.json({ id: "log-1", plan_id: "plan-1", ...body }, { status: 201 });
  }),

  http.post("/plans/:id/reviews", async ({ request }) => {
    const body = (await request.json()) as { completed: boolean; reason?: string };
    if (!body.completed && !body.reason) {
      return HttpResponse.json({ detail: "Reason required" }, { status: 422 });
    }
    return HttpResponse.json({ id: "review-1", plan_id: "plan-1", ...body }, { status: 201 });
  }),

  http.get("/plans/:id/reviews/analysis", () =>
    HttpResponse.json({
      total_reviews: 1,
      completed_reviews: 0,
      completion_rate: 0,
      consecutive_completed: 0,
      extend_count: 1,
      suggestion: "Try to finish the next one on time.",
    })
  ),
];
