import { create } from "zustand";

interface AppScreenState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppScreenStore = create<AppScreenState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
