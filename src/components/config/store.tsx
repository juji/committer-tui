import { create } from "zustand";
import { DEFAULT_INSTRUCTION_PREFIX, type Config, isValidConfig, type Model, writeConfig } from "../../lib/config";
import { useAppStore } from "../../store/app-store";
import { useThemeStore } from "../../store/theme-store";

interface ConfigValues {
  instructionPrefix: string;
  instructionSuffix: string;
  theme: string;
  models: Model[];
  setInstructionPrefix: (instructionPrefix: string) => void;
  setInstructionSuffix: (instructionSuffix: string) => void;
  setTheme: (theme: string) => void;
  setModel: (providerId: string, model: Model) => void;
  removeModel: (providerId: string) => void;
  moveModel: (providerId: string, delta: number) => void;
}

export const useConfigFormStore = create<ConfigValues>((set, get) => {
  const persist = (patch: Partial<Pick<ConfigValues, "instructionPrefix" | "instructionSuffix" | "theme" | "models">>) => {
    const next: Config = {
      instructionPrefix: patch.instructionPrefix ?? get().instructionPrefix,
      instructionSuffix: patch.instructionSuffix ?? get().instructionSuffix,
      theme: patch.theme ?? get().theme,
      models: patch.models ?? get().models,
    };
    if (patch.theme) {
      useThemeStore.getState().setTheme(patch.theme);
    }
    set(next);
    if (!isValidConfig(next)) return;
    writeConfig(next);
    useAppStore.setState({ config: next });
  };

  return {
    instructionPrefix: DEFAULT_INSTRUCTION_PREFIX,
    instructionSuffix: "",
    theme: "midnight-aurora",
    models: [],
    setInstructionPrefix: (instructionPrefix) => persist({ instructionPrefix }),
    setInstructionSuffix: (instructionSuffix) => persist({ instructionSuffix }),
    setTheme: (theme) => persist({ theme }),
    setModel: (providerId, model) => {
      const rest = get().models.filter((m) => m.provider !== providerId);
      persist({ models: [...rest, model] });
    },
    removeModel: (providerId) => {
      persist({ models: get().models.filter((m) => m.provider !== providerId) });
    },
    moveModel: (providerId, delta) => {
      const models = get().models;
      const i = models.findIndex((m) => m.provider === providerId);
      const j = i + delta;
      if (i === -1 || j < 0 || j >= models.length) return;
      const next = [...models];
      [next[i], next[j]] = [next[j]!, next[i]!];
      persist({ models: next });
    },
  };
});

export function initConfigFormStore(config: Config) {
  useConfigFormStore.setState({
    instructionPrefix: config.instructionPrefix,
    instructionSuffix: config.instructionSuffix,
    theme: config.theme,
    models: config.models,
  });
  useThemeStore.getState().setTheme(config.theme);
}
