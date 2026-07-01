import type { SelectOption } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import { Spinner } from "./spinner";
import { useCommitFlowStore } from "./store";

export function CommitFileList() {
  const files = useCommitFlowStore((s) => s.files);
  const diffs = useCommitFlowStore((s) => s.diffs);
  const generating = useCommitFlowStore((s) => s.generating);
  const message = useCommitFlowStore((s) => s.message);
  const error = useCommitFlowStore((s) => s.error);
  const toggleFileExcluded = useCommitFlowStore((s) => s.toggleFileExcluded);
  const confirmSelection = useCommitFlowStore((s) => s.confirmSelection);
  const cancelCommitFlow = useCommitFlowStore((s) => s.cancelCommitFlow);
  const restart = useCommitFlowStore((s) => s.restart);

  const [focusedIndex, setFocusedIndex] = useState(0);

  const hasResult = message !== null || error !== null;

  useKeyboard((key) => {
    if (key.name === "escape") {
      cancelCommitFlow();
      return;
    }
    if (hasResult) {
      if (key.name === "backspace") restart();
      return;
    }
    if (key.name === "return") {
      confirmSelection();
      return;
    }
    if (key.name === "space") {
      const file = files[focusedIndex];
      if (file) toggleFileExcluded(file.path);
    }
  });

  const options: SelectOption[] = files.map((f) => ({
    name: `[${f.excluded ? " " : "x"}] ${f.status} ${f.path}`,
    description: "",
  }));

  const headerHeight = 1 + 1 + 1 + options.length;

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <box flexDirection="column" height={headerHeight} flexShrink={0}>
        <box height={1} />
        <text fg="#6b6b6b">Space to exclude, Enter to confirm, Esc to cancel</text>
        <box height={1} />
        <select
          options={options}
          height={options.length}
          showDescription={false}
          itemSpacing={0}
          focused={!diffs}
          focusedBackgroundColor="#333333"
          onChange={(index) => setFocusedIndex(index)}
        />
      </box>

      {diffs && (
        <box flexDirection="column" flexGrow={1}>
          <box height={1} flexShrink={0} />
          <scrollbox flexGrow={1} focused>
            {diffs.map((d) => (
              <box key={d.path} flexDirection="column" marginBottom={1}>
                <text fg="#6b6b6b">{d.path}</text>
                <box height={1} />
                <diff diff={d.diff} height={d.diff.split("\n").length + 2} showLineNumbers />
              </box>
            ))}
          </scrollbox>
        </box>
      )}

      {(generating || message || error) && (
        <box flexDirection="column" flexShrink={0}>
          <box height={1} />
          {generating && <Spinner label="Generating commit message..." />}
          {message && (
            <box flexDirection="column">
              <text fg="#6b6b6b">Commit message:</text>
              <box height={1} />
              <box backgroundColor="#161616" paddingY={1} paddingX={2}>
                <text fg="#b0b0b0">{message}</text>
              </box>
            </box>
          )}
          {error && <text fg="#ef4444">{error}</text>}
        </box>
      )}
    </box>
  );
}
