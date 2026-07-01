import { create } from "zustand";
import { type Config, readConfig, writeConfig } from "../lib/config";

export type Screen = "splash" | "app" | "config";

interface AppState {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  config: Config | false | null;
  loadConfig: () => Promise<void>;
  saveConfig: (config: Config) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  screen: "splash",
  setScreen: (screen) => set({ screen }),
  config: null,
  loadConfig: async () => {
    const config = await readConfig();
    set({ config, screen: config ? "app" : "config" });
  },
  saveConfig: async (config) => {
    await writeConfig(config);
    set({ config });
  },
}));
