import type { ScrollBoxRenderable } from "@opentui/core";
import { useEffect, useRef } from "react";
import { SCROLLBAR_OPTIONS } from "../../../lib/globals";
import { useCommitFlowStore } from "../main/commit/store";
import { useAppScreenStore } from "../store";

const STATUS_WIDTH = 40;

export function Sidebar() {
  const log = useAppScreenStore((s) => s.history);
  const loadHistory = useAppScreenStore((s) => s.loadHistory);
  const loadMoreHistory = useAppScreenStore((s) => s.loadMoreHistory);
  const focusArea = useAppScreenStore((s) => s.focusArea);
  const setFocusArea = useAppScreenStore((s) => s.setFocusArea);
  const historyIndex = useAppScreenStore((s) => s.historyIndex);
  const setHistoryIndex = useAppScreenStore((s) => s.setHistoryIndex);
  const viewHistoryEntry = useAppScreenStore((s) => s.viewHistoryEntry);
  const commitFlowActive = useCommitFlowStore((s) => s.active);

  const isFocused = focusArea === "history";
  const scrollRef = useRef<ScrollBoxRenderable>(null);

  useEffect(() => {
    loadHistory();
  }, [commitFlowActive]);

  useEffect(() => {
    if (!isFocused) return;
    const entry = log[historyIndex];
    if (entry) scrollRef.current?.scrollChildIntoView(entry.hash);
    if (historyIndex >= log.length - 5) loadMoreHistory();
  }, [isFocused, historyIndex, log]);

  return (
    <box
      id="sidebar-area"
      width={STATUS_WIDTH}
      flexDirection="column"
      backgroundColor={isFocused ? "#131313" : "#0d0d0d"}
    >
      <box height={3} paddingY={1} paddingX={2} backgroundColor="#151515">
        <text fg="#6b6b6b">History (↑↓ to select)</text>
      </box>
      <scrollbox
        ref={scrollRef}
        flexGrow={1}
        padding={1}
        backgroundColor={isFocused ? "#131313" : "#0d0d0d"}
        scrollbarOptions={SCROLLBAR_OPTIONS}
        stickyScroll
        stickyStart="top"
      >
        {log.map((entry, i) => {
          const selected = isFocused && i === historyIndex;
          return (
            <box
              key={entry.hash}
              id={entry.hash}
              flexDirection="column"
              paddingX={1}
              marginBottom={i < log.length - 1 ? 1 : 0}
              onMouseDown={() => {
                setFocusArea("history");
                setHistoryIndex(i);
                viewHistoryEntry();
              }}
            >
              <text fg={selected ? "#7d7d7d" : "#4d4d4d"} marginBottom={1}>
                {entry.hash.slice(0, 7)} {new Date(entry.date).toLocaleDateString()}
              </text>
              <text fg={selected ? "#ffffff" : "#8a8a8a"}>{entry.message}</text>
            </box>
          );
        })}
      </scrollbox>
    </box>
  );
}
