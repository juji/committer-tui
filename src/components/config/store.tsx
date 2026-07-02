import { create } from "zustand";
import { DEFAULT_INSTRUCTION_PREFIX, type Config, isValidConfig, type Model, writeConfig } from "../../lib/config";
import { useAppStore } from "../../store/app-store";

interface ConfigValues {
  instructionPrefix: string;
  instructionSuffix: string;
  models: Model[];
  setInstructionPrefix: (instructionPrefix: string) => void;
  setInstructionSuffix: (instructionSuffix: string) => void;
  setModel: (providerId: string, model: Model) => void;
  removeModel: (providerId: string) => void;
}

export const useConfigFormStore = create<ConfigValues>((set, get) => {
  const persist = (patch: Partial<Pick<ConfigValues, "instructionPrefix" | "instructionSuffix" | "models">>) => {
    const next: Config = {
      instructionPrefix: patch.instructionPrefix ?? get().instructionPrefix,
      instructionSuffix: patch.instructionSuffix ?? get().instructionSuffix,
      models: patch.models ?? get().models,
    };
    set(next);
    if (!isValidConfig(next)) return; // never overwrite the saved file with an incomplete form state
    writeConfig(next);
    useAppStore.setState({ config: next });
  };

  return {
    instructionPrefix: DEFAULT_INSTRUCTION_PREFIX,
    instructionSuffix: "",
    models: [],
    setInstructionPrefix: (instructionPrefix) => persist({ instructionPrefix }),
    setInstructionSuffix: (instructionSuffix) => persist({ instructionSuffix }),
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
  useConfigFormStore.setState({
    instructionPrefix: config.instructionPrefix,
    instructionSuffix: config.instructionSuffix,
    models: config.models,
  });
}
