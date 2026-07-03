import { useEffect } from "react";
import { FileDiffList } from "../../file-diff-list";
import { useAppScreenStore } from "../../store";
import { useKeyboardStore } from "@/store/keyboard-store";
import { useThemeStore } from "@/store/theme-store";
import { useStateRef } from "@/lib/use-state-ref";

const SCOPE_ID = "app/history";

export function HistoryEntryView() {
  const theme = useThemeStore((s) => s.theme);
  const commit = useAppScreenStore((s) => s.viewingCommit);
  const diffs = useAppScreenStore((s) => s.viewingDiff);
  const closeHistoryEntry = useAppScreenStore((s) => s.closeHistoryEntry);
  const focusArea = useAppScreenStore((s) => s.focusArea);
  const viewHistoryDelta = useAppScreenStore((s) => s.viewHistoryDelta);

  const stateRef = useStateRef({ closeHistoryEntry, viewHistoryDelta, focusArea });

  useEffect(() => {
    useKeyboardStore.getState().push({
      id: SCOPE_ID,
      handleKey: (key) => {
        const s = stateRef.current;
        if (key.name === "escape") {
          s.closeHistoryEntry();
          return true;
        }
        if (s.focusArea !== "history") return false;
        if (key.name === "up") {
          s.viewHistoryDelta(-1);
          return true;
        }
        if (key.name === "down") {
          s.viewHistoryDelta(1);
          return true;
        }
        return false;
      },
    });
    return () => useKeyboardStore.getState().pop(SCOPE_ID);
  }, []);

  if (!commit) return null;

  const messageLines = commit.message.split("\n").length;

  return (
    <>
      <box flexShrink={0}>
        <text fg={theme.text.muted} attributes={1}>History</text>
      </box>
      <box height={1} flexShrink={0} />
      <box flexDirection="column" height={2 + messageLines + 2} flexShrink={0}>
        <text fg={theme.text.muted}>
          <span fg={theme.accent.purple}>{commit.hash.slice(0, 7)}</span>
          {" "}{new Date(commit.date).toLocaleString()}
        </text>
        <box height={1} flexShrink={0} />
        <box backgroundColor={theme.bg.card} paddingY={1} paddingX={2}>
          <text fg={theme.text.secondary}>{commit.message}</text>
        </box>
      </box>
      <box height={1} flexShrink={0} />
      {diffs && <FileDiffList diffs={diffs} focused={focusArea === "main"} scrollable={false} />}
    </>
  );
}
