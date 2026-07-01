import { describe, it, expect } from "vitest";
import { useAuthStore } from "../src/stores/authStore";

describe("authStore", () => {
  it("logs in anonymously and stores token", async () => {
    await useAuthStore.getState().anonymousLogin();
    expect(useAuthStore.getState().token).toBe("mock-token");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
