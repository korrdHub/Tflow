import { describe, it, expect } from "vitest";
import { usePlanStore } from "../src/stores/planStore";

describe("planStore", () => {
  it("fetches plans and adds a new plan", async () => {
    await usePlanStore.getState().addPlan({
      title: "读书",
      completion_standard: "读完 1 章",
      deadline: new Date("2026-07-10T08:00:00.000Z").toISOString(),
    });
    await usePlanStore.getState().fetchPlans();
    expect(usePlanStore.getState().plans.length).toBeGreaterThan(0);
    expect(usePlanStore.getState().plans[0].title).toBe("读书");
  });
});
