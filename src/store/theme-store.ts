import { create } from "zustand";
import { getTheme, DEFAULT_THEME, type Theme } from "@/lib/themes";

interface ThemeState {
  themeName: string;
  theme: Theme;
  setTheme: (name: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeName: DEFAULT_THEME,
  theme: getTheme(DEFAULT_THEME),
  setTheme: (name: string) => set({ themeName: name, theme: getTheme(name) }),
}));