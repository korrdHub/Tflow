import { describe, it, expect } from "vitest";

describe("PWA manifest", () => {
  it("manifest exists and has correct name", async () => {
    const manifest = await import("../public/manifest.json");
    expect(manifest.default.name).toBe("严师APP");
    expect(manifest.default.start_url).toBe("/");
  });
});
