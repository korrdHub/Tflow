import { describe, it, expect } from "vitest";
import { apiClient } from "../src/api/client";

describe("MSW", () => {
  it("returns mocked anonymous token", async () => {
    const data = await apiClient.post("/auth/anonymous").then((r) => r.data);
    expect(data.access_token).toBe("mock-token");
  });
});
