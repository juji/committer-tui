import type { ScrollBoxRenderable, SelectOption, SelectRenderable } from "@opentui/core";
import { type RefObject, useEffect, useRef, useState } from "react";
import { FileDiffList } from "../../file-diff-list";
import { useAppScreenStore } from "../../store";
import { useKeyboardStore } from "../../../../store/keyboard-store";
import { Spinner } from "../../../spinner";
import { useCommitFlowStore } from "./store";
import { useThemeStore } from "../../../../store/theme-store";
import { useStateRef } from "../../../../lib/use-state-ref";
import { getCurrentBranch } from "../../../../lib/git";

const SCOPE_ID = "app/commit";

export function CommitFileList({ scrollRef }: { scrollRef: RefObject<ScrollBoxRenderable | null> }) {
  const theme = useThemeStore((s) => s.theme);
  const files = useCommitFlowStore((s) => s.files);
  const diffs = useCommitFlowStore((s) => s.diffs);
  const generating = useCommitFlowStore((s) => s.generating);
  const modelAttempts = useCommitFlowStore((s) => s.modelAttempts);
  const message = useCommitFlowStore((s) => s.message);
  const error = useCommitFlowStore((s) => s.error);
  const committing = useCommitFlowStore((s) => s.committing);
  const commitOutput = useCommitFlowStore((s) => s.commitOutput);
  const committed = useCommitFlowStore((s) => s.committed);
  const hasResult = message !== null || error !== null || files.length === 0;
  const toggleFileExcluded = useCommitFlowStore((s) => s.toggleFileExcluded);
  const cancelCommitFlow = useCommitFlowStore((s) => s.cancelCommitFlow);
  const focusArea = useAppScreenStore((s) => s.focusArea);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [branch, setBranch] = useState("");

  useEffect(() => { getCurrentBranch().then(setBranch); }, []);

  const isFocused = focusArea === "main";
  const selectRef = useRef<SelectRenderable>(null);

  useEffect(() => {
    if (isFocused && !diffs) selectRef.current?.focus();
  }, [isFocused, diffs]);

  const stateRef = useStateRef({ files, focusedIndex, committing, committed, hasResult, toggleFileExcluded, cancelCommitFlow });

  useEffect(() => {
    useKeyboardStore.getState().push({
      id: SCOPE_ID,
      handleKey: (key) => {
        const s = stateRef.current;
        if (key.name === "escape") {
          s.cancelCommitFlow();
          return true;
        }
        if (s.committing || s.committed || s.hasResult) return false;
        if (key.name === "space") {
          const file = s.files[s.focusedIndex];
          if (file) s.toggleFileExcluded(file.path);
          return true;
        }
        return false;
      },
    });
    return () => useKeyboardStore.getState().pop(SCOPE_ID);
  }, []);

  useEffect(() => {
    if (!message && !committed) return;
    const id = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: 0, y: scrollRef.current.scrollHeight });
    }, 50);
    return () => clearTimeout(id);
  }, [message, committed, scrollRef]);

  const options: SelectOption[] = files.map((f) => ({
    name: `[${f.excluded ? " " : "x"}] ${f.status} ${f.path}`,
    description: "",
  }));

  const headerHeight = 1 + 1 + 1 + options.length;

  return (
    <>
      <box flexShrink={0}>
        <text fg={theme.text.primary} attributes={1}>COMMITTER{branch ? ` [${branch}]` : ""}</text>
      </box>

      {files.length > 0 && (
        <box flexDirection="column" height={headerHeight} flexShrink={0}>
          <box height={1} flexShrink={0} />
          <text fg={theme.text.muted}>Space to exclude, Enter to confirm, Esc to cancel</text>
          <box height={1} flexShrink={0} />
          <select
            ref={selectRef}
            options={options}
            height={options.length}
            showDescription={false}
            itemSpacing={0}
            focused={isFocused && !diffs}
            focusedBackgroundColor={theme.bg.hover}
            onChange={(index) => setFocusedIndex(index)}
          />
        </box>
      )}

      {diffs && (
        <box flexDirection="column" flexGrow={1}>
          <box height={1} flexShrink={0} />
          <FileDiffList diffs={diffs} focused={isFocused} />
        </box>
      )}

      {(generating || message || error) && (
        <box flexDirection="column" flexShrink={0}>
          {modelAttempts.map((a, i) => (
            <box key={i}>
              <box height={1} flexShrink={0} />
              {a.status === "trying" && <Spinner label={`Generating commit message... (${a.provider} - ${a.model})`} />}
              {a.status === "failed" && (
                <text>
                  <span fg={theme.semantic.error}>✗</span>
                  <span fg={theme.text.muted}>
                    {" "}
                    Failed ({a.provider} - {a.model}){a.error ? `: ${a.error}` : ""}
                  </span>
                </text>
              )}
              {a.status === "ok" && (
                <text>
                  <span fg={theme.semantic.success}>✓</span>
                  <span fg={theme.text.muted}> Generated by {a.provider} - {a.model}</span>
                </text>
              )}
            </box>
          ))}
          {message && (
            <box flexDirection="column">
              <box height={1} flexShrink={0} />
              <text fg={theme.text.muted}>Commit message:</text>
              <box height={1} flexShrink={0} />
              <box backgroundColor={theme.bg.card} paddingY={1} paddingX={2}>
                <text fg={theme.text.secondary}>{message}</text>
              </box>
            </box>
          )}
          {error && (
            <box flexDirection="column">
              <box height={1} flexShrink={0} />
              <text fg={theme.semantic.error}>{error}</text>
            </box>
          )}
        </box>
      )}

      {(committing || committed || commitOutput.length > 0) && (
        <box flexDirection="column" flexShrink={0}>
          <box height={1} flexShrink={0} />
          {committing && <Spinner label="Committing..." />}
          {committed && (
            <box flexDirection="column" backgroundColor={theme.semantic.successBg} paddingX={2} paddingY={1}>
              <text fg={theme.semantic.success} attributes={1}>
                ✓ Commit created.
              </text>
              <box height={1} flexShrink={0} />
              {commitOutput.map((line, i) => (
                <text key={i} fg={theme.text.primary}>
                  {line}
                </text>
              ))}
            </box>
          )}
          {!committed && commitOutput.length > 0 && (
            <box flexDirection="column" marginTop={1}>
              {commitOutput.map((line, i) => (
                <text key={i} fg={theme.text.muted}>
                  {line}
                </text>
              ))}
            </box>
          )}
        </box>
      )}
    </>
  );
}
