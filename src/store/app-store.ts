import { create } from "zustand";
import { type Config, readConfig, writeConfig } from "../lib/config";

export type Screen = "splash" | "app";
export type PopUp = "config" | "edit-message";

interface AppState {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  config: Config | false | null;
  popUpOpen: PopUp | null;
  openPopUp: (popUp: PopUp) => void;
  closePopUp: () => void;
  loadConfig: () => Promise<void>;
  saveConfig: (config: Config) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  screen: "splash",
  setScreen: (screen) => set({ screen }),
  config: null,
  popUpOpen: null,
  openPopUp: (popUp) => set({ popUpOpen: popUp }),
  closePopUp: () => {
    if (get().config) set({ popUpOpen: null });
  },
  loadConfig: async () => {
    const config = await readConfig();
    set({ config, screen: "app", popUpOpen: config ? null : "config" });
  },
  saveConfig: async (config) => {
    await writeConfig(config);
    set({ config });
  },
}));
