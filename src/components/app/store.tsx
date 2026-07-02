import { create } from "zustand";
import { type CommitLogEntry, type FileDiff, getCommitDiff, getCommitLog } from "../../lib/git";

export type FocusArea = "bottom" | "history" | "main";
const FOCUS_ORDER: FocusArea[] = ["bottom", "history", "main"];
const PAGE_SIZE = 50;

interface AppScreenState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  focusArea: FocusArea;
  cycleFocusArea: () => void;

  focusedButtonIndex: number;
  setFocusedButtonIndex: (index: number) => void;
  bottomButtonCount: number;
  setBottomButtonCount: (count: number) => void;

  history: CommitLogEntry[];
  loadHistory: () => Promise<void>;
  hasMoreHistory: boolean;
  loadingMoreHistory: boolean;
  loadMoreHistory: () => Promise<void>;

  historyIndex: number;
  focusHistory: (delta: number) => void;

  viewingCommit: CommitLogEntry | null;
  viewingDiff: FileDiff[] | null;
  viewHistoryEntry: () => Promise<void>;
  viewHistoryDelta: (delta: number) => Promise<void>;
  closeHistoryEntry: () => void;
}

export const useAppScreenStore = create<AppScreenState>((set, get) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  focusArea: "bottom",
  cycleFocusArea: () => {
    const { focusArea, focusedButtonIndex, bottomButtonCount } = get();
    if (focusArea === "bottom" && focusedButtonIndex < bottomButtonCount - 1) {
      set({ focusedButtonIndex: focusedButtonIndex + 1 });
      return;
    }
    const nextIndex = (FOCUS_ORDER.indexOf(focusArea) + 1) % FOCUS_ORDER.length;
    const next = FOCUS_ORDER[nextIndex]!;
    set({
      focusArea: next,
      sidebarOpen: next === "history" ? true : get().sidebarOpen,
      focusedButtonIndex: next === "bottom" ? 0 : focusedButtonIndex,
    });
  },

  focusedButtonIndex: 0,
  setFocusedButtonIndex: (index) => set({ focusedButtonIndex: index }),
  bottomButtonCount: 1,
  setBottomButtonCount: (count) => set({ bottomButtonCount: count }),

  history: [],
  hasMoreHistory: true,
  loadingMoreHistory: false,
  loadHistory: async () => {
    const history = await getCommitLog(PAGE_SIZE);
    set({ history, hasMoreHistory: history.length === PAGE_SIZE });
  },
  loadMoreHistory: async () => {
    const { history, hasMoreHistory, loadingMoreHistory } = get();
    if (!hasMoreHistory || loadingMoreHistory) return;
    set({ loadingMoreHistory: true });
    const more = await getCommitLog(PAGE_SIZE, history.length);
    set({
      history: [...history, ...more],
      hasMoreHistory: more.length === PAGE_SIZE,
      loadingMoreHistory: false,
    });
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
  viewHistoryDelta: async (delta) => {
    const { history, historyIndex } = get();
    if (history.length === 0) return;
    const nextIndex = (historyIndex + delta + history.length) % history.length;
    const entry = history[nextIndex];
    if (!entry) return;
    const diff = await getCommitDiff(entry.hash);
    set({ historyIndex: nextIndex, viewingCommit: entry, viewingDiff: diff });
  },
  closeHistoryEntry: () => set({ viewingCommit: null, viewingDiff: null }),
}));
