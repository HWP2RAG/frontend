import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useConversionStore } from "../conversion-store";

describe("useConversionStore", () => {
  beforeEach(() => {
    useConversionStore.getState().reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with empty conversions", () => {
    const state = useConversionStore.getState();
    expect(state.conversions).toEqual({});
  });

  it("starts polling for a conversion id", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    useConversionStore.getState().startPolling("conv-001");

    const conv = useConversionStore.getState().conversions["conv-001"];
    expect(conv).toBeDefined();
    expect(conv.status).toBe("polling");
    expect(conv.progress).toBe(0);

    fetchSpy.mockRestore();
  });

  it("stops polling and clears timer for a conversion id", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    useConversionStore.getState().startPolling("conv-001");

    // Timer should exist
    expect(useConversionStore.getState()._timers["conv-001"]).toBeDefined();

    useConversionStore.getState().stopPolling("conv-001");

    // Timer should be cleared
    expect(useConversionStore.getState()._timers["conv-001"]).toBeUndefined();

    fetchSpy.mockRestore();
  });

  it("updates progress and stages from poll response", async () => {
    useConversionStore.getState().startPolling("conv-001");

    // Let the first poll complete
    await vi.advanceTimersByTimeAsync(2100);

    const conv = useConversionStore.getState().conversions["conv-001"];
    expect(conv.progress).toBe(100);
    expect(conv.status).toBe("completed");
    expect(conv.stages).toBeDefined();
    expect(conv.stages!.length).toBeGreaterThan(0);
  });

  it("stores result when fetched", async () => {
    useConversionStore.getState().startPolling("conv-001");
    await vi.advanceTimersByTimeAsync(2100);

    await useConversionStore.getState().fetchResult("conv-001");

    const conv = useConversionStore.getState().conversions["conv-001"];
    expect(conv.result).toBeDefined();
    expect(conv.result!.content).toContain("Sample Document");
    expect(conv.result!.format).toBe("markdown");
  });

  it("resets all conversions", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    useConversionStore.getState().startPolling("conv-001");
    useConversionStore.getState().reset();

    expect(useConversionStore.getState().conversions).toEqual({});
    fetchSpy.mockRestore();
  });
});
