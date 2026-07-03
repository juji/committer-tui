import type { ScrollBoxRenderable } from "@opentui/core";
import { useRef } from "react";
import { getScrollbarOptions } from "@/lib/globals";
import { CommitFileList } from "./commit";
import { useCommitFlowStore } from "./commit/store";
import { useAppScreenStore } from "@/components/app/store";
import { HistoryEntryView } from "./history";
import { useThemeStore } from "@/store/theme-store";

export function Main() {
  const theme = useThemeStore((s) => s.theme);
  const commitFlowActive = useCommitFlowStore((s) => s.active);
  const viewingCommit = useAppScreenStore((s) => s.viewingCommit);
  const focusArea = useAppScreenStore((s) => s.focusArea);
  const isFocused = focusArea === "main";
  const scrollRef = useRef<ScrollBoxRenderable>(null);

  return (
    <scrollbox
      id="main-area"
      ref={scrollRef}
      flexGrow={1}
      padding={1}
      scrollbarOptions={getScrollbarOptions()}
      backgroundColor={isFocused ? theme.bg.surface : theme.bg.base}
      focused={isFocused}
    >
      {viewingCommit && <HistoryEntryView />}
      {!viewingCommit && commitFlowActive && <CommitFileList scrollRef={scrollRef} />}
    </scrollbox>
  );
}
