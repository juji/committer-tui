import { create } from "zustand";
import { type ChangedFile, type FileDiff, getChangedFiles, getDiffs, runGitStreaming } from "../../../lib/git";
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
  committing: boolean;
  commitOutput: string[];
  committed: boolean;
  startCommitFlow: () => Promise<void>;
  toggleFileExcluded: (path: string) => void;
  confirmSelection: () => Promise<void>;
  cancelCommitFlow: () => void;
  restart: () => Promise<void>;
  commit: () => Promise<void>;
}

export const useCommitFlowStore = create<CommitFlowState>((set, get) => ({
  active: false,
  files: [],
  diffs: null,
  generating: false,
  message: null,
  error: null,
  committing: false,
  commitOutput: [],
  committed: false,
  startCommitFlow: async () => {
    const changedFiles = await getChangedFiles();
    set({
      active: true,
      files: changedFiles.map((f) => ({ ...f, excluded: false })),
      diffs: null,
      generating: false,
      message: null,
      error: changedFiles.length === 0 ? "No file(s) to commit" : null,
      committing: false,
      commitOutput: [],
      committed: false,
    });
  },
  toggleFileExcluded: (path) => {
    set({
      files: get().files.map((f) => (f.path === path ? { ...f, excluded: !f.excluded } : f)),
    });
  },
  confirmSelection: async () => {
    const included = get().files.filter((f) => !f.excluded).map((f) => f.path);
    if (included.length === 0) {
      set({ error: "No file(s) to commit" });
      return;
    }
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
    set({
      active: false,
      files: [],
      diffs: null,
      generating: false,
      message: null,
      error: null,
      committing: false,
      commitOutput: [],
      committed: false,
    });
  },
  restart: async () => {
    await get().startCommitFlow();
  },
  commit: async () => {
    const { files, message } = get();
    if (!message) return;
    const included = files.filter((f) => !f.excluded).map((f) => f.path);

    set({ committing: true, commitOutput: [], error: null });
    const appendLine = (line: string) => set((s) => ({ commitOutput: [...s.commitOutput, line] }));

    try {
      await runGitStreaming(["add", "--", ...included], appendLine);
      await runGitStreaming(["commit", "-m", message], appendLine);
      set({ committing: false, committed: true });
    } catch (err) {
      set({ committing: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
}));
