import { useKeyboard } from "@opentui/react";
import { useAppScreenStore } from "../store";

export function HistoryEntryView() {
  const commit = useAppScreenStore((s) => s.viewingCommit);
  const diff = useAppScreenStore((s) => s.viewingDiff);
  const closeHistoryEntry = useAppScreenStore((s) => s.closeHistoryEntry);
  const focusArea = useAppScreenStore((s) => s.focusArea);

  useKeyboard((key) => {
    if (key.name === "escape") closeHistoryEntry();
  });

  if (!commit) return null;

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg="#6b6b6b">
        {commit.hash.slice(0, 7)} {new Date(commit.date).toLocaleString()}
      </text>
      <box height={1} />
      <box backgroundColor="#161616" paddingY={1} paddingX={2}>
        <text fg="#b0b0b0">{commit.message}</text>
      </box>
      <box height={1} />
      {diff && (
        <scrollbox flexGrow={1} focused={focusArea === "main"}>
          <diff diff={diff} height={diff.split("\n").length + 2} showLineNumbers />
        </scrollbox>
      )}
    </box>
  );
}
