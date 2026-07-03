import { create } from "zustand";
import { type ChangedFile, type FileDiff, getChangedFiles, getDiffs, runGitStreaming } from "../../../../lib/git";
import { generateCommitMessage } from "../../../../lib/generate";
import { DEFAULT_INSTRUCTION_PREFIX } from "../../../../lib/config";
import { useAppStore } from "../../../../store/app-store";
import { useAppScreenStore } from "../../store";

interface CommitFile extends ChangedFile {
  excluded: boolean;
}

export interface ModelAttempt {
  provider: string;
  model: string;
  status: "trying" | "ok" | "failed";
  error?: string;
}

interface CommitFlowState {
  active: boolean;
  files: CommitFile[];
  diffs: FileDiff[] | null;
  generating: boolean;
  modelAttempts: ModelAttempt[];
  message: string | null;
  error: string | null;
  committing: boolean;
  commitOutput: string[];
  committed: boolean;
  startCommitFlow: () => Promise<void>;
  toggleFileExcluded: (path: string) => void;
  confirmSelection: () => Promise<void>;
  cancelCommitFlow: () => void;
  commit: () => Promise<void>;
  setMessage: (message: string) => void;
}

export const useCommitFlowStore = create<CommitFlowState>((set, get) => ({
  active: false,
  files: [],
  diffs: null,
  generating: false,
  modelAttempts: [],
  message: null,
  error: null,
  committing: false,
  commitOutput: [],
  committed: false,
  startCommitFlow: async () => {
    useAppScreenStore.getState().closeHistoryEntry();
    useAppScreenStore.setState({ focusArea: "main" });
    try {
      const changedFiles = await getChangedFiles();
      const noFiles = changedFiles.length === 0;
      set({
        active: true,
        files: changedFiles.map((f) => ({ ...f, excluded: false })),
        diffs: null,
        generating: false,
        modelAttempts: [],
        message: null,
        error: noFiles ? "No file(s) to commit" : null,
        committing: false,
        commitOutput: [],
        committed: false,
      });
      if (noFiles) {
        useAppScreenStore.setState({ focusArea: "bottom", focusedButtonIndex: 0 });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({
        active: true,
        files: [],
        diffs: null,
        generating: false,
        modelAttempts: [],
        message: null,
        error: `Git error: ${msg}`,
        committing: false,
        commitOutput: [],
        committed: false,
      });
      useAppScreenStore.setState({ focusArea: "bottom", focusedButtonIndex: 0 });
    }
  },
  toggleFileExcluded: (path) => {
    set({
      files: get().files.map((f) => (f.path === path ? { ...f, excluded: !f.excluded } : f)),
    });
  },
  confirmSelection: async () => {
    if (get().generating) return;
    const included = get().files.filter((f) => !f.excluded).map((f) => f.path);
    if (included.length === 0) {
      set({ error: "No file(s) to commit" });
      useAppScreenStore.setState({ focusArea: "bottom", focusedButtonIndex: 0 });
      return;
    }
    let diffs: FileDiff[];
    try {
      diffs = await getDiffs(included);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: `Git error: ${msg}` });
      useAppScreenStore.setState({ focusArea: "bottom", focusedButtonIndex: 0 });
      return;
    }
    set({ diffs, generating: true, modelAttempts: [], message: null, error: null });

    const config = useAppStore.getState().config;
    const models = config ? config.models : [];
    const combinedDiff = diffs.map((d) => d.diff).join("\n");

    for (const model of models) {
      const attempt: ModelAttempt = { provider: model.provider, model: model.model, status: "trying" };
      set((s) => ({ modelAttempts: [...s.modelAttempts, attempt] }));
      try {
        const message = await generateCommitMessage(
          combinedDiff,
          model,
          config ? config.instructionPrefix : DEFAULT_INSTRUCTION_PREFIX,
          config ? config.instructionSuffix : "",
        );
        set((s) => ({
          generating: false,
          message,
          error: null,
          modelAttempts: s.modelAttempts.map((a) => (a === attempt ? { ...a, status: "ok" } : a)),
        }));
        useAppScreenStore.getState().setFocusedButtonIndex(0);
        return;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        set((s) => ({
          modelAttempts: s.modelAttempts.map((a) => (a === attempt ? { ...a, status: "failed", error: errorMessage } : a)),
        }));
      }
    }

    const lastError = get().modelAttempts.at(-1)?.error;
    set({
      generating: false,
      message: null,
      error: lastError ? `All AI models failed. Last error: ${lastError}` : "All AI models failed to generate a commit message.",
    });
  },
  cancelCommitFlow: () => {
    set({
      active: false,
      files: [],
      diffs: null,
      generating: false,
      modelAttempts: [],
      message: null,
      error: null,
      committing: false,
      commitOutput: [],
      committed: false,
    });
  },
  commit: async () => {
    const { files, message, committing } = get();
    if (!message || committing) return;
    const included = files.filter((f) => !f.excluded).map((f) => f.path);

    set({ committing: true, commitOutput: [], error: null });
    const appendLine = (line: string) => set((s) => ({ commitOutput: [...s.commitOutput, line] }));

    try {
      await runGitStreaming(["add", "--", ...included], appendLine);
      await runGitStreaming(["commit", "-m", message], appendLine);
      set({ committing: false, committed: true });
      await useAppScreenStore.getState().loadHistory();
    } catch (err) {
      set({ committing: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
  setMessage: (message) => set({ message }),
}));
