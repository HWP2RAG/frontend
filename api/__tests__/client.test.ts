// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import createClient from "openapi-fetch";
import type { paths } from "@/api/types";
import { API_BASE_URL } from "@/lib/env";

describe("API client with MSW", () => {
  let api: ReturnType<typeof createClient<paths>>;

  beforeAll(() => {
    api = createClient<paths>({ baseUrl: API_BASE_URL });
  });

  it("fetches usage info", async () => {
    const { data, error } = await api.GET("/api/usage");

    expect(error).toBeUndefined();
    expect(data).toBeDefined();
    expect(data!.used).toBe(3);
    expect(data!.limit).toBe(5);
    expect(data!.resetAt).toBe("2026-02-01T00:00:00Z");
  });

  it("fetches conversion status", async () => {
    const { data, error } = await api.GET("/api/conversions/{id}/status", {
      params: { path: { id: "conv-001" } },
    });

    expect(error).toBeUndefined();
    expect(data).toBeDefined();
    expect(data!.status).toBe("completed");
    expect(data!.progress).toBe(100);
    expect(data!.stages).toHaveLength(2);
  });
});
