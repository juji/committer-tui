import { create } from "zustand";
import { type Config, type Model, writeConfig } from "../../lib/config";

interface ConfigValues {
  conventional: boolean;
  models: Model[];
  setConventional: (conventional: boolean) => void;
  setModel: (providerId: string, model: Model) => void;
}

export const useConfigStore = create<ConfigValues>((set, get) => {
  const persist = (patch: Partial<Pick<ConfigValues, "conventional" | "models">>) => {
    const next: Config = {
      conventional: patch.conventional ?? get().conventional,
      models: patch.models ?? get().models,
    };
    set(next);
    writeConfig(next);
  };

  return {
    conventional: true,
    models: [],
    setConventional: (conventional) => persist({ conventional }),
    setModel: (providerId, model) => {
      const rest = get().models.filter((m) => m.provider !== providerId);
      persist({ models: [...rest, model] });
    },
  };
});

export function initConfigStore(config: Config) {
  useConfigStore.setState({ conventional: config.conventional, models: config.models });
}
