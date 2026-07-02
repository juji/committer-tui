import { create } from "zustand";
import { type Config, isValidConfig, type Model, writeConfig } from "../../lib/config";
import { useAppStore } from "../../store/app-store";

interface ConfigValues {
  conventional: boolean;
  models: Model[];
  setConventional: (conventional: boolean) => void;
  setModel: (providerId: string, model: Model) => void;
  removeModel: (providerId: string) => void;
}

export const useConfigFormStore = create<ConfigValues>((set, get) => {
  const persist = (patch: Partial<Pick<ConfigValues, "conventional" | "models">>) => {
    const next: Config = {
      conventional: patch.conventional ?? get().conventional,
      models: patch.models ?? get().models,
    };
    set(next);
    writeConfig(next);
    if (isValidConfig(next)) useAppStore.setState({ config: next });
  };

  return {
    conventional: true,
    models: [],
    setConventional: (conventional) => persist({ conventional }),
    setModel: (providerId, model) => {
      const rest = get().models.filter((m) => m.provider !== providerId);
      persist({ models: [...rest, model] });
    },
    removeModel: (providerId) => {
      persist({ models: get().models.filter((m) => m.provider !== providerId) });
    },
  };
});

export function initConfigFormStore(config: Config) {
  useConfigFormStore.setState({ conventional: config.conventional, models: config.models });
}
