import { create } from "zustand";
import { type Config, readConfig, writeConfig } from "../lib/config";

export type Screen = "splash" | "app";

interface AppState {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  config: Config | false | null;
  configOpen: boolean;
  openConfig: () => void;
  closeConfig: () => void;
  loadConfig: () => Promise<void>;
  saveConfig: (config: Config) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  screen: "splash",
  setScreen: (screen) => set({ screen }),
  config: null,
  configOpen: false,
  openConfig: () => set({ configOpen: true }),
  closeConfig: () => {
    if (get().config) set({ configOpen: false });
  },
  loadConfig: async () => {
    const config = await readConfig();
    set({ config, screen: "app", configOpen: !config });
  },
  saveConfig: async (config) => {
    await writeConfig(config);
    set({ config });
  },
}));
