import { create } from "zustand";
import { type CommitLogEntry, getCommitDiff, getCommitLog } from "../../lib/git";

export type FocusArea = "bottom" | "history" | "main";
const FOCUS_ORDER: FocusArea[] = ["bottom", "history", "main"];

interface AppScreenState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  focusArea: FocusArea;
  cycleFocusArea: () => void;

  focusedButtonIndex: number;
  setFocusedButtonIndex: (index: number) => void;

  history: CommitLogEntry[];
  loadHistory: () => Promise<void>;

  historyIndex: number;
  focusHistory: (delta: number) => void;

  viewingCommit: CommitLogEntry | null;
  viewingDiff: string | null;
  viewHistoryEntry: () => Promise<void>;
  closeHistoryEntry: () => void;
}

export const useAppScreenStore = create<AppScreenState>((set, get) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  focusArea: "bottom",
  cycleFocusArea: () => {
    const nextIndex = (FOCUS_ORDER.indexOf(get().focusArea) + 1) % FOCUS_ORDER.length;
    const next = FOCUS_ORDER[nextIndex]!;
    set({ focusArea: next, sidebarOpen: next === "history" ? true : get().sidebarOpen });
  },

  focusedButtonIndex: 0,
  setFocusedButtonIndex: (index) => set({ focusedButtonIndex: index }),

  history: [],
  loadHistory: async () => {
    const history = await getCommitLog();
    set({ history });
  },

  historyIndex: 0,
  focusHistory: (delta) => {
    const itemCount = get().history.length;
    if (itemCount === 0) return;
    const next = (get().historyIndex + delta + itemCount) % itemCount;
    set({ historyIndex: next });
  },

  viewingCommit: null,
  viewingDiff: null,
  viewHistoryEntry: async () => {
    const { history, historyIndex } = get();
    const entry = history[historyIndex];
    if (!entry) return;
    const diff = await getCommitDiff(entry.hash);
    set({ viewingCommit: entry, viewingDiff: diff });
  },
  closeHistoryEntry: () => set({ viewingCommit: null, viewingDiff: null }),
}));
