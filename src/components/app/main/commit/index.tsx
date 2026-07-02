import type { KeyEvent, ScrollBoxRenderable, SelectOption, SelectRenderable } from "@opentui/core";
import { useAppContext } from "@opentui/react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { FileDiffList } from "../../file-diff-list";
import { useAppScreenStore } from "../../store";
import { useKeyboardStore } from "../../../../store/keyboard-store";
import { Spinner } from "./spinner";
import { useCommitFlowStore } from "./store";

const SCOPE_ID = "app/commit";

export function CommitFileList({ scrollRef }: { scrollRef: RefObject<ScrollBoxRenderable | null> }) {
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
  const toggleSidebar = useAppScreenStore((s) => s.toggleSidebar);
  const cycleFocusArea = useAppScreenStore((s) => s.cycleFocusArea);

  const [focusedIndex, setFocusedIndex] = useState(0);

  const isFocused = focusArea === "main";
  const selectRef = useRef<SelectRenderable>(null);

  useEffect(() => {
    if (isFocused && !diffs) selectRef.current?.focus();
  }, [isFocused, diffs]);

  const { keyHandler } = useAppContext();
  const stateRef = useRef({
    files,
    focusedIndex,
    committing,
    committed,
    hasResult,
    toggleFileExcluded,
    cancelCommitFlow,
    toggleSidebar,
    cycleFocusArea,
  });
  stateRef.current = {
    files,
    focusedIndex,
    committing,
    committed,
    hasResult,
    toggleFileExcluded,
    cancelCommitFlow,
    toggleSidebar,
    cycleFocusArea,
  };

  useEffect(() => {
    const onKey = (key: KeyEvent) => {
      const s = stateRef.current;
      if (key.ctrl && key.name === "y") {
        s.toggleSidebar();
        return;
      }
      if (key.name === "tab") {
        s.cycleFocusArea();
        return;
      }
      if (key.name === "escape") {
        s.cancelCommitFlow();
        return;
      }
      if (s.committing || s.committed || s.hasResult) return;
      if (key.name === "space") {
        const file = s.files[s.focusedIndex];
        if (file) s.toggleFileExcluded(file.path);
      }
    };

    useKeyboardStore.getState().push({
      id: SCOPE_ID,
      activate: () => keyHandler?.on("keypress", onKey),
      deactivate: () => keyHandler?.off("keypress", onKey),
    });
    return () => useKeyboardStore.getState().pop();
  }, [keyHandler]);

  useEffect(() => {
    if (!message && !committed) return;
    const id = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: 0, y: scrollRef.current.scrollHeight });
    }, 0);
    return () => clearTimeout(id);
  }, [message, committed, scrollRef]);

  const options: SelectOption[] = files.map((f) => ({
    name: `[${f.excluded ? " " : "x"}] ${f.status} ${f.path}`,
    description: "",
  }));

  const headerHeight = 1 + 1 + 1 + options.length;

  return (
    <>
      {files.length > 0 && (
        <box flexDirection="column" height={headerHeight} flexShrink={0}>
          <box height={1} flexShrink={0} />
          <text fg="#6b6b6b">Space to exclude, Enter to confirm, Esc to cancel</text>
          <box height={1} flexShrink={0} />
          <select
            ref={selectRef}
            options={options}
            height={options.length}
            showDescription={false}
            itemSpacing={0}
            focused={isFocused && !diffs}
            focusedBackgroundColor="#333333"
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
                  <span fg="#ef4444">✗</span>
                  <span fg="#6b6b6b">
                    {" "}
                    Failed ({a.provider} - {a.model}){a.error ? `: ${a.error}` : ""}
                  </span>
                </text>
              )}
              {a.status === "ok" && (
                <text>
                  <span fg="#22c55e">✓</span>
                  <span fg="#6b6b6b"> Generated by {a.provider} - {a.model}</span>
                </text>
              )}
            </box>
          ))}
          {message && (
            <box flexDirection="column">
              <box height={1} flexShrink={0} />
              <text fg="#6b6b6b">Commit message:</text>
              <box height={1} flexShrink={0} />
              <box backgroundColor="#161616" paddingY={1} paddingX={2}>
                <text fg="#b0b0b0">{message}</text>
              </box>
            </box>
          )}
          {error && <text fg="#ef4444">{error}</text>}
        </box>
      )}

      {(committing || committed || commitOutput.length > 0) && (
        <box flexDirection="column" flexShrink={0}>
          <box height={1} flexShrink={0} />
          {committing && <Spinner label="Committing..." />}
          {committed && <text fg="#22c55e">Commit created.</text>}
          <box flexDirection="column" marginTop={1}>
            {commitOutput.map((line, i) => (
              <text key={i} fg="#6b6b6b">
                {line}
              </text>
            ))}
          </box>
        </box>
      )}
    </>
  );
}
