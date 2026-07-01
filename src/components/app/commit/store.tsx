import { create } from "zustand";
import { type ChangedFile, type FileDiff, getChangedFiles, getDiffs } from "../../../lib/git";

interface CommitFile extends ChangedFile {
  excluded: boolean;
}

interface CommitFlowState {
  active: boolean;
  files: CommitFile[];
  diffs: FileDiff[] | null;
  startCommitFlow: () => Promise<void>;
  toggleFileExcluded: (path: string) => void;
  confirmSelection: () => Promise<void>;
  cancelCommitFlow: () => void;
}

export const useCommitFlowStore = create<CommitFlowState>((set, get) => ({
  active: false,
  files: [],
  diffs: null,
  startCommitFlow: async () => {
    const changedFiles = await getChangedFiles();
    set({
      active: true,
      files: changedFiles.map((f) => ({ ...f, excluded: false })),
      diffs: null,
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
    set({ diffs });
  },
  cancelCommitFlow: () => {
    set({ active: false, files: [], diffs: null });
  },
}));
