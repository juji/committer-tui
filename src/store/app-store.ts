import { create } from "zustand";
import { type Config, readConfig, writeConfig, type Model } from "../lib/config";
import { BUILTIN_PROVIDERS } from "../lib/provider";
import { useThemeStore } from "./theme-store";
import { info, error } from "localog";

export type Screen = "splash" | "app";
export type PopUp = "config" | "edit-message";

type ApiValidationStatus = "idle" | "validating" | "valid" | "partial" | "failed";
export type ProviderStatus = "checking" | "valid" | "invalid";

interface AppState {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  config: Config | false | null;
  popUpOpen: PopUp | null;
  openPopUp: (popUp: PopUp) => void;
  closePopUp: () => void;
  loadConfig: () => Promise<void>;
  saveConfig: (config: Config) => Promise<void>;
  apiValidationStatus: ApiValidationStatus;
  invalidProviders: string[];
  providerStatuses: Record<string, ProviderStatus>;
  checkApiKeys: () => Promise<void>;
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
  apiValidationStatus: "idle",
  invalidProviders: [],
  providerStatuses: {},
  loadConfig: async () => {
    const config = await readConfig();
    if (config && typeof config === "object" && config.theme) {
      useThemeStore.getState().setTheme(config.theme);
    }
    set({ config, popUpOpen: config ? null : "config" });
  },
  saveConfig: async (config) => {
    await writeConfig(config);
    set({ config });
  },
  checkApiKeys: async () => {
    const config = get().config;
    info(`checkApiKeys: config=${config ? "exists" : "null/undefined"}, type=${typeof config}`);
    if (!config) return;

    const models = config.models;
    info(`checkApiKeys: ${models.length} model(s) to check`);

    // No models configured - treat as failed (should open config)
    if (models.length === 0) {
      info(`checkApiKeys: no models, setting status=failed`);
      set({ apiValidationStatus: "failed", invalidProviders: [] });
      return;
    }

    const statuses: Record<string, ProviderStatus> = {};
    models.forEach((_, i) => { statuses[String(i)] = "checking"; });
    set({ apiValidationStatus: "validating", invalidProviders: [], providerStatuses: statuses });

    const invalidProviders: string[] = [];
    let hasValidKey = false;

    for (const [i, model] of models.entries()) {
      info(`checkApiKeys: checking ${model.provider} - ${model.name}`);
      const provider = BUILTIN_PROVIDERS[model.provider];
      if (provider) {
        try {
          const isValid = await provider.checkApiKey(model);
          info(`checkApiKeys: ${model.provider} valid=${isValid}`);
          set({ providerStatuses: { ...get().providerStatuses, [String(i)]: isValid ? "valid" : "invalid" } });
          if (!isValid) {
            invalidProviders.push(model.provider);
          } else {
            hasValidKey = true;
          }
        } catch (e) {
          error(`checkApiKeys: ${model.provider} error: ${e}`);
          set({ providerStatuses: { ...get().providerStatuses, [String(i)]: "invalid" } });
          invalidProviders.push(model.provider);
        }
      } else {
        error(`checkApiKeys: unknown provider ${model.provider}`);
        set({ providerStatuses: { ...get().providerStatuses, [String(i)]: "invalid" } });
      }
    }

    if (invalidProviders.length === 0) {
      info(`checkApiKeys: all valid, setting status=valid`);
      set({ apiValidationStatus: "valid", invalidProviders: [] });
    } else if (hasValidKey) {
      info(`checkApiKeys: partial failure - ${invalidProviders.join(", ")}`);
      set({ apiValidationStatus: "partial", invalidProviders });
    } else {
      info(`checkApiKeys: all failed - ${invalidProviders.join(", ")}`);
      set({ apiValidationStatus: "failed", invalidProviders });
    }
  },
}));
