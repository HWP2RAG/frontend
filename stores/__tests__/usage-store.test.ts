import { describe, it, expect, beforeEach } from "vitest";
import { useUsageStore } from "../usage-store";

describe("useUsageStore", () => {
  beforeEach(() => {
    useUsageStore.getState().reset();
  });

  it("initializes with default values", () => {
    const state = useUsageStore.getState();
    expect(state.used).toBe(0);
    expect(state.limit).toBe(5);
    expect(state.loading).toBe(false);
  });

  it("fetches usage data", async () => {
    await useUsageStore.getState().fetchUsage();

    const state = useUsageStore.getState();
    expect(state.used).toBe(3);
    expect(state.limit).toBe(5);
    expect(state.resetAt).toBe("2026-02-01T00:00:00Z");
    expect(state.loading).toBe(false);
  });

  it("sets loading true while fetching", async () => {
    const promise = useUsageStore.getState().fetchUsage();
    expect(useUsageStore.getState().loading).toBe(true);

    await promise;
    expect(useUsageStore.getState().loading).toBe(false);
  });

  it("resets state", async () => {
    await useUsageStore.getState().fetchUsage();
    useUsageStore.getState().reset();

    const state = useUsageStore.getState();
    expect(state.used).toBe(0);
    expect(state.loading).toBe(false);
  });
});
