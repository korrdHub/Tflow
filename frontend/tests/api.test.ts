import { describe, it, expect } from "vitest";
import { apiClient } from "../src/api/client";

describe("apiClient", () => {
  it("has baseURL pointing to backend", () => {
    expect(apiClient.defaults.baseURL).toBe("http://localhost:8000");
  });
});
