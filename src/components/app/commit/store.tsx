import { create } from "zustand";
import { type ChangedFile, type FileDiff, getChangedFiles, getDiffs } from "../../../lib/git";
import { generateCommitMessage } from "../../../lib/generate";
import { useAppStore } from "../../../store/app-store";

interface CommitFile extends ChangedFile {
  excluded: boolean;
}

interface CommitFlowState {
  active: boolean;
  files: CommitFile[];
  diffs: FileDiff[] | null;
  generating: boolean;
  message: string | null;
  error: string | null;
  startCommitFlow: () => Promise<void>;
  toggleFileExcluded: (path: string) => void;
  confirmSelection: () => Promise<void>;
  cancelCommitFlow: () => void;
  restart: () => Promise<void>;
}

export const useCommitFlowStore = create<CommitFlowState>((set, get) => ({
  active: false,
  files: [],
  diffs: null,
  generating: false,
  message: null,
  error: null,
  startCommitFlow: async () => {
    const changedFiles = await getChangedFiles();
    set({
      active: true,
      files: changedFiles.map((f) => ({ ...f, excluded: false })),
      diffs: null,
      generating: false,
      message: null,
      error: null,
    });
  },
  toggleFileExcluded: (path) => {
    set({
      files: get().files.map((f) => (f.path === path ? { ...f, excluded: !f.excluded } : f)),
    });
  },
  confirmSelection: async () => {
    const included = get().files.filter((f) => !f.excluded).map((f) => f.path);
    const diffs = await getDiffs(included);
    set({ diffs, generating: true, message: null, error: null });

    const config = useAppStore.getState().config;
    const models = config ? config.models : [];
    const combinedDiff = diffs.map((d) => d.diff).join("\n");

    for (const model of models) {
      try {
        const message = await generateCommitMessage(combinedDiff, model, config ? config.conventional : true);
        set({ generating: false, message, error: null });
        return;
      } catch {
        // try the next model
      }
    }

    set({ generating: false, message: null, error: "All AI models failed to generate a commit message." });
  },
  cancelCommitFlow: () => {
    set({ active: false, files: [], diffs: null, generating: false, message: null, error: null });
  },
  restart: async () => {
    await get().startCommitFlow();
  },
}));
