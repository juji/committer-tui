import type { KeyEvent } from "@opentui/core";
import { useAppContext } from "@opentui/react";
import { useEffect, useRef } from "react";
import { FileDiffList } from "../../file-diff-list";
import { useAppScreenStore } from "../../store";
import { useKeyboardStore } from "../../../../store/keyboard-store";

const SCOPE_ID = "app/history";

export function HistoryEntryView() {
  const commit = useAppScreenStore((s) => s.viewingCommit);
  const diffs = useAppScreenStore((s) => s.viewingDiff);
  const closeHistoryEntry = useAppScreenStore((s) => s.closeHistoryEntry);
  const focusArea = useAppScreenStore((s) => s.focusArea);
  const toggleSidebar = useAppScreenStore((s) => s.toggleSidebar);
  const cycleFocusArea = useAppScreenStore((s) => s.cycleFocusArea);
  const viewHistoryDelta = useAppScreenStore((s) => s.viewHistoryDelta);

  const { keyHandler } = useAppContext();
  const stateRef = useRef({ closeHistoryEntry, toggleSidebar, cycleFocusArea, viewHistoryDelta, focusArea });
  stateRef.current = { closeHistoryEntry, toggleSidebar, cycleFocusArea, viewHistoryDelta, focusArea };

  useEffect(() => {
    const onKey = (key: KeyEvent) => {
      const s = stateRef.current;
      if (key.name === "escape") {
        s.closeHistoryEntry();
        return;
      }
      if (key.ctrl && key.name === "y") {
        s.toggleSidebar();
        return;
      }
      if (key.name === "tab") {
        s.cycleFocusArea();
        return;
      }
      if (s.focusArea !== "history") return;
      if (key.name === "up") {
        s.viewHistoryDelta(-1);
        return;
      }
      if (key.name === "down") {
        s.viewHistoryDelta(1);
      }
    };

    useKeyboardStore.getState().push({
      id: SCOPE_ID,
      activate: () => keyHandler?.on("keypress", onKey),
      deactivate: () => keyHandler?.off("keypress", onKey),
    });
    return () => useKeyboardStore.getState().pop();
  }, [keyHandler]);

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
