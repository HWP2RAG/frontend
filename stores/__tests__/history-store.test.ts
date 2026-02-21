import { describe, it, expect, beforeEach, vi } from "vitest";
import { useHistoryStore } from "../history-store";
import { useAuthStore } from "../auth-store";

describe("useHistoryStore", () => {
  beforeEach(() => {
    useHistoryStore.getState().reset();
    // Set up a mock authenticated user
    useAuthStore.setState({
      token: "mock-jwt-token-abc123",
      user: { id: "user-001", email: "test@example.com", name: "홍길동" },
      isLoggedIn: true,
      hydrated: true,
    });
  });

  it("initializes with empty items and page 1", () => {
    const state = useHistoryStore.getState();
    expect(state.items).toEqual([]);
    expect(state.page).toBe(1);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("fetches history and populates items", async () => {
    await useHistoryStore.getState().fetchHistory();
    const state = useHistoryStore.getState();
    expect(state.items.length).toBeGreaterThan(0);
    expect(state.totalCount).toBeGreaterThan(0);
    expect(state.loading).toBe(false);
  });

  it("sets error when no auth token", async () => {
    useAuthStore.setState({ token: null, user: null, isLoggedIn: false });
    await useHistoryStore.getState().fetchHistory();
    const state = useHistoryStore.getState();
    expect(state.error).toBeTruthy();
    expect(state.items).toEqual([]);
  });

  it("filters by status", async () => {
    await useHistoryStore.getState().setStatusFilter("completed");
    // setStatusFilter triggers fetchHistory internally
    await vi.waitFor(() => {
      expect(useHistoryStore.getState().loading).toBe(false);
    });
    const state = useHistoryStore.getState();
    expect(state.statusFilter).toBe("completed");
  });

  it("resets to initial state", async () => {
    await useHistoryStore.getState().fetchHistory();
    useHistoryStore.getState().reset();
    const state = useHistoryStore.getState();
    expect(state.items).toEqual([]);
    expect(state.page).toBe(1);
  });
});
