import type { ScrollBoxRenderable } from "@opentui/core";
import { useEffect, useRef } from "react";
import { getScrollbarOptions } from "@/lib/globals";
import { useCommitFlowStore } from "@/components/app/main/commit/store";
import { useAppScreenStore } from "@/components/app/store";
import { useThemeStore } from "@/store/theme-store";
import { Spinner } from "@/components/spinner";

const STATUS_WIDTH = 40;

export function Sidebar() {
  const theme = useThemeStore((s) => s.theme);
  const log = useAppScreenStore((s) => s.history);
  const loadingMoreHistory = useAppScreenStore((s) => s.loadingMoreHistory);
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
      backgroundColor={isFocused ? theme.bg.elevated : theme.bg.surface}
    >
      <box height={3} paddingY={1} paddingX={2} backgroundColor={theme.bg.card}>
        <text fg={theme.text.muted}>History (↑↓ to select)</text>
      </box>
      <scrollbox
        ref={scrollRef}
        flexGrow={1}
        padding={1}
        backgroundColor={isFocused ? theme.bg.elevated : theme.bg.surface}
        scrollbarOptions={getScrollbarOptions()}
        stickyScroll
        stickyStart="top"
      >
        {loadingMoreHistory && (
          <box paddingX={1} paddingY={1}>
            <Spinner label="Loading more..." />
          </box>
        )}
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
              <text fg={selected ? theme.text.secondary : theme.text.dim} marginBottom={1}>
                {entry.hash.slice(0, 7)} {new Date(entry.date).toLocaleDateString()}
              </text>
              <text fg={selected ? theme.text.primary : theme.text.muted}>{entry.message}</text>
            </box>
          );
        })}
      </scrollbox>
    </box>
  );
}
