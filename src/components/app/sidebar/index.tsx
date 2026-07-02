import { useEffect } from "react";
import { SCROLLBAR_OPTIONS } from "../../../lib/globals";
import { useCommitFlowStore } from "../main/commit/store";
import { useAppScreenStore } from "../store";

const STATUS_WIDTH = 40;

export function Sidebar() {
  const log = useAppScreenStore((s) => s.history);
  const loadHistory = useAppScreenStore((s) => s.loadHistory);
  const focusArea = useAppScreenStore((s) => s.focusArea);
  const historyIndex = useAppScreenStore((s) => s.historyIndex);
  const commitFlowActive = useCommitFlowStore((s) => s.active);

  const isFocused = focusArea === "history";

  useEffect(() => {
    loadHistory();
  }, [commitFlowActive]);

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
        flexGrow={1}
        padding={1}
        backgroundColor={isFocused ? "#131313" : "#0d0d0d"}
        scrollbarOptions={SCROLLBAR_OPTIONS}
        stickyScroll
        stickyStart="top"
      >
        {log.map((entry, i) => (
          <box
            key={entry.hash}
            flexDirection="column"
            marginBottom={1}
            backgroundColor={isFocused && i === historyIndex ? "#1f2937" : undefined}
          >
            <text fg="#4d4d4d">
              {entry.hash.slice(0, 7)} {new Date(entry.date).toLocaleDateString()}
            </text>
            <text fg="#8a8a8a">{entry.message}</text>
          </box>
        ))}
      </scrollbox>
    </box>
  );
}
