import { create } from "zustand";
import { useAuthStore } from "@/stores/auth-store";
import { API_BASE_URL } from "@/lib/env";

interface HistoryItem {
  id: string;
  filename: string;
  outputFormat: string;
  status: string;
  fileSize: number | null;
  createdAt: string;
  completedAt: string | null;
  hasImages: boolean;
}

interface HistoryStore {
  items: HistoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  statusFilter: string | null;
  fetchHistory: (page?: number, status?: string | null) => Promise<void>;
  setPage: (page: number) => void;
  setStatusFilter: (status: string | null) => void;
  reset: () => void;
}

const initialState = {
  items: [] as HistoryItem[],
  totalCount: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
  loading: false,
  error: null as string | null,
  statusFilter: null as string | null,
};

export const useHistoryStore = create<HistoryStore>()((set, get) => ({
  ...initialState,

  fetchHistory: async (page?: number, status?: string | null) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: "로그인이 필요합니다", items: [], loading: false });
      return;
    }

    const currentPage = page ?? get().page;
    const currentStatus = status !== undefined ? status : get().statusFilter;

    set({ loading: true, error: null });

    try {
      let url = `${API_BASE_URL}/api/conversions?page=${currentPage}&pageSize=${get().pageSize}`;
      if (currentStatus) {
        url += `&status=${currentStatus}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("히스토리를 가져오는 데 실패했습니다");
      }

      const data = await res.json();

      set({
        items: data.items,
        totalCount: data.totalCount,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        loading: false,
      });
    } catch {
      set({
        error: "히스토리를 가져오는 데 실패했습니다",
        loading: false,
      });
    }
  },

  setPage: (page: number) => {
    get().fetchHistory(page, get().statusFilter);
  },

  setStatusFilter: (status: string | null) => {
    set({ statusFilter: status });
    get().fetchHistory(1, status);
  },

  reset: () => {
    set({ ...initialState });
  },
}));
