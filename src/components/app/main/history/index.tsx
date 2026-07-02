import { useKeyboard } from "@opentui/react";
import { FileDiffList } from "../../file-diff-list";
import { useAppScreenStore } from "../../store";

export function HistoryEntryView() {
  const commit = useAppScreenStore((s) => s.viewingCommit);
  const diffs = useAppScreenStore((s) => s.viewingDiff);
  const closeHistoryEntry = useAppScreenStore((s) => s.closeHistoryEntry);
  const focusArea = useAppScreenStore((s) => s.focusArea);

  useKeyboard((key) => {
    if (key.name === "escape") closeHistoryEntry();
  });

  if (!commit) return null;

  const messageLines = commit.message.split("\n").length;

  return (
    <>
      <box flexDirection="column" height={2 + messageLines + 2} flexShrink={0}>
        <text fg="#6b6b6b">
          {commit.hash.slice(0, 7)} {new Date(commit.date).toLocaleString()}{" "}
        </text>
        <box height={1} flexShrink={0} />
        <box backgroundColor="#0d0d0d" paddingY={1} paddingX={2}>
          <text fg="#b0b0b0">{commit.message}</text>
        </box>
      </box>
      <box height={1} flexShrink={0} />
      {diffs && <FileDiffList diffs={diffs} focused={focusArea === "main"} />}
    </>
  );
}
